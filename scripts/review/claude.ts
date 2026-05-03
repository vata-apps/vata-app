import Anthropic from '@anthropic-ai/sdk';
import {
  DROP_COMMENT_TOOL,
  DropCommentInput,
  EVALUATE_REPLY_TOOL,
  EvaluateReplyInput,
  KEEP_COMMENT_TOOL,
  KeepCommentInput,
  POST_REVIEW_COMMENT_TOOL,
  PostReviewCommentInput,
  SUBMIT_ORCHESTRATION_TOOL,
  SUBMIT_REVIEW_VERDICT_TOOL,
  SubmitOrchestrationInput,
  SubmitReviewVerdictInput,
  type Severity,
} from './tools.ts';

const MODEL = process.env.CLAUDE_REVIEW_MODEL ?? 'claude-sonnet-4-6';
const MAX_TOKENS = 8192;
const MAX_ITERATIONS = 12;
const MAX_COMMENTS_PER_FILE = 10;
const ORCHESTRATOR_MAX_ITERATIONS = 3;
const ORCHESTRATOR_MAX_TOKENS = 4096;

export interface ReviewerInput {
  reviewerName: string;
  reviewerContext: string;
  diff: string;
  changedFiles: readonly string[];
  systemPromptTemplate: string;
}

export interface ReviewerOutput {
  reviewerName: string;
  comments: PostReviewCommentInput[];
  verdict: SubmitReviewVerdictInput | null;
  iterations: number;
  truncated: boolean;
}

export function makeAnthropic(apiKey: string): Anthropic {
  return new Anthropic({ apiKey });
}

export async function runReviewer(
  client: Anthropic,
  input: ReviewerInput
): Promise<ReviewerOutput> {
  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: input.systemPromptTemplate,
      cache_control: { type: 'ephemeral' },
    },
    {
      type: 'text',
      text: `# Active reviewer: ${input.reviewerName}\n\n${input.reviewerContext}`,
      cache_control: { type: 'ephemeral' },
    },
  ];

  const userText = [
    `Changed files matched by this reviewer (${input.changedFiles.length}):`,
    ...input.changedFiles.map((f) => `- ${f}`),
    '',
    'Diff to review (only these hunks — do not invent context outside the diff):',
    '```diff',
    input.diff,
    '```',
    '',
    'Use post_review_comment for each finding (max 10 per file). Then call submit_review_verdict exactly once.',
  ].join('\n');

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userText }];

  const collected: PostReviewCommentInput[] = [];
  const perFileCount = new Map<string, number>();
  let verdict: SubmitReviewVerdictInput | null = null;
  let truncated = false;
  let iterations = 0;

  while (iterations < MAX_ITERATIONS && verdict === null) {
    iterations++;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemBlocks,
      tools: [POST_REVIEW_COMMENT_TOOL, SUBMIT_REVIEW_VERDICT_TOOL],
      tool_choice: { type: 'auto' },
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;

      if (block.name === 'post_review_comment') {
        const parsed = PostReviewCommentInput.safeParse(block.input);
        if (!parsed.success) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            is_error: true,
            content: `Invalid input: ${parsed.error.message}`,
          });
          continue;
        }
        const count = perFileCount.get(parsed.data.path) ?? 0;
        if (count >= MAX_COMMENTS_PER_FILE) {
          truncated = true;
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            is_error: true,
            content: `Comment cap (${MAX_COMMENTS_PER_FILE}) reached for ${parsed.data.path}. Move on or call submit_review_verdict.`,
          });
          continue;
        }
        collected.push(parsed.data);
        perFileCount.set(parsed.data.path, count + 1);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: 'ok',
        });
      } else if (block.name === 'submit_review_verdict') {
        const parsed = SubmitReviewVerdictInput.safeParse(block.input);
        if (!parsed.success) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            is_error: true,
            content: `Invalid input: ${parsed.error.message}`,
          });
          continue;
        }
        verdict = parsed.data;
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: 'ok',
        });
      } else {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          is_error: true,
          content: `Unknown tool: ${block.name}`,
        });
      }
    }

    if (toolResults.length === 0) {
      break;
    }

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });
  }

  if (verdict === null && collected.length > 0) {
    verdict = {
      event: 'COMMENT',
      summary: `Posted ${collected.length} finding(s); reviewer hit the max-iterations cap before submitting an explicit verdict (severity ladder will determine the final review status).`,
    };
  }

  return {
    reviewerName: input.reviewerName,
    comments: collected,
    verdict,
    iterations,
    truncated,
  };
}

export interface ReplyEvaluationInput {
  systemPromptTemplate: string;
  originalCommentBody: string;
  ruleId: string | null;
  severity: string | null;
  codeContext: string;
  devReplyBody: string;
}

export async function runReplyEvaluation(
  client: Anthropic,
  input: ReplyEvaluationInput
): Promise<EvaluateReplyInput | null> {
  const userText = [
    '## Original review concern',
    `Rule: ${input.ruleId ?? '(unknown)'} · Severity: ${input.severity ?? '(unknown)'}`,
    '',
    input.originalCommentBody,
    '',
    '## Current code at the comment line',
    '```',
    input.codeContext,
    '```',
    '',
    "## Developer's reply",
    input.devReplyBody,
    '',
    'Call evaluate_reply exactly once.',
  ].join('\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: input.systemPromptTemplate,
        cache_control: { type: 'ephemeral' },
      },
    ],
    tools: [EVALUATE_REPLY_TOOL],
    tool_choice: { type: 'tool', name: 'evaluate_reply' },
    messages: [{ role: 'user', content: userText }],
  });

  for (const block of response.content) {
    if (block.type === 'tool_use' && block.name === 'evaluate_reply') {
      const parsed = EvaluateReplyInput.safeParse(block.input);
      if (parsed.success) return parsed.data;
    }
  }
  return null;
}

export interface OrchestratorFinding {
  reviewer: string;
  path: string;
  line: number;
  severity: Severity;
  ruleId: string;
  body: string;
}

export interface OrchestratorInput {
  systemPromptTemplate: string;
  findings: readonly OrchestratorFinding[];
  diffSummary: string;
}

export interface OrchestratorDecision {
  index: number;
  reason: string;
}

export interface OrchestratorOutput {
  keptIndices: number[];
  droppedIndices: OrchestratorDecision[];
  summary: string;
}

export async function runOrchestrator(
  client: Anthropic,
  input: OrchestratorInput
): Promise<OrchestratorOutput> {
  const findingsText = input.findings
    .map(
      (f, i) =>
        `[${i}] ${f.reviewer}:${f.ruleId} severity=${f.severity} ${f.path}:${f.line}\n    ${f.body.replace(/\n/g, ' ').slice(0, 200)}`
    )
    .join('\n\n');

  const userText = [
    `## Findings to orchestrate (${input.findings.length} total)`,
    '',
    findingsText,
    '',
    '## Diff summary',
    input.diffSummary,
    '',
    'For EACH finding [0..N-1], call exactly one of: keep_comment(index) or drop_comment(index, reason).',
    'Then call submit_orchestration(summary) exactly once.',
  ].join('\n');

  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userText }];

  const decisions = new Map<number, { kept: boolean; reason: string }>();
  let summary: string | null = null;
  let iterations = 0;

  while (iterations < ORCHESTRATOR_MAX_ITERATIONS && summary === null) {
    iterations++;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: ORCHESTRATOR_MAX_TOKENS,
      system: [
        {
          type: 'text',
          text: input.systemPromptTemplate,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: [KEEP_COMMENT_TOOL, DROP_COMMENT_TOOL, SUBMIT_ORCHESTRATION_TOOL],
      tool_choice: { type: 'auto' },
      messages,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== 'tool_use') continue;

      if (block.name === 'keep_comment' || block.name === 'drop_comment') {
        const Schema = block.name === 'keep_comment' ? KeepCommentInput : DropCommentInput;
        const parsed = Schema.safeParse(block.input);
        if (!parsed.success) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            is_error: true,
            content: `Invalid input: ${parsed.error.message}`,
          });
          continue;
        }
        const { index } = parsed.data;
        if (index < 0 || index >= input.findings.length) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            is_error: true,
            content: `Index ${index} out of range (have ${input.findings.length} findings).`,
          });
          continue;
        }
        if (decisions.has(index)) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            is_error: true,
            content: `Index ${index} already decided. Each finding gets exactly one decision.`,
          });
          continue;
        }
        decisions.set(index, {
          kept: block.name === 'keep_comment',
          reason: parsed.data.reason ?? '',
        });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: 'ok',
        });
      } else if (block.name === 'submit_orchestration') {
        const parsed = SubmitOrchestrationInput.safeParse(block.input);
        if (!parsed.success) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            is_error: true,
            content: `Invalid input: ${parsed.error.message}`,
          });
          continue;
        }
        const missing: number[] = [];
        for (let i = 0; i < input.findings.length; i++) {
          if (!decisions.has(i)) missing.push(i);
        }
        if (missing.length > 0) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            is_error: true,
            content: `Cannot submit yet — undecided findings: ${missing.join(', ')}.`,
          });
          continue;
        }
        summary = parsed.data.summary;
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: 'ok',
        });
      } else {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          is_error: true,
          content: `Unknown tool: ${block.name}`,
        });
      }
    }

    if (toolResults.length === 0) break;

    messages.push({ role: 'assistant', content: response.content });
    messages.push({ role: 'user', content: toolResults });
  }

  if (summary === null) {
    throw new Error(`Orchestrator did not submit after ${iterations} iteration(s)`);
  }

  const keptIndices: number[] = [];
  const droppedIndices: OrchestratorDecision[] = [];
  for (const [index, decision] of decisions) {
    if (decision.kept) keptIndices.push(index);
    else droppedIndices.push({ index, reason: decision.reason });
  }

  return { keptIndices, droppedIndices, summary };
}

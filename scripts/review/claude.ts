import Anthropic from '@anthropic-ai/sdk';
import {
  EVALUATE_REPLY_TOOL,
  EvaluateReplyInput,
  POST_REVIEW_COMMENT_TOOL,
  PostReviewCommentInput,
  SUBMIT_REVIEW_VERDICT_TOOL,
  SubmitReviewVerdictInput,
} from './tools.ts';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 8192;
const MAX_ITERATIONS = 6;
const MAX_COMMENTS_PER_FILE = 10;

export interface PersonaReviewInput {
  personaName: string;
  personaContext: string;
  diff: string;
  changedFiles: readonly string[];
  systemPromptTemplate: string;
}

export interface PersonaReviewOutput {
  personaName: string;
  comments: PostReviewCommentInput[];
  verdict: SubmitReviewVerdictInput | null;
  iterations: number;
  truncated: boolean;
}

export function makeAnthropic(apiKey: string): Anthropic {
  return new Anthropic({ apiKey });
}

export async function runPersonaReview(
  client: Anthropic,
  input: PersonaReviewInput
): Promise<PersonaReviewOutput> {
  const systemBlocks: Anthropic.TextBlockParam[] = [
    {
      type: 'text',
      text: input.systemPromptTemplate,
      cache_control: { type: 'ephemeral' },
    },
    {
      type: 'text',
      text: `# Active persona: ${input.personaName}\n\n${input.personaContext}`,
      cache_control: { type: 'ephemeral' },
    },
  ];

  const userText = [
    `Changed files matched by this persona (${input.changedFiles.length}):`,
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

  return {
    personaName: input.personaName,
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

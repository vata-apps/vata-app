import type Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

export const Severity = z.enum(['critical', 'high', 'medium', 'low', 'nit']);
export type Severity = z.infer<typeof Severity>;

export const Side = z.enum(['LEFT', 'RIGHT']);
export type Side = z.infer<typeof Side>;

export const ReviewEvent = z.enum(['APPROVE', 'REQUEST_CHANGES', 'COMMENT']);
export type ReviewEvent = z.infer<typeof ReviewEvent>;

export const ReplyDecision = z.enum(['RESOLVED', 'PUSHBACK', 'ACKNOWLEDGE']);
export type ReplyDecision = z.infer<typeof ReplyDecision>;

const MAX_BODY_CHARS = 500;

export const PostReviewCommentInput = z.object({
  path: z.string().min(1),
  line: z.number().int().positive(),
  side: Side.default('RIGHT'),
  startLine: z.number().int().positive().optional(),
  severity: Severity,
  ruleId: z.string().min(1),
  body: z.string().min(1).max(MAX_BODY_CHARS),
});
export type PostReviewCommentInput = z.infer<typeof PostReviewCommentInput>;

export const SubmitReviewVerdictInput = z.object({
  event: ReviewEvent,
  summary: z.string().min(1).max(2000),
});
export type SubmitReviewVerdictInput = z.infer<typeof SubmitReviewVerdictInput>;

export const EvaluateReplyInput = z
  .object({
    decision: ReplyDecision,
    reasoning: z.string().min(1).max(1000),
    replyBody: z.string().min(1).max(MAX_BODY_CHARS).optional(),
  })
  .refine((d) => d.decision !== 'PUSHBACK' || (d.replyBody?.length ?? 0) > 0, {
    message: 'replyBody is required when decision is PUSHBACK',
    path: ['replyBody'],
  });
export type EvaluateReplyInput = z.infer<typeof EvaluateReplyInput>;

export const POST_REVIEW_COMMENT_TOOL: Anthropic.Tool = {
  name: 'post_review_comment',
  description:
    'Post one inline review comment anchored to a line in the diff. ' +
    'Call this once per finding. Cap: 10 comments per file. ' +
    'Body must be <=500 chars; cite ruleId rather than quoting the full rule.',
  input_schema: {
    type: 'object',
    required: ['path', 'line', 'side', 'severity', 'ruleId', 'body'],
    properties: {
      path: {
        type: 'string',
        description: 'Repo-relative file path that appears in the diff.',
      },
      line: {
        type: 'number',
        description:
          'Line number on the chosen side of the diff. Use the new file line for side=RIGHT.',
      },
      side: {
        type: 'string',
        enum: ['LEFT', 'RIGHT'],
        description: 'RIGHT for the new file (almost always). LEFT for deleted lines.',
      },
      startLine: {
        type: 'number',
        description: 'Optional: first line of a multi-line comment. Omit for single-line.',
      },
      severity: {
        type: 'string',
        enum: ['critical', 'high', 'medium', 'low', 'nit'],
        description:
          'critical=data loss/security, high=standards violation, medium=maintainability, low=minor, nit=style.',
      },
      ruleId: {
        type: 'string',
        description:
          "Stable identifier for the rule (e.g. 'sqlite-no-select-star'). Used for dedup across re-reviews.",
      },
      body: {
        type: 'string',
        description: 'Markdown comment, max 500 chars. Cite ruleId, not the full rule text.',
      },
    },
  },
};

export const SUBMIT_REVIEW_VERDICT_TOOL: Anthropic.Tool = {
  name: 'submit_review_verdict',
  description:
    "Call ONCE at the end with this reviewer's verdict. The orchestrator computes the final review status from severity counts; your event is a hint, not authoritative.",
  input_schema: {
    type: 'object',
    required: ['event', 'summary'],
    properties: {
      event: {
        type: 'string',
        enum: ['APPROVE', 'REQUEST_CHANGES', 'COMMENT'],
        description: 'Hint for the final review event.',
      },
      summary: {
        type: 'string',
        description: '1-2 sentences explaining what this reviewer checked and what it found.',
      },
    },
  },
};

export const EVALUATE_REPLY_TOOL: Anthropic.Tool = {
  name: 'evaluate_reply',
  description:
    "Decide whether the developer's reply addresses the original review concern. Call exactly once.",
  input_schema: {
    type: 'object',
    required: ['decision', 'reasoning'],
    properties: {
      decision: {
        type: 'string',
        enum: ['RESOLVED', 'PUSHBACK', 'ACKNOWLEDGE'],
        description:
          'RESOLVED: concern addressed, mark thread resolved. PUSHBACK: concern stands, post follow-up. ACKNOWLEDGE: dev acknowledged but no action needed.',
      },
      reasoning: {
        type: 'string',
        description: "1-2 sentence justification grounded in the current code and the dev's reply.",
      },
      replyBody: {
        type: 'string',
        description: 'Required only when decision=PUSHBACK. Markdown, max 500 chars.',
      },
    },
  },
};

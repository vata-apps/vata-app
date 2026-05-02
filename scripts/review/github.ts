import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';
import type { PostReviewCommentInput, ReviewEvent } from './tools.ts';

export interface RepoContext {
  owner: string;
  repo: string;
  prNumber: number;
}

export interface ReviewCommentSummary {
  id: number;
  path: string;
  line: number | null;
  body: string;
  userLogin: string;
  inReplyToId: number | null;
}

export interface IssueCommentSummary {
  id: number;
  body: string;
  userLogin: string;
}

export interface ReviewThreadSummary {
  threadId: string;
  isResolved: boolean;
  isOutdated: boolean;
}

export function parseRepo(repoSlug: string): { owner: string; repo: string } {
  const [owner, repo] = repoSlug.split('/', 2);
  if (!owner || !repo) {
    throw new Error(`Invalid REPO format: ${repoSlug} (expected owner/repo)`);
  }
  return { owner, repo };
}

export function makeOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}

export function makeGraphql(token: string) {
  return graphql.defaults({
    headers: { authorization: `token ${token}` },
  });
}

export async function listReviewComments(
  octokit: Octokit,
  ctx: RepoContext
): Promise<ReviewCommentSummary[]> {
  const { owner, repo, prNumber } = ctx;
  const all = await octokit.paginate(octokit.rest.pulls.listReviewComments, {
    owner,
    repo,
    pull_number: prNumber,
    per_page: 100,
  });
  return all.map((c) => ({
    id: c.id,
    path: c.path,
    line: c.line ?? null,
    body: c.body,
    userLogin: c.user?.login ?? '',
    inReplyToId: c.in_reply_to_id ?? null,
  }));
}

export async function listIssueComments(
  octokit: Octokit,
  ctx: RepoContext
): Promise<IssueCommentSummary[]> {
  const { owner, repo, prNumber } = ctx;
  const all = await octokit.paginate(octokit.rest.issues.listComments, {
    owner,
    repo,
    issue_number: prNumber,
    per_page: 100,
  });
  return all.map((c) => ({
    id: c.id,
    body: c.body ?? '',
    userLogin: c.user?.login ?? '',
  }));
}

export async function createReview(
  octokit: Octokit,
  ctx: RepoContext,
  args: {
    body: string;
    event: ReviewEvent;
    comments: PostReviewCommentInput[];
    commitSha: string;
  }
): Promise<void> {
  const { owner, repo, prNumber } = ctx;
  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    commit_id: args.commitSha,
    body: args.body,
    event: args.event,
    comments: args.comments.map((c) => ({
      path: c.path,
      line: c.line,
      side: c.side,
      ...(c.startLine !== undefined && {
        start_line: c.startLine,
        start_side: c.side,
      }),
      body: c.body,
    })),
  });
}

export async function upsertIssueComment(
  octokit: Octokit,
  ctx: RepoContext,
  args: { body: string; existingId: number | null }
): Promise<void> {
  const { owner, repo, prNumber } = ctx;
  if (args.existingId === null) {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: args.body,
    });
  } else {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: args.existingId,
      body: args.body,
    });
  }
}

export async function getReviewComment(
  octokit: Octokit,
  ctx: Pick<RepoContext, 'owner' | 'repo'>,
  commentId: number
): Promise<ReviewCommentSummary> {
  const { data } = await octokit.rest.pulls.getReviewComment({
    owner: ctx.owner,
    repo: ctx.repo,
    comment_id: commentId,
  });
  return {
    id: data.id,
    path: data.path,
    line: data.line ?? null,
    body: data.body,
    userLogin: data.user?.login ?? '',
    inReplyToId: data.in_reply_to_id ?? null,
  };
}

export async function replyToReviewComment(
  octokit: Octokit,
  ctx: RepoContext,
  args: { commentId: number; body: string }
): Promise<void> {
  const { owner, repo, prNumber } = ctx;
  await octokit.rest.pulls.createReplyForReviewComment({
    owner,
    repo,
    pull_number: prNumber,
    comment_id: args.commentId,
    body: args.body,
  });
}

interface ReviewThreadsQuery {
  repository: {
    pullRequest: {
      reviewThreads: {
        nodes: Array<{
          id: string;
          isResolved: boolean;
          isOutdated: boolean;
          comments: { nodes: Array<{ databaseId: number }> };
        }>;
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };
  };
}

export async function findReviewThread(
  gql: ReturnType<typeof makeGraphql>,
  ctx: RepoContext,
  reviewCommentId: number
): Promise<ReviewThreadSummary | null> {
  const { owner, repo, prNumber } = ctx;
  let cursor: string | null = null;
  for (;;) {
    const result: ReviewThreadsQuery = await gql<ReviewThreadsQuery>(
      `
      query ($owner: String!, $repo: String!, $pr: Int!, $cursor: String) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $pr) {
            reviewThreads(first: 50, after: $cursor) {
              nodes {
                id
                isResolved
                isOutdated
                comments(first: 100) {
                  nodes { databaseId }
                }
              }
              pageInfo { hasNextPage endCursor }
            }
          }
        }
      }
      `,
      { owner, repo, pr: prNumber, cursor }
    );

    const threads = result.repository.pullRequest.reviewThreads;
    for (const thread of threads.nodes) {
      const matches = thread.comments.nodes.some(
        (c: { databaseId: number }) => c.databaseId === reviewCommentId
      );
      if (matches) {
        return {
          threadId: thread.id,
          isResolved: thread.isResolved,
          isOutdated: thread.isOutdated,
        };
      }
    }
    if (!threads.pageInfo.hasNextPage) return null;
    cursor = threads.pageInfo.endCursor;
  }
}

export async function resolveReviewThread(
  gql: ReturnType<typeof makeGraphql>,
  threadId: string
): Promise<void> {
  await gql(
    `
    mutation ($threadId: ID!) {
      resolveReviewThread(input: { threadId: $threadId }) {
        thread { id isResolved }
      }
    }
    `,
    { threadId }
  );
}

import { notFound } from '@tanstack/react-router';
import type { RenderedResponse } from '@dropinblog/react-core';
import { createStartServerClient } from './server-client';
import type { StartDropInBlogConfig, StartServerClient } from './types';

export type BlogRequest =
  | { kind: 'main'; page: number }
  | { kind: 'category'; slug: string; page: number }
  | { kind: 'author'; slug: string; page: number }
  | { kind: 'post'; slug: string };

function parsePage(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const page = parseInt(value, 10);
  return page >= 1 ? page : null;
}

/**
 * Pure mapping from a splat path (everything after `/blog/`) to the blog request
 * it represents. Returns `null` for paths that don't match any known shape so the
 * caller can surface a 404. This holds the routing logic and is unit-tested in
 * isolation — it never touches the network or environment.
 *
 *   ''                              -> main list, page 1
 *   'page/2'                        -> main list, page 2
 *   'category/news'                 -> category 'news', page 1
 *   'category/news/page/2'          -> category 'news', page 2
 *   'author/jane'                   -> author 'jane', page 1
 *   'author/jane/page/2'            -> author 'jane', page 2
 *   'my-post-slug'                  -> single post
 */
export function matchBlogRequest(splat: string | undefined): BlogRequest | null {
  const parts = (splat ?? '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { kind: 'main', page: 1 };
  }

  if (parts.length === 2 && parts[0] === 'page') {
    const page = parsePage(parts[1]);
    return page === null ? null : { kind: 'main', page };
  }

  if (parts.length === 2 && parts[0] === 'category') {
    return { kind: 'category', slug: parts[1], page: 1 };
  }

  if (parts.length === 4 && parts[0] === 'category' && parts[2] === 'page') {
    const page = parsePage(parts[3]);
    return page === null ? null : { kind: 'category', slug: parts[1], page };
  }

  if (parts.length === 2 && parts[0] === 'author') {
    return { kind: 'author', slug: parts[1], page: 1 };
  }

  if (parts.length === 4 && parts[0] === 'author' && parts[2] === 'page') {
    const page = parsePage(parts[3]);
    return page === null ? null : { kind: 'author', slug: parts[1], page };
  }

  if (parts.length === 1) {
    return { kind: 'post', slug: parts[0] };
  }

  return null;
}

function executeBlogRequest(
  client: StartServerClient,
  request: BlogRequest
): Promise<RenderedResponse> {
  switch (request.kind) {
    case 'main':
      return client.fetchMainList(request.page);
    case 'category':
      return client.fetchCategory(request.slug, request.page);
    case 'author':
      return client.fetchAuthor(request.slug, request.page);
    case 'post':
      return client.fetchPost(request.slug);
  }
}

/**
 * Resolves a splat path to its rendered blog payload. Intended to be called from
 * a server function (see the installed `-data.ts` template) so the API token
 * stays server-only. Throws TanStack `notFound()` for unrecognized paths.
 */
export async function resolveBlogData(
  splat: string | undefined,
  config?: StartDropInBlogConfig
): Promise<RenderedResponse> {
  const request = matchBlogRequest(splat);
  if (!request) {
    throw notFound();
  }
  const client = createStartServerClient(config);
  try {
    return await executeBlogRequest(client, request);
  } catch (error) {
    // The rendered API returns 404 for missing posts/categories/authors. Convert
    // that into a TanStack `notFound()` so the route shows its notFoundComponent
    // instead of crashing into the errorComponent. Other failures propagate.
    if (isApiNotFoundError(error)) {
      throw notFound();
    }
    throw error;
  }
}

/**
 * Detects a 404 thrown by the core DropInBlog client. The client throws
 * `Error('DropInBlog request failed (404): ...')` for any non-ok response, so we
 * key off the status in the message.
 */
export function isApiNotFoundError(error: unknown): boolean {
  return error instanceof Error && /\(404\)/.test(error.message);
}

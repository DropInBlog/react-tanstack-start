import { describe, expect, it } from 'vitest';
import { matchBlogRequest, isApiNotFoundError } from '../src/blog-data';

describe('matchBlogRequest', () => {
  it('maps the empty splat to the main list, page 1', () => {
    expect(matchBlogRequest('')).toEqual({ kind: 'main', page: 1 });
    expect(matchBlogRequest(undefined)).toEqual({ kind: 'main', page: 1 });
  });

  it('handles main list pagination', () => {
    expect(matchBlogRequest('page/2')).toEqual({ kind: 'main', page: 2 });
  });

  it('handles category and category pagination', () => {
    expect(matchBlogRequest('category/news')).toEqual({ kind: 'category', slug: 'news', page: 1 });
    expect(matchBlogRequest('category/news/page/3')).toEqual({ kind: 'category', slug: 'news', page: 3 });
  });

  it('handles author and author pagination', () => {
    expect(matchBlogRequest('author/jane')).toEqual({ kind: 'author', slug: 'jane', page: 1 });
    expect(matchBlogRequest('author/jane/page/4')).toEqual({ kind: 'author', slug: 'jane', page: 4 });
  });

  it('maps a single segment to a post', () => {
    expect(matchBlogRequest('my-first-post')).toEqual({ kind: 'post', slug: 'my-first-post' });
  });

  it('tolerates leading/trailing slashes', () => {
    expect(matchBlogRequest('/category/news/')).toEqual({ kind: 'category', slug: 'news', page: 1 });
  });

  it('returns null for non-numeric or zero page numbers', () => {
    expect(matchBlogRequest('page/abc')).toBeNull();
    expect(matchBlogRequest('page/0')).toBeNull();
    expect(matchBlogRequest('category/news/page/x')).toBeNull();
  });

  it('returns null for unrecognized shapes', () => {
    expect(matchBlogRequest('a/b/c')).toBeNull();
    expect(matchBlogRequest('category/news/extra/page/2')).toBeNull();
  });
});

describe('isApiNotFoundError', () => {
  it('detects a 404 thrown by the core client', () => {
    const err = new Error(
      'DropInBlog request failed (404): {"success":false,"code":1002,"message":"Post not found"}'
    );
    expect(isApiNotFoundError(err)).toBe(true);
  });

  it('does not treat other failures as not-found', () => {
    expect(isApiNotFoundError(new Error('DropInBlog request failed (500): boom'))).toBe(false);
    expect(isApiNotFoundError(new Error('network down'))).toBe(false);
    expect(isApiNotFoundError('nope')).toBe(false);
  });
});

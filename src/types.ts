import type { DropInBlogConfig, RenderedResponse } from '@dropinblog/react-core';

export interface StartServerClient {
  fetchMainList(page?: number): Promise<RenderedResponse>;
  fetchCategory(slug: string, page?: number): Promise<RenderedResponse>;
  fetchAuthor(slug: string, page?: number): Promise<RenderedResponse>;
  fetchPost(slug: string): Promise<RenderedResponse>;
  fetchSitemap(): Promise<RenderedResponse>;
  fetchFeed(): Promise<RenderedResponse>;
  fetchCategoryFeed(slug: string): Promise<RenderedResponse>;
  fetchAuthorFeed(slug: string): Promise<RenderedResponse>;
}

export interface StartDropInBlogConfig extends DropInBlogConfig {
  blogBaseUrl?: string;
  /**
   * The public URL of the blog index (origin + base path, e.g.
   * `https://example.com/blog`). Sent to the rendered API as `blogurl` so it
   * generates pretty permalinks (`/blog/slug`) instead of legacy `?p=slug`
   * links. In the browser the core client derives this from
   * `window.location`, but during SSR there is no window, so the adapter
   * supplies it from the incoming request. Falls back to the
   * `DROPINBLOG_BLOG_URL` environment variable.
   */
  blogUrl?: string;
}

export interface HeadOptionsProps {
  data: RenderedResponse;
  blogBaseUrl?: string;
}

export interface TanStackMetaDescriptor {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
  charSet?: string;
  [key: string]: string | undefined;
}

export interface TanStackLinkDescriptor {
  rel?: string;
  href?: string;
  type?: string;
  [key: string]: string | undefined;
}

export interface TanStackStyleDescriptor {
  children: string;
  media?: string;
  [key: string]: string | undefined;
}

export interface TanStackScriptDescriptor {
  src?: string;
  children?: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface HeadOptions {
  title?: string;
  meta?: TanStackMetaDescriptor[];
  links?: TanStackLinkDescriptor[];
  styles?: TanStackStyleDescriptor[];
  scripts?: TanStackScriptDescriptor[];
}

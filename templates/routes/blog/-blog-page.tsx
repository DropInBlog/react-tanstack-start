import { Link } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { DropInBlogContent } from '@dropinblog/react-core';
import type { RenderedResponse } from '@dropinblog/react-core';

/**
 * Renders the server-rendered blog HTML. `DropInBlogContent` injects the body
 * HTML and executes any inline scripts it contains. SEO tags, inline styles and
 * external scripts are emitted from each route's `head()` (see index.tsx / $.tsx)
 * and rendered by <HeadContent /> and <Scripts /> in your __root.tsx.
 *
 * This file lives in your app so you can wrap it with your own layout, classes,
 * or container element.
 */
export function BlogPage({ data }: { data: RenderedResponse }) {
  return <DropInBlogContent bodyHtml={data.body_html ?? ''} />;
}

/**
 * Shown when a post/category/author isn't found (the rendered API returned 404,
 * which the adapter converts into a TanStack notFound()). Customize the markup
 * to match your site.
 */
export function BlogNotFound() {
  return (
    <div className="blog-message">
      <h1>Post not found</h1>
      <p>The article you’re looking for doesn’t exist or may have been moved.</p>
      <p>
        <Link to="/blog">← Back to the blog</Link>
      </p>
    </div>
  );
}

/**
 * Shown for unexpected failures (network, bad credentials, API 5xx). The raw
 * error is only revealed during development — in production visitors see a
 * friendly message instead of the underlying API payload.
 */
export function BlogError({ error }: ErrorComponentProps) {
  return (
    <div className="blog-message">
      <h1>Something went wrong</h1>
      <p>We couldn’t load the blog right now. Please try again later.</p>
      {import.meta.env.DEV && error instanceof Error ? (
        <pre className="blog-error-detail">{error.message}</pre>
      ) : null}
    </div>
  );
}

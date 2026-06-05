# @dropinblog/react-tanstack-start

TanStack Start adapter for [@dropinblog/react-core](https://www.npmjs.com/package/@dropinblog/react-core) with server-side rendering support.

## Features

- Full server-side rendering (SSR) support
- Pre-built file-based route templates
- SEO-optimized with TanStack Router's `head()` API
- RSS feeds and XML sitemap included
- Support for React 18 and 19
- Easy CLI installation

## Installation

```bash
npm install @dropinblog/react-tanstack-start @dropinblog/react-core
```

## Quick Start

### 1. Configure Environment Variables

Create a `.env` file in your TanStack Start project. These are server-only, so do
not prefix them with `VITE_` (that would expose the API token to the browser):

```env
DROPINBLOG_BLOG_ID=your_dropinblog_blog_id
DROPINBLOG_API_TOKEN=your_dropinblog_api_token
```

### 2. Install Templates

Use the CLI to install the blog routes:

```bash
npx dropinblog-tanstack install
```

This will create all necessary blog routes in your project:

- `/blog` - Main blog list
- `/blog/page/{page}` - Paginated blog list
- `/blog/category/{slug}` - Category pages
- `/blog/category/{slug}/page/{page}` - Paginated category pages
- `/blog/author/{slug}` - Author pages
- `/blog/author/{slug}/page/{page}` - Paginated author pages
- `/blog/{slug}` - Single post pages
- `/blog/sitemap.xml` - Sitemap
- `/blog/feed` - RSS feed
- `/blog/feed/category/{slug}` - Category RSS feeds
- `/blog/feed/author/{slug}` - Author RSS feeds

To mount the blog at a different path (e.g. `/news`), pass `--path`:

```bash
npx dropinblog-tanstack install --path news
```

> Note: also set your blog's URL in DropInBlog. The path your app *responds* at is
> controlled by where the routes live (`--path`), but the permalinks, canonical
> tags, RSS, and sitemap inside the rendered HTML come from your blog's **Blog
> URL** setting in DropInBlog. For everything to line up, set that URL to match
> (e.g. `https://yoursite.com/news`).

### 3. Render `HeadContent` and `Scripts` in your root route

DropInBlog's SEO tags, styles and scripts are emitted from each route's `head()`.
For them to render, your root route (`src/routes/__root.tsx`) must render
`<HeadContent />` in the document `<head>` and `<Scripts />` at the end of
`<body>`:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  ),
});
```

The installer checks for these and warns if they're missing.

## License

MIT
# react-tanstack-start

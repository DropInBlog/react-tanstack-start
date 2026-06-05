import { createFileRoute } from '@tanstack/react-router';
import { createStartServerClient } from '@dropinblog/react-tanstack-start';

// Category RSS feed: /blog/feed/category/$slug
export const Route = createFileRoute('/blog/feed/category/$slug')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const origin = new URL(request.url).origin;
        const client = createStartServerClient({ blogUrl: `${origin}/blog` });
        const data = await client.fetchCategoryFeed(params.slug);
        const feedXml = (data as { feed?: string }).feed ?? data.body_html ?? '';

        return new Response(feedXml, {
          status: 200,
          headers: {
            'Content-Type': data.content_type ?? 'application/rss+xml',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});

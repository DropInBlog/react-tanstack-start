import { createFileRoute } from '@tanstack/react-router';
import { createStartServerClient } from '@dropinblog/react-tanstack-start';

// Author RSS feed: /blog/feed/author/$slug
export const Route = createFileRoute('/blog/feed/author/$slug')({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const origin = new URL(request.url).origin;
        const client = createStartServerClient({ blogUrl: `${origin}/blog` });
        const data = await client.fetchAuthorFeed(params.slug);
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

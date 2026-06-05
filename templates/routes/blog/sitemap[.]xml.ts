import { createFileRoute } from '@tanstack/react-router';
import { createStartServerClient } from '@dropinblog/react-tanstack-start';

// XML sitemap: /blog/sitemap.xml
// The `[.]` in the filename escapes the dot so it becomes a literal path
// segment rather than a flat-route separator.
export const Route = createFileRoute('/blog/sitemap.xml')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const client = createStartServerClient({ blogUrl: `${origin}/blog` });
        const data = await client.fetchSitemap();
        const sitemapXml = (data as { sitemap?: string }).sitemap ?? data.body_html ?? '';

        return new Response(sitemapXml, {
          status: 200,
          headers: {
            'Content-Type': data.content_type ?? 'application/xml',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      },
    },
  },
});

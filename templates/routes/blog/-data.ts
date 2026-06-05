import { createServerFn } from '@tanstack/react-start';
import { getRequestUrl } from '@tanstack/react-start/server';
import { resolveBlogData } from '@dropinblog/react-tanstack-start';

/**
 * Server function that fetches the rendered blog payload for a given splat path.
 *
 * It is defined here in your app's source (not inside the package) on purpose:
 * TanStack Start's Vite plugin only scans your project source for
 * `createServerFn` calls, and keeping it here guarantees the secret
 * DROPINBLOG_API_TOKEN never ships to the browser bundle. On the client, calling
 * `fetchBlogData(...)` becomes a fetch to your own server.
 *
 * We derive `blogUrl` from the incoming request and pass it through so the
 * rendered API returns pretty permalinks (/blog/slug) instead of legacy
 * (?p=slug) links. In the browser the core client gets this from
 * window.location, but during SSR there is no window. If your blog is mounted
 * somewhere other than /blog, change the path below to match.
 *
 * Note: very old versions of @tanstack/react-start named the input method
 * `.validator(...)` instead of `.inputValidator(...)`.
 */
export const fetchBlogData = createServerFn({ method: 'GET' })
  .inputValidator((splat: string) => splat)
  .handler(({ data }) => {
    const origin = new URL(getRequestUrl()).origin;
    return resolveBlogData(data, { blogUrl: `${origin}/blog` });
  });

import { createFileRoute } from '@tanstack/react-router';
import { getHeadOptions } from '@dropinblog/react-tanstack-start';
import { fetchBlogData } from './-data';
import { BlogPage, BlogError, BlogNotFound } from './-blog-page';

// Handles the bare /blog (main post list, page 1). Everything deeper than /blog
// is handled by the splat route in $.tsx.
export const Route = createFileRoute('/blog/')({
  loader: () => fetchBlogData({ data: '' }),
  head: ({ loaderData }) =>
    loaderData ? getHeadOptions({ data: loaderData, blogBaseUrl: '/blog' }) : {},
  component: RouteComponent,
  errorComponent: BlogError,
  notFoundComponent: BlogNotFound,
});

function RouteComponent() {
  const data = Route.useLoaderData();
  return <BlogPage data={data} />;
}

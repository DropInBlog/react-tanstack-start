import { createFileRoute } from '@tanstack/react-router';
import { getHeadOptions } from '@dropinblog/react-tanstack-start';
import { fetchBlogData } from './-data';
import { BlogPage, BlogError, BlogNotFound } from './-blog-page';

// Splat route: handles posts, pagination, categories and authors, e.g.
//   /blog/my-post
//   /blog/page/2
//   /blog/category/news            /blog/category/news/page/2
//   /blog/author/jane              /blog/author/jane/page/2
export const Route = createFileRoute('/blog/$')({
  // ?preview carries the token from the admin's Preview Post link for a draft or
  // scheduled post.
  validateSearch: (search: Record<string, unknown>): { preview?: string } =>
    typeof search.preview === 'string' ? { preview: search.preview } : {},
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: ({ params, deps }) =>
    fetchBlogData({ data: { splat: params._splat ?? '', preview: deps.preview } }),
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

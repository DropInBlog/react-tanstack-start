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
  loader: ({ params }) => fetchBlogData({ data: params._splat ?? '' }),
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

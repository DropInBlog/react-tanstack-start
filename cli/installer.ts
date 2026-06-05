import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

async function firstExisting(candidates: string[]): Promise<string | null> {
  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Normalizes a user-supplied mount path into a clean route segment.
 *   '/news/'      -> 'news'
 *   'company/news'-> 'company/news'
 *   ''            -> 'blog'
 */
function normalizeRoutePath(input: string): string {
  const trimmed = (input ?? '').trim().replace(/^\/+/, '').replace(/\/+$/, '');
  const segments = trimmed.split('/').filter(Boolean);
  return segments.length ? segments.join('/') : 'blog';
}

/**
 * Checks the app's __root route for the <HeadContent /> and <Scripts /> components.
 * They are required for SEO tags, styles and scripts to render, but editing the
 * root route automatically is risky, so we only detect and advise.
 */
async function checkRootRoute(targetDir: string): Promise<void> {
  const rootCandidates = [
    path.join(targetDir, 'src/routes/__root.tsx'),
    path.join(targetDir, 'src/routes/__root.jsx'),
    path.join(targetDir, 'app/routes/__root.tsx'),
  ];
  const rootFile = await firstExisting(rootCandidates);

  if (!rootFile) {
    console.log(
      chalk.yellow(
        '\n⚠  Could not find a __root route. Make sure your root route renders ' +
          '<HeadContent /> in <head> and <Scripts /> in <body>.'
      )
    );
    return;
  }

  const contents = await fs.readFile(rootFile, 'utf8');
  const hasHeadContent = contents.includes('HeadContent');
  const hasScripts = /<Scripts\b/.test(contents);

  if (hasHeadContent && hasScripts) {
    console.log(chalk.green(`✓ ${path.relative(targetDir, rootFile)} already renders <HeadContent /> and <Scripts />.`));
    return;
  }

  console.log(chalk.yellow(`\n⚠  Your root route (${path.relative(targetDir, rootFile)}) is missing required components:`));
  if (!hasHeadContent) {
    console.log('   • <HeadContent /> — render it inside <head>. Provides the blog SEO tags, title and styles.');
  }
  if (!hasScripts) {
    console.log('   • <Scripts /> — render it at the end of <body>. Provides the blog scripts.');
  }
  console.log('   Both are imported from "@tanstack/react-router".');
}

/**
 * Rewrites the default `/blog` mount path in every copied template file to the
 * chosen path. The templates only ever reference the mount path as the literal
 * `/blog` (route strings, blogUrl, the not-found Link), and the package imports
 * use `@dropinblog/...` (which contains `nblog/`, never `/blog`), so a literal
 * replace is safe and complete.
 */
async function rewriteRoutePath(dir: string, routePath: string): Promise<void> {
  const replacement = `/${routePath}`;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await rewriteRoutePath(fullPath, routePath);
      continue;
    }
    const contents = await fs.readFile(fullPath, 'utf8');
    if (contents.includes('/blog')) {
      await fs.writeFile(fullPath, contents.split('/blog').join(replacement));
    }
  }
}

export async function installTemplates(targetDir: string, routePathInput = 'blog'): Promise<void> {
  const routePath = normalizeRoutePath(routePathInput);
  console.log(chalk.blue(`Installing DropInBlog templates for TanStack Start at /${routePath}...`));

  const packageRoot = path.join(__dirname, '..');
  const templatesDir = await firstExisting([
    path.join(packageRoot, 'templates', 'routes', 'blog'),
    path.join(packageRoot, 'dist', 'templates', 'routes', 'blog'),
  ]);

  if (!templatesDir) {
    throw new Error('Templates directory not found. Did the package build successfully?');
  }

  const targetBlogDir = path.join(targetDir, 'src/routes', routePath);

  if (await fs.pathExists(targetBlogDir)) {
    console.log(chalk.yellow(`Warning: ${path.relative(targetDir, targetBlogDir)} already exists. It will be overwritten.`));
  }

  await fs.ensureDir(targetBlogDir);
  await fs.copy(templatesDir, targetBlogDir, { overwrite: true });

  if (routePath !== 'blog') {
    await rewriteRoutePath(targetBlogDir, routePath);
  }

  console.log(chalk.green(`✓ Templates installed to ${path.relative(targetDir, targetBlogDir)}`));

  await checkRootRoute(targetDir);

  console.log(chalk.cyan('\nNext steps:'));
  console.log('1. Install dependencies:');
  console.log('   npm install @dropinblog/react-tanstack-start @dropinblog/react-core');
  console.log('2. Add your DropInBlog credentials to .env (server-only — do NOT prefix with VITE_):');
  console.log('   DROPINBLOG_BLOG_ID=your-blog-id');
  console.log('   DROPINBLOG_API_TOKEN=your-api-token');
  console.log(`3. Start your dev server, then visit http://localhost:3000/${routePath}`);
}

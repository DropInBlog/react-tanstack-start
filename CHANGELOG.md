# Changelog

## 1.2.0

### Added

- Draft and scheduled post previews. The admin's "Preview Post" link adds
  `?preview=<token>`; the `/blog/$` route now reads it and passes it through
  `fetchBlogData` to `resolveBlogData(splat, config, { preview })`, which
  fetches the post uncached. Requires `@dropinblog/react-core` 1.2.0.

To get it, re-run `npx dropinblog-tanstack install` (it overwrites
`src/routes/blog`), or update `$.tsx`, `index.tsx` and `-data.ts` there to
match the new templates: `fetchBlogData` now takes `{ splat, preview }`.

## 1.1.1

### Fixed

- Blog routes returned 500 on `@tanstack/react-start` 1.169+ with
  `inputValidator is not a function`. 1.169.0 replaced
  `createServerFn().inputValidator()` with `.validator()`.
- The installed `-data.ts` now calls `.validator(...)`. On `@tanstack/react-start`
  below 1.169.0, the installer rewrites it to `.inputValidator(...)`, and it
  prints which one it used. When it can't find `@tanstack/react-start` in
  `node_modules`, it uses `.validator(...)` and prints a note.

If you installed the routes with 1.1.0 on 1.169+, change `.inputValidator` to
`.validator` in `src/routes/blog/-data.ts`, or re-run
`npx dropinblog-tanstack install`. Re-running overwrites `src/routes/blog`.

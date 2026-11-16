# Changelog

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

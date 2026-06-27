## Conventions
- Strict mode required in tsconfig: "strict": true.
- PascalCase for types, interfaces, classes, enums. camelCase for variables and functions.
- Explicit return types on all exported functions.
- Use interface for object shapes, type for unions and utility types.
- const by default, let only when reassignment is needed. Never var.

## Forbidden
- FORBIDDEN: any type — use unknown with type guards instead.
- FORBIDDEN: `as any` in production code — acceptable in test files only, with a comment.
- FORBIDDEN: non-null assertions (!) without a justified comment.
- FORBIDDEN: @ts-ignore or @ts-expect-error without explanation.
- FORBIDDEN: enum — use const object with as const instead.
- FORBIDDEN: implicit any in function parameters.
- FORBIDDEN: `console.log`, `console.warn`, `console.debug`, `console.info` in production code — remove before delivery or gate behind a dev-only logger.
- FORBIDDEN: inline `style={{}}` objects when the project uses CSS Modules or a utility-first CSS framework. The only exception is truly dynamic values computed at runtime (e.g., `style={{ width: `${percent}%` }}`).
- FORBIDDEN: `as Type` unsafe casts — use type guards (`isAxiosError(err)`, `instanceof`, discriminated unions) instead.

## Recommended Patterns
- Discriminated unions for state modeling.
- unknown over any for external data; narrow with type guards.
- readonly arrays and properties where mutation is unintended.
- Optional chaining (?.) and nullish coalescing (??).
- Zod or similar for runtime validation of external data.

## Error Handling
- Typed error classes extending Error.
- In async functions: try/catch with typed catch (error instanceof MyError).
- Consider Result<T, E> pattern for expected errors.
- Never swallow errors silently.
- IIFE async blocks (`(async () => { ... })()`) → MUST have try/catch. Unhandled rejections are silent.

## Testing
- Framework: Vitest (unit), Playwright (E2E).
- Mock modules with vi.mock().
- Test behavior, not implementation details.
- Test fixtures should be properly typed — avoid `as any` to bypass type checking.

## Common Pitfalls
- undefined vs null: pick one convention per project and be explicit.
- Async/await: forgetting await leads to unhandled promises — use no-floating-promises ESLint rule.
- Object.keys() returns string[], not keyof T — cast explicitly.
- Type widening: prefer explicit types over overly inferred wide types.
- `error.config` in Axios interceptors can be undefined (network error before request is sent) — guard before accessing.

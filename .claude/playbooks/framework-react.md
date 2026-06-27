## Conventions
- React 19. TypeScript strict mode. Functional components only.
- Component files: PascalCase. Hook files: camelCase prefixed with use.
- One component per file. No business logic in components — use hooks/services.
- Pages are compositions of components — no inline logic in page files.

## Project Structure
src/
  components/     # shared UI components
  features/       # feature-specific components + hooks
  hooks/          # shared custom hooks
  services/       # API calls
  stores/         # state management (Zustand)
  types/

## Forbidden
- FORBIDDEN: business logic in components — extract to hooks or services.
- FORBIDDEN: direct fetch() calls — always use service layer.
- FORBIDDEN: prop drilling beyond 2 levels — use context or state management.
- FORBIDDEN: `any` type in component props or production code.
- FORBIDDEN: hardcoded values in components — use constants or configuration.
- FORBIDDEN: inline `style={{}}` when the project uses CSS Modules (or equivalent styling convention). Dynamic values that depend on runtime data are the only exception — and even then, prefer CSS custom properties set via `style` over full inline style objects.
- FORBIDDEN: user-visible string literals in JSX when the project uses i18n — every visible string goes through the translation system.
- FORBIDDEN: `innerHTML` or `dangerouslySetInnerHTML` without DOMPurify sanitization.
- FORBIDDEN: `console.log`, `console.warn`, `console.debug` in production code — remove before delivery or gate behind a dev-only logger.
- FORBIDDEN: hooks or API calls inside `.map()`, `.forEach()`, or loops — this creates N+1 query patterns. Fetch data once in the parent, pass it down.
- FORBIDDEN: credentials, passwords, or debug-only data compiled into the production bundle — use `import.meta.env` with VITE_ prefix and tree-shakeable DEV guards.
- FORBIDDEN: more than 8 `useState` in a single component — refactor to `useReducer`, a custom hook, or extract sub-components.

## Required Patterns
- Error Boundaries: every route or major feature section MUST have an error boundary or fallback UI. A crash in one component must not take down the entire app.
- Lazy loading: use `React.lazy()` + `Suspense` for route-level code splitting. Heavy components that are not immediately visible should also be lazy loaded.
- Cleanup on unmount: every `useEffect` that creates timers, subscriptions, or connections MUST return a cleanup function. `setTimeout` and `setInterval` IDs must be cleared.
- Shared UI components (Button, Input, etc.) MUST have unit tests.

## Accessibility
- All interactive elements must be keyboard navigable (`tabIndex`, `onKeyDown` for custom elements).
- Use semantic HTML elements (button, nav, main, article) — not `div` with `onClick`.
- Loading spinners: `role="status"` and `aria-label`.
- Buttons in loading state: `aria-busy={true}`.
- ARIA attributes only when semantic HTML is insufficient.
- Color contrast: WCAG 2.1 AA minimum (4.5:1 text, 3:1 UI components).

## Performance
- Lighthouse target: 95+ overall, no metric below 90.
- Responsive design required. Mobile-first CSS.
- Avoid unnecessary re-renders: memoize with useMemo/useCallback only when profiled.
- Lazy load images and heavy components.

## Testing
- Vitest + React Testing Library. Test behavior, not implementation.
- Mock API calls with vi.mock() or MSW.

## Common Pitfalls
- useEffect dependency array: missing dependencies cause stale closures.
- Key prop: use stable unique IDs, never array index for dynamic lists.
- Controlled vs uncontrolled inputs: pick one approach per component.
- Non-reactive store access: `useStore.getState().value` does not trigger re-renders — use `useStore(s => s.value)` when reactivity is needed.
- CSS `line-height: none` is invalid — use `normal` or a numeric value.

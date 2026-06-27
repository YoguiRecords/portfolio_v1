## Conventions
- Next.js 15+. TypeScript strict mode. App Router (not Pages Router).
- Server Components by default. Add "use client" only when necessary.
- File-based routing: app/ directory. Colocate components with routes.
- Pages are compositions of components — no inline logic.

## Project Structure
app/
  (routes)/
    page.tsx       # Server Component
    layout.tsx
    loading.tsx
    error.tsx
  components/      # shared components
  lib/             # utilities, server actions
  services/        # API/data fetching

## Forbidden
- FORBIDDEN: "use client" on layout or page files without strong justification.
- FORBIDDEN: client-side data fetching for data that can be fetched server-side.
- FORBIDDEN: getServerSideProps / getStaticProps (Pages Router patterns).
- FORBIDDEN: exposing server-only secrets to client components.

## Recommended Patterns
- Server Components for data fetching — no client-side fetch for initial data.
- Server Actions for form submissions and mutations.
- Streaming with Suspense for progressive loading.
- next/image for all images (automatic optimization).
- next/font for font loading (no layout shift).

## Accessibility
- Semantic HTML in all components.
- WCAG 2.1 AA color contrast.
- Keyboard navigation for all interactive elements.

## Performance
- Lighthouse target: 95+ overall, no metric below 90.
- Mobile-first responsive design.
- Core Web Vitals: target LCP < 2.5s, CLS < 0.1, INP < 200ms.
- Route-based code splitting is automatic — leverage it.
- Use next/dynamic for client-side heavy components.

## Testing
- Vitest + React Testing Library for unit tests.
- Playwright for E2E tests.

## Common Pitfalls
- Importing server-only code in client components: causes build errors.
- Missing loading.tsx: no Suspense boundary = blocking render.
- Over-using "use client": defeats server rendering benefits.

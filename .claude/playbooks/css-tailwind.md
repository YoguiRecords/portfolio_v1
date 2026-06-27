## Conventions
- Tailwind CSS v4. Utility-first approach — no custom CSS for what Tailwind provides.
- Mobile-first: base styles = mobile, use sm:/md:/lg:/xl: prefixes for larger viewports.
- Class order convention: layout -> box model -> typography -> visual -> interactive (use Prettier plugin).
- Design tokens in CSS variables or tailwind.config.ts — never hardcoded values.

## Forbidden
- FORBIDDEN: arbitrary values ([w-127px]) unless no design token exists.
- FORBIDDEN: overriding Tailwind utilities with !important.
- FORBIDDEN: inline styles for anything Tailwind covers.
- FORBIDDEN: @apply in component CSS files unless building a design system layer.

## Recommended Patterns
- Extract repeated utility combinations into components, not CSS classes.
- dark: prefix for dark mode variants.
- group and peer for parent/sibling state styling.
- Container queries (Tailwind v4 native) for truly responsive components.
- Use shadcn/ui or Radix UI for accessible headless components.

## Accessibility
- Never convey information through color alone.
- Focus-visible styles must be visible: focus-visible:ring-2.
- Sufficient contrast: text on background must meet WCAG 2.1 AA (4.5:1).

## Performance
- Lighthouse target: 95+ overall, no metric below 90.
- Tailwind v4 purges unused styles by default — keep class list scannable (no dynamic string concatenation).
- Mobile-first: ensures smallest CSS delivered to mobile devices.

## Common Pitfalls
- Dynamic class names: Tailwind cannot detect classes built with string concatenation — use full class names.
- Responsive breakpoints: Tailwind uses min-width — sm: means "from small and up", not "small only".
- Purge misses: classes in dynamic strings are purged — use safelist for truly dynamic classes.

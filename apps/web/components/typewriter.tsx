"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Splits a line into the already-typed part and the still-"ghost" remainder.
 * Keeping the full text laid out (ghost = transparent) prevents layout jumps as
 * characters appear.
 *
 * @param text - the full line.
 * @param n - number of visible characters.
 * @returns `{ typed, ghost }`.
 */
export function sliceTyped(text: string, n: number): { typed: string; ghost: string } {
  return { typed: text.slice(0, n), ghost: text.slice(n) };
}

const TYPE_MS = 55;
const DELETE_MS = 28;
const HOLD_MS = 1400;
const GAP_MS = 250;

/**
 * Jump-free typewriter cycling through `lines`. Honors prefers-reduced-motion by
 * rendering the first line statically.
 */
export function Typewriter({ lines }: { lines: string[] }) {
  // SSR renders the first line fully typed: the headline is meaningful at
  // first paint (LCP/SEO); the animation then resumes from "hold" and cycles.
  const [n, setN] = useState(lines[0]?.length ?? 0);
  const [li, setLi] = useState(0);
  const reduced = useRef(false);

  useEffect(() => {
    if (lines.length === 0) return;
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced.current) {
      setN(lines[0].length);
      return;
    }
    let cancelled = false;
    let ci = lines[0].length;
    let cur = 0;
    let deleting = false;
    const tick = () => {
      if (cancelled) return;
      const full = lines[cur];
      setN(ci);
      setLi(cur);
      if (!deleting) {
        if (ci < full.length) {
          ci++;
          schedule(TYPE_MS);
        } else {
          deleting = true;
          schedule(HOLD_MS);
        }
      } else if (ci > 0) {
        ci--;
        schedule(DELETE_MS);
      } else {
        deleting = false;
        cur = (cur + 1) % lines.length;
        schedule(GAP_MS);
      }
    };
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (ms: number) => {
      timer = setTimeout(tick, ms);
    };
    schedule(HOLD_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [lines]);

  const line = lines[li] ?? "";
  const { typed, ghost } = sliceTyped(line, n);
  return (
    <h1 className="type">
      <span>{typed}</span>
      <span className="caret" aria-hidden="true">
        ▏
      </span>
      <span className="ghost">{ghost}</span>
    </h1>
  );
}

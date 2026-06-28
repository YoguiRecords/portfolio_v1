"use client";

import { useEffect } from "react";

/**
 * Client-only scroll choreography for the public site:
 *  - reveals `.reveal` elements (adds `.in`) as they enter the viewport,
 *  - triggers `[data-tl]` timeline animations (adds `.play`),
 *  - toggles the nav's `.scrolled` state.
 *
 * Renders nothing. Reduced-motion users get everything shown immediately (CSS
 * already neutralizes the transforms).
 */
export function ScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const timelines = Array.from(document.querySelectorAll<HTMLElement>("[data-tl]"));

    if (reduced) {
      reveals.forEach((el) => el.classList.add("in"));
      timelines.forEach((el) => el.classList.add("play"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("in", "play");
            io.unobserve(e.target);
          });
        },
        { threshold: 0.15 },
      );
      [...reveals, ...timelines].forEach((el) => io.observe(el));
    }

    const nav = document.querySelector(".nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}

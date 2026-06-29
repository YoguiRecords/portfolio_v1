"use client";

import { useState, type ReactNode } from "react";

/** A navigation entry pointing at an in-page section anchor. */
export interface NavLink {
  href: string;
  label: string;
}

/**
 * Fixed top navigation with a desktop link row and a mobile burger menu.
 *
 * @param brand - brand label (the final char is gilded, e.g. "Yohan.").
 * @param links - section links derived from the visible HomeSections.
 * @param children - optional trailing controls (e.g. the language switch).
 */
export function SiteNav({
  brand,
  links,
  children,
}: {
  brand: string;
  links: NavLink[];
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const head = brand.slice(0, -1);
  const tail = brand.slice(-1);

  return (
    <>
      <nav className="nav">
        <a href="#top" className="brand">
          {head}
          <span>{tail}</span>
        </a>
        <div className="links">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          {children}
        </div>
        <button
          className={`burger${open ? " open" : ""}`}
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>
      <div className={`mobile-menu${open ? " open" : ""}`}>
        {links.map((l, i) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            {l.label}
          </a>
        ))}
      </div>
    </>
  );
}

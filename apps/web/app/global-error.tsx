"use client";

/**
 * Last-resort error boundary (replaces the root layout when even it fails).
 * Deliberately dependency-free: inline minimal markup, DA colors hardcoded here
 * only because global CSS may not be loadable in this state.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: "#111111", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ textAlign: "center", maxWidth: 560 }}>
            <div style={{ fontWeight: 900, fontSize: 96, lineHeight: 1, color: "#f0a800" }} aria-hidden="true">
              500
            </div>
            <h1 style={{ color: "#ffffff", fontSize: 22, margin: "18px 0 8px" }}>Un imprévu est survenu.</h1>
            <p style={{ color: "#999999", fontSize: 15, margin: "0 0 28px" }}>
              Réessayez dans un instant.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#f0a800",
                color: "#111111",
                border: 0,
                borderRadius: 6,
                padding: "12px 22px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

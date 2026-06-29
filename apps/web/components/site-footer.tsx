/** An external social/contact link rendered in the footer. */
export interface FooterSocial {
  label: string;
  url: string;
}

/**
 * Site footer (also the contact anchor). The headline keeps the last word
 * gilded; socials come from the profile.
 *
 * @param headline - large closing headline (e.g. "La suite s'écrit ensemble.").
 * @param signature - mono signature line.
 * @param socials - external links.
 * @param legalName - copyright owner.
 */
export function SiteFooter({
  headline,
  signature,
  socials,
  legalName,
}: {
  headline: string;
  signature: string;
  socials: FooterSocial[];
  legalName: string;
}) {
  const words = headline.trim().split(" ");
  const last = words.pop() ?? "";
  const lead = words.join(" ");

  return (
    <footer className="footer" id="contact">
      <div className="wrap">
        <div className="row">
          <h2>
            {lead} <span>{last}</span>
          </h2>
          <div className="socials">
            {socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
        <div className="legal">
          <span>© 2026 {legalName}</span>
          <span>{signature}</span>
        </div>
      </div>
    </footer>
  );
}

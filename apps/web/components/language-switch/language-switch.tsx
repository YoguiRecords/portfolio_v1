"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "../../i18n/navigation";
import styles from "./language-switch.module.css";

/** Toggles between FR and EN, keeping the current path. */
export function LanguageSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const other = locale === "fr" ? "en" : "fr";

  return (
    <button
      type="button"
      className={styles.switch}
      aria-label={`Switch to ${other === "en" ? "English" : "Français"}`}
      onClick={() => router.replace(pathname, { locale: other })}
    >
      {other.toUpperCase()}
    </button>
  );
}

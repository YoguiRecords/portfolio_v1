import { ErrorScreen } from "../../components/error-screen/error-screen";

/** Branded 404 for unknown slugs/paths under a locale. */
export default function NotFound() {
  return (
    <ErrorScreen
      code="404"
      title="Page introuvable."
      message="Cette page n’existe pas (ou plus). Le portfolio, lui, est toujours là."
    />
  );
}

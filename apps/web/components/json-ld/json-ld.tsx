/**
 * Injects a Schema.org JSON-LD payload as a `<script type="application/ld+json">`.
 * The data comes from our own pure builders (not user input); `<` is escaped to
 * prevent any `</script>` break-out from embedded content.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

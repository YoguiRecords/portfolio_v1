import type { Metadata } from "next";
import { getGlobalFaq } from "../../../lib/data/faq";
import { FaqAccordion } from "../../../components/faq/faq-accordion";
import { JsonLd } from "../../../components/json-ld/json-ld";
import { faqPageJsonLd } from "../../../lib/seo/jsonld";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "FAQ",
  description: "Questions fréquentes : disponibilité, missions, méthode de travail.",
};

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const faqs = await getGlobalFaq(locale);

  return (
    <main className="chapter">
      <div className="wrap">
        <div className="marker">FAQ</div>
        <h2>Questions fréquentes.</h2>

        {faqs.length > 0 ? (
          <>
            <JsonLd data={faqPageJsonLd(faqs.map((f) => ({ question: f.question, answer: f.answer })))} />
            <div style={{ marginTop: 32 }}>
              <FaqAccordion items={faqs} />
            </div>
          </>
        ) : (
          <p className="txt">Aucune question pour le moment.</p>
        )}
      </div>
    </main>
  );
}

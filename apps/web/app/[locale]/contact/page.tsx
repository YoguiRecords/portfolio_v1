import type { Metadata } from "next";
import { ContactForm } from "../../../components/forms/contact-form";
import { AppointmentForm } from "../../../components/forms/appointment-form";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrivez-moi ou demandez un rendez-vous.",
};

export default function ContactPage() {
  return (
    <main className="chapter">
      <div className="wrap">
        <div className="marker">Contact</div>
        <h2>Parlons-en.</h2>
        <p className="txt">Un projet, une question, une opportunité ? Laissez-moi un message.</p>

        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Me contacter</h3>
          <ContactForm />
        </div>

        <div style={{ marginTop: 56 }}>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Demander un rendez-vous</h3>
          <AppointmentForm />
        </div>
      </div>
    </main>
  );
}

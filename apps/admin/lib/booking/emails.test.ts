// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import type { Mailbox } from "@portfolio/core/integrations";
import { requestReceivedEmail, confirmedEmail, cancelledEmail, sendBookingEmail } from "./emails";

describe("booking email builders", () => {
  it("request-received email addresses the visitor and includes the cancel link", () => {
    const mail = requestReceivedEmail({
      firstName: "Marc",
      email: "marc@durand.fr",
      whenLabel: "lundi 14 septembre à 10:00",
      cancelUrl: "https://site/rdv/annuler?token=abc",
    });
    expect(mail.to).toBe("marc@durand.fr");
    expect(mail.body).toContain("Marc");
    expect(mail.body).toContain("lundi 14 septembre à 10:00");
    expect(mail.body).toContain("https://site/rdv/annuler?token=abc");
    expect(mail.body).toContain("dès que possible");
  });

  it("confirmed email includes the join info when provided", () => {
    const mail = confirmedEmail({
      firstName: "Marc",
      email: "marc@durand.fr",
      whenLabel: "lundi 14 septembre à 10:00",
      joinInfo: "https://meet.example/xyz",
      cancelUrl: "https://site/rdv/annuler?token=abc",
    });
    expect(mail.subject).toContain("confirmé");
    expect(mail.body).toContain("https://meet.example/xyz");
  });

  it("cancelled email names the slot", () => {
    const mail = cancelledEmail({ firstName: "Marc", email: "m@d.fr", whenLabel: "lundi 14 à 10:00" });
    expect(mail.body).toContain("annulé");
    expect(mail.body).toContain("lundi 14 à 10:00");
  });
});

describe("sendBookingEmail", () => {
  it("delegates to the mailbox", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const mailbox = { sendMessage: send } as unknown as Mailbox;
    await sendBookingEmail(mailbox, { to: "a@b.fr", subject: "s", body: "b" });
    expect(send).toHaveBeenCalledOnce();
  });

  it("swallows a throwing mailbox (best-effort)", async () => {
    const mailbox = { sendMessage: vi.fn().mockRejectedValue(new Error("graph down")) } as unknown as Mailbox;
    await expect(
      sendBookingEmail(mailbox, { to: "a@b.fr", subject: "s", body: "b" }),
    ).resolves.toBeUndefined();
  });
});

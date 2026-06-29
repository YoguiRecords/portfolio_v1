/**
 * Provider-agnostic ports for back-office integrations (mailbox & calendar).
 *
 * The back office depends only on these interfaces; concrete adapters (a demo
 * one, the DB-backed calendar, or Microsoft Graph for a real Exchange mailbox)
 * are wired by a factory. This keeps the BO decoupled from any single provider
 * (low-coupling principle) and lets us swap Microsoft for another host later.
 */

/** A mailbox folder/well-known location. */
export type MailFolder = "inbox" | "sent";

/** A single mail message (display projection — never the raw MIME). */
export interface MailMessage {
  id: string;
  fromAddress: string;
  fromName: string;
  subject: string;
  /** Short text preview (no HTML). */
  preview: string;
  /** Plain-text body. */
  body: string;
  receivedAt: string; // ISO 8601
  isRead: boolean;
}

/** Payload to send a new mail (always plain text — no HTML injection surface). */
export interface SendMailInput {
  to: string;
  subject: string;
  body: string;
}

/** A mailbox provider (demo, Microsoft Graph, …). */
export interface Mailbox {
  /** Lists messages of a folder, most recent first. */
  listMessages(folder?: MailFolder): Promise<MailMessage[]>;
  /** Fetches a single message by id (null if absent). */
  getMessage(id: string): Promise<MailMessage | null>;
  /** Marks a message read/unread. */
  markRead(id: string, isRead: boolean): Promise<void>;
  /** Sends a new message. */
  sendMessage(input: SendMailInput): Promise<void>;
}

/** A calendar event (display projection). */
export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  location: string | null;
  isAllDay: boolean;
  /** Origin of the event, for colouring/grouping in the UI. */
  kind: "event" | "appointment" | "external";
}

/** Payload to create a calendar event. */
export interface CreateEventInput {
  title: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  location?: string;
}

/** A calendar provider (DB-backed, Microsoft Graph, …). */
export interface CalendarProvider {
  /** Lists events overlapping the inclusive [from, to] window. */
  listEvents(fromIso: string, toIso: string): Promise<CalendarEvent[]>;
  /** Creates an event; throws if the provider is read-only. */
  createEvent(input: CreateEventInput): Promise<void>;
}

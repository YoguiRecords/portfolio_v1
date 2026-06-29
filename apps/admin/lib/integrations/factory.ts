import { prisma } from "@portfolio/db";
import type { Mailbox, CalendarProvider } from "@portfolio/core/integrations";
import { readGraphConfig, createGraphClient } from "./graph-client";
import { GraphMailbox } from "./graph-mailbox";
import { GraphCalendar } from "./graph-calendar";
import { DemoMailbox } from "./demo-mailbox";
import { DbCalendar } from "./db-calendar";
import { CompositeCalendar } from "./composite-calendar";

/** Whether a real Microsoft Graph mailbox/calendar is configured (env present). */
export function isGraphLive(): boolean {
  return readGraphConfig() !== null;
}

/**
 * Resolves the mailbox provider: the real Exchange mailbox over Microsoft Graph
 * when configured, otherwise an in-memory demo mailbox.
 */
export function getMailbox(): Mailbox {
  const config = readGraphConfig();
  if (!config) return new DemoMailbox();
  return new GraphMailbox(createGraphClient(config), config.mailboxUser);
}

/**
 * Resolves the calendar provider: always the site's DB calendar (agenda + RDV),
 * merged with the real Outlook calendar when Microsoft Graph is configured.
 */
export function getCalendar(): CalendarProvider {
  const providers: CalendarProvider[] = [new DbCalendar(prisma)];
  const config = readGraphConfig();
  if (config) {
    providers.push(new GraphCalendar(createGraphClient(config), config.mailboxUser));
  }
  return new CompositeCalendar(providers);
}

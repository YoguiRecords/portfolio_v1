import { ConfidentialClientApplication } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";

/** Resolved Microsoft Graph configuration (app-only, client-credentials flow). */
export interface GraphConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  /** UPN of the dedicated mailbox, e.g. `contact@yohandebusscher.com`. */
  mailboxUser: string;
}

/**
 * Reads the Microsoft Graph config from the environment, or `null` when not
 * configured (→ the factory falls back to demo/DB adapters). Secrets stay in the
 * environment only, never in the DB or logs.
 */
export function readGraphConfig(): GraphConfig | null {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const mailboxUser = process.env.MAILBOX_USER;
  if (!tenantId || !clientId || !clientSecret || !mailboxUser) return null;
  return { tenantId, clientId, clientSecret, mailboxUser };
}

/**
 * Builds a Graph client authenticated via the OAuth2 client-credentials flow
 * (app-only). Ideal for a single dedicated mailbox: no interactive login, just a
 * revocable app token scoped to the Application permissions granted in Azure AD
 * (Mail.ReadWrite, Mail.Send, Calendars.ReadWrite).
 */
export function createGraphClient(config: GraphConfig): Client {
  const msal = new ConfidentialClientApplication({
    auth: {
      clientId: config.clientId,
      authority: `https://login.microsoftonline.com/${config.tenantId}`,
      clientSecret: config.clientSecret,
    },
  });

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        const result = await msal.acquireTokenByClientCredential({
          scopes: ["https://graph.microsoft.com/.default"],
        });
        if (!result?.accessToken) throw new Error("graph_token_acquisition_failed");
        return result.accessToken;
      },
    },
  });
}

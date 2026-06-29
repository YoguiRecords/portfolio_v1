# INTEGRATIONS — Mail & calendrier du back office

Le back office expose une **messagerie** (`/mails`) et un **calendrier** (`/calendrier`)
construits sur des **ports provider-agnostiques** (`@portfolio/core/integrations`) : le BO ne
dépend que des interfaces `Mailbox` / `CalendarProvider`, les adaptateurs concrets sont câblés par
une factory (`apps/admin/lib/integrations/factory.ts`).

## État courant (sans configuration)
- **Mails** : adaptateur **démo** (messages d'exemple). L'écran fonctionne de bout en bout ; l'envoi
  est neutralisé.
- **Calendrier** : adaptateur **DB réel** — agenda du site (`Event`) + RDV **confirmés**
  (`AppointmentRequest`), en lecture seule.

## Activer la boîte réelle (Exchange / Microsoft 365)
Renseigner `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `MAILBOX_USER` dans `.env`
bascule automatiquement :
- **Mails** → boîte Exchange réelle (lecture + envoi) via Microsoft Graph.
- **Calendrier** → fusion **agenda du site + RDV + calendrier Outlook** réel.

### Procédure Azure AD (à faire une fois)
1. **Azure Portal → Microsoft Entra ID → App registrations → New registration** (nom : `Portfolio BO`).
2. Noter **Application (client) ID** et **Directory (tenant) ID**.
3. **Certificates & secrets → New client secret** → noter la **valeur** (secret).
4. **API permissions → Add → Microsoft Graph → Application permissions** : `Mail.ReadWrite`,
   `Mail.Send`, `Calendars.ReadWrite` → **Grant admin consent**.
5. (Recommandé) **Application Access Policy** Exchange Online pour restreindre l'app à la **seule**
   boîte `contact@yohandebusscher.com` (et non tout le tenant).
6. Renseigner les 4 variables dans `.env` (`MAILBOX_USER` = l'UPN de la boîte dédiée).

## Posture sécurité
- **OAuth2 app-only (client credentials)** : aucun mot de passe stocké, juste un **token révocable**
  scoping aux **permissions Application** accordées. Pas de flux interactif au runtime.
- **Secrets** (`AZURE_CLIENT_SECRET`) uniquement en `.env` / secrets serveur — jamais en DB ni loggés.
- **Boîte dédiée** (`contact@…`) → si le BO est compromis, le rayon de souffle est limité à cette
  boîte pro (cf. Application Access Policy).
- Le **corps des mails est aplati en texte** avant affichage (jamais de HTML distant rendu → pas de
  surface XSS dans le BO).
- Le calendrier DB est **lecture seule** ; la création d'évènement n'est possible que via Outlook
  (provider inscriptible).

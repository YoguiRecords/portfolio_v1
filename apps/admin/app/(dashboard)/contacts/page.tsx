import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@portfolio/db";
import { listContacts } from "@/lib/crm/crm";
import { createContactAction, deleteContactAction } from "@/lib/actions/crm-actions";
import { ContactsTable, type ContactRow } from "@/components/crm/contacts-table";

export const dynamic = "force-dynamic";

/** CRM contacts list (search, status filter, confirmed delete, create). */
export default async function ContactsPage() {
  await requirePermission("contacts");
  const contacts = await listContacts(prisma);
  const rows: ContactRow[] = contacts.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    companyName: c.company?.name ?? null,
    status: c.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Contacts</h1>
      <ContactsTable contacts={rows} actions={{ create: createContactAction, remove: deleteContactAction }} />
    </div>
  );
}

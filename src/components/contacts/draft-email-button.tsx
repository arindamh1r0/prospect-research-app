"use client";

import { useState } from "react";
import type { Contact } from "@/lib/types/database.types";
import { EmailDraftModal } from "@/components/contacts/email-draft-modal";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function DraftEmailButton({ contact }: { contact: Contact }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Mail className="size-3.5 mr-1.5" />
        Draft Outreach Email
      </Button>
      <EmailDraftModal contact={contact} open={open} onOpenChange={setOpen} />
    </>
  );
}

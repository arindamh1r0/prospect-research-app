"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, X } from "lucide-react";

const STORAGE_KEY = "gmail_banner_dismissed";

export function GmailBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) !== "true";
  });

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-4 py-3">
      <div className="flex items-center justify-center rounded-full size-8 bg-blue-100 dark:bg-blue-900/40 shrink-0">
        <Mail className="size-4 text-blue-600 dark:text-blue-400" />
      </div>
      <p className="flex-1 text-sm text-blue-800 dark:text-blue-300">
        Connect Gmail to auto-sync sent emails and track replies without manual updates.
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" render={<Link href="/settings/integrations" />}>
          Connect Gmail
        </Button>
        <button
          onClick={dismiss}
          className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { UserSettings } from "@/lib/types/database.types";
import { AI_MODELS } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";

interface SettingsFormProps {
  initial: UserSettings;
  userEmail: string;
  userInitials: string;
}

const MODEL_GROUPS = ["Anthropic", "OpenAI", "Google", "Meta"] as const;

export function SettingsForm({ initial, userEmail, userInitials }: SettingsFormProps) {
  const [emailModel, setEmailModel] = useState(initial.email_draft_model);
  const [researchModel, setResearchModel] = useState(initial.research_model);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = emailModel !== initial.email_draft_model || researchModel !== initial.research_model;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_draft_model: emailModel, research_model: researchModel }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? "Failed to save settings.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Profile */}
      <Section title="Profile">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center rounded-full size-14 bg-primary text-primary-foreground text-lg font-semibold">
            {userInitials}
          </div>
          <div>
            <p className="font-medium text-sm">{userEmail}</p>
            <Badge variant="secondary" className="mt-1 text-xs">Pro</Badge>
          </div>
        </div>
      </Section>

      {/* AI Models */}
      <Section title="AI Models" description="Choose which model powers each feature. All models are accessed via OpenRouter.">
        <ModelPicker
          label="Email Drafting"
          hint="Used when generating outreach emails from contact profiles."
          value={emailModel}
          onChange={setEmailModel}
        />
        <ModelPicker
          label="Prospect Research"
          hint="Passed to your n8n workflow when triggering company research."
          value={researchModel}
          onChange={setResearchModel}
        />
      </Section>

      {/* Save */}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || !isDirty}>
          {saving && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
          {saved && <Check className="size-3.5 mr-1.5" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </Button>
        {!isDirty && !saved && (
          <p className="text-xs text-muted-foreground">No changes</p>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="rounded-xl border bg-card p-5 space-y-5">{children}</div>
    </div>
  );
}

function ModelPicker({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = AI_MODELS.find((m) => m.id === value);

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="space-y-3">
        {MODEL_GROUPS.map((group) => {
          const models = AI_MODELS.filter((m) => m.provider === group);
          if (models.length === 0) return null;
          return (
            <div key={group}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{group}</p>
              <div className="grid grid-cols-1 gap-1.5">
                {models.map((model) => {
                  const active = value === model.id;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => onChange(model.id)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                        active
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <div>
                        <span className="font-medium">{model.name}</span>
                        <span className="ml-2 text-xs opacity-70">{model.description}</span>
                      </div>
                      {active && <Check className="size-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {selected && (
        <p className="text-xs text-muted-foreground pt-1">
          Selected: <span className="font-mono">{selected.id}</span>
        </p>
      )}
    </div>
  );
}

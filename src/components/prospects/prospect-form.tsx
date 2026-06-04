"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ProspectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ company_name: "", division: "", region: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/research/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const { prospectId } = await res.json();
    router.push(`/prospects/${prospectId}`);
  }

  return (
    <Card className="max-w-lg w-full">
      <CardHeader>
        <CardTitle>New Prospect</CardTitle>
        <CardDescription>
          Enter company details. The agent will automatically research and generate a summary.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              name="company_name"
              placeholder="Acme Corporation"
              value={form.company_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <Input
              id="division"
              name="division"
              placeholder="e.g. North America Sales"
              value={form.division}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              name="region"
              placeholder="e.g. APAC, EMEA, US"
              value={form.region}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Starting research..." : "Start Research"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

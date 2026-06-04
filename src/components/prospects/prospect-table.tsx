"use client";

import Link from "next/link";
import type { Prospect } from "@/lib/types/database.types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProspectTableProps {
  prospects: Prospect[];
}

export function ProspectTable({ prospects }: ProspectTableProps) {
  if (prospects.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-sm">No prospects yet.</p>
        <Button className="mt-4" variant="outline" size="sm" render={<Link href="/prospects/new" />}>
          Add your first prospect
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Division</TableHead>
          <TableHead>Region</TableHead>
          <TableHead>Created</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {prospects.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.company_name}</TableCell>
            <TableCell>
              {p.division ? (
                <Badge variant="secondary">{p.division}</Badge>
              ) : (
                <span className="text-muted-foreground text-xs">—</span>
              )}
            </TableCell>
            <TableCell>
              {p.region ?? <span className="text-muted-foreground text-xs">—</span>}
            </TableCell>
            <TableCell className="text-muted-foreground text-xs">
              {new Date(p.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" render={<Link href={`/prospects/${p.id}`} />}>
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

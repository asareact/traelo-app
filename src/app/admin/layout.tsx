import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/features/admin";

/**
 * Admin shell — dark top navbar + a centered max-w-1200 desktop column
 * (DESIGN.md "Portal Admin"). The proxy already guards /admin/*, but we re-check
 * here as defense in depth: a non-admin is bounced to their dashboard.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/kanban");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  if (profile?.rol !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-dvh bg-bg">
      <AdminNav />
      <main className="mx-auto max-w-[1200px] px-5 py-6">{children}</main>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function checkAdmin() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/");

    const { data: profile } = await supabase
        .from("profile")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") redirect("/");
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
    await checkAdmin();

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-6 border-b border-border bg-background px-6">
                <span className="font-semibold text-sm">TechStack Hub · Admin</span>
                <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link href="/admin" className="hover:text-foreground transition-colors">
                        Technologies
                    </Link>
                    <Link href="/admin/notification" className="hover:text-foreground transition-colors">
                        Notifications
                    </Link>
                </nav>
                <div className="ml-auto">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        ← Back to site
                    </Link>
                </div>
            </header>
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { AdminTechTable } from "@/app/admin/admin-tech-table";
import type { Tech } from "@/types/database";

async function getTechs(): Promise<Tech[]> {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase
        .from("tech")
        .select("*, tags:tag_tech(tag:tag(id, name))")
        .order("created_at", { ascending: false });

    return (data ?? []).map((t) => ({
        ...t,
        tags: t.tags?.map((x: { tag: { id: string; name: string } }) => x.tag) ?? [],
    })) as Tech[];
}

async function getTags() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data } = await supabase.from("tag").select("id, name").order("name");
    return data ?? [];
}

export default async function AdminPage() {
    const [techs, tags] = await Promise.all([getTechs(), getTags()]);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">Technologies</h1>
                <p className="text-sm text-muted-foreground">{techs.length} total</p>
            </div>
            <AdminTechTable techs={techs} tags={tags} />
        </div>
    );
}

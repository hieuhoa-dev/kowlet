import { AdminTechTable } from "@/app/admin/admin-tech-table";
import { getAllTags } from "@/lib/actions/tags";
import { createClient } from "@/lib/supabase/server";
import type { Tag, Tech } from "@/types/database";
import { cookies } from "next/headers";

const PAGE_SIZE = 10;

type TechRow = Omit<Tech, "tags"> & {
  tags?: Array<{ tag: Tag }>;
};

async function getAdminTechs({
  search,
  tags,
  page,
  limit,
}: {
  search: string;
  tags: string[];
  page: number;
  limit: number;
}): Promise<{ techs: Tech[]; total: number }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let techIds: string[] | null = null;

  if (tags.length > 0) {
    const { data: tagRows, error: tagError } = await supabase
      .from("tag_tech")
      .select("tech_id")
      .in("tag_id", tags);

    if (tagError) throw new Error(tagError.message);

    const ids = (tagRows ?? []).map((row) => row.tech_id as string);
    techIds = Array.from(new Set(ids));

    if (techIds.length === 0) return { techs: [], total: 0 };
  }

  let query = supabase
    .from("tech")
    .select("*, tags:tag_tech(tag:tag(id, name))", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(
      `name.ilike.${term},description.ilike.${term},url.ilike.${term},github_url.ilike.${term}`,
    );
  }

  if (techIds) {
    query = query.in("id", techIds);
  }

  const start = page * limit;
  const end = start + limit - 1;

  const { data, count, error } = await query.range(start, end);
  if (error) throw new Error(error.message);

  const techs = (data ?? []).map((row) => ({
    ...row,
    tags: (row as TechRow).tags?.map((item) => item.tag) ?? [],
  })) as Tech[];

  return { techs, total: count ?? 0 };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tags?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const selectedTags = params.tags
    ? params.tags.split(",").filter(Boolean)
    : [];
  const page = Math.max(0, parseInt(params.page ?? "0", 10));

  const [{ techs, total }, tags] = await Promise.all([
    getAdminTechs({ search, tags: selectedTags, page, limit: PAGE_SIZE }),
    getAllTags(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Technologies</h1>
        <p className="text-sm text-muted-foreground">{total} total</p>
      </div>
      <AdminTechTable
        techs={techs}
        tags={tags}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        initialQuery={search}
        initialSelectedTags={selectedTags}
      />
    </div>
  );
}

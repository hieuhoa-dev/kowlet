"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Tag, Tech } from "@/types/database";

const DEFAULT_PAGE_SIZE = 20;

export interface GetTechsParams {
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

type TechPayload = {
  name: string;
  slug: string;
  description?: string | null;
  url?: string | null;
  github_url?: string | null;
  og_image?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  favicon?: string | null;
};

type TechRow = Omit<Tech, "tags"> & {
  tags?: Array<{ tag: Tag }>;
};

function mapTechRows(rows: TechRow[]): Tech[] {
  return rows.map((row) => ({
    ...row,
    tags: row.tags?.map((item) => item.tag) ?? [],
  }));
}

export async function getTechs({
  search = "",
  tags = [],
  page = 0,
  limit = DEFAULT_PAGE_SIZE,
}: GetTechsParams = {}): Promise<Tech[]> {
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

    if (techIds.length === 0) return [];
  }

  let query = supabase
    .from("tech")
    .select("*, tags:tag_tech(tag:tag(id, name, created_at, updated_at))")
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

  const { data, error } = await query.range(start, end);
  if (error) throw new Error(error.message);

  return mapTechRows((data ?? []) as TechRow[]);
}

export async function createTech(payload: TechPayload) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from("tech").insert(payload);
  if (error) throw new Error(error.message);
}

export async function updateTech(id: string, payload: Partial<TechPayload>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from("tech").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteTech(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.from("tech").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

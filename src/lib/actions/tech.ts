"use server";

import { cookies } from "next/headers";
import { getLinkPreview } from "link-preview-js";
import { createClient } from "@/lib/supabase/server";
import type { Tag, Tech } from "@/types/database";

const DEFAULT_PAGE_SIZE = 20;

export interface GetTechsParams {
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sort?: SortOption;
}

export type SortOption = "newest" | "oldest" | "most_bookmarked";

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

type PreviewData = {
  title?: string;
  description?: string;
  images?: string[];
  favicons?: string[];
};

async function fetchPreview(url: string): Promise<PreviewData> {
  try {
    const preview = (await getLinkPreview(url, {
      followRedirects: "follow",
    })) as PreviewData;
    return preview;
  } catch {
    return {};
  }
}

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
  sort = "newest",
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
    .select("*, tags:tag_tech(tag:tag(id, name, created_at, updated_at))");

  if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sort === "most_bookmarked") {
    query = query
      .order("bookmark_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

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

  let enrichedPayload = payload;
  const sourceUrl = payload.url ?? payload.github_url ?? null;

  if (
    sourceUrl &&
    !payload.og_title &&
    !payload.og_description &&
    !payload.og_image
  ) {
    const preview = await fetchPreview(sourceUrl);
    enrichedPayload = {
      ...payload,
      og_title: preview.title ?? payload.og_title ?? null,
      og_description: preview.description ?? payload.og_description ?? null,
      og_image: preview.images?.[0] ?? payload.og_image ?? null,
      favicon: preview.favicons?.[0] ?? payload.favicon ?? null,
    };
  }

  const { error } = await supabase.from("tech").insert(enrichedPayload);
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

export async function updateTechTags(techId: string, tagIds: string[]) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error: deleteError } = await supabase
    .from("tag_tech")
    .delete()
    .eq("tech_id", techId);

  if (deleteError) throw new Error(deleteError.message);

  if (tagIds.length === 0) return;

  const rows = tagIds.map((tagId) => ({ tag_id: tagId, tech_id: techId }));
  const { error: insertError } = await supabase.from("tag_tech").insert(rows);
  if (insertError) throw new Error(insertError.message);
}

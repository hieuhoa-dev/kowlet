"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Tag, TagCategory, TagGroup } from "@/types/database";

export async function getAllTags(): Promise<Tag[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("tag")
    .select("id, name, icon, category_id, created_at, updated_at")
    .order("name");

  if (error) throw new Error(error.message);
  return (data ?? []) as Tag[];
}

export async function getTagGroups(): Promise<TagGroup[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [
    { data: categories, error: categoryError },
    { data: tags, error: tagError },
  ] = await Promise.all([
    supabase
      .from("tag_category")
      .select("id, name, slug, icon, sort_order, created_at")
      .order("sort_order", { ascending: true }),
    supabase
      .from("tag")
      .select("id, name, icon, category_id, created_at, updated_at")
      .order("name"),
  ]);

  if (categoryError) throw new Error(categoryError.message);
  if (tagError) throw new Error(tagError.message);

  const grouped = new Map<string, Tag[]>();
  (tags ?? []).forEach((tag) => {
    if (!tag.category_id) return;
    const bucket = grouped.get(tag.category_id) ?? [];
    bucket.push(tag as Tag);
    grouped.set(tag.category_id, bucket);
  });

  const groups = (categories ?? []).map((row) => {
    const category = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      icon: row.icon,
      sort_order: row.sort_order,
      created_at: row.created_at,
    } as TagCategory;

    return {
      category,
      tags: grouped.get(row.id) ?? [],
    } as TagGroup;
  });

  const uncategorized = (tags ?? []).filter((tag) => !tag.category_id) as Tag[];
  if (uncategorized.length > 0) {
    groups.push({
      category: {
        id: "uncategorized",
        name: "Other",
        slug: "other",
        icon: null,
        sort_order: 999,
        created_at: new Date(0).toISOString(),
      },
      tags: uncategorized,
    });
  }

  return groups;
}

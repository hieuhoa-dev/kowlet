import { createClient } from "@/lib/supabase/server";
import { getTagGroups } from "@/lib/actions/tags";
import { cookies } from "next/headers";
import type { Tag, Tech } from "@/types/database";
import { BookmarkFeed } from "./bookmark-feed";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getBookmarkedTechs(userId: string): Promise<Tech[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  type BookmarkRow = {
    tech: (Omit<Tech, "tags"> & { tags?: Array<{ tag: Tag }> }) | null;
  };
  const { data, error } = await supabase
    .from("bookmark")
    .select(
      "tech:tech(*, tags:tag_tech(tag:tag(id, name, created_at, updated_at)))",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as BookmarkRow[];

  return rows
    .map((row) => row.tech)
    .filter(
      (tech): tech is Omit<Tech, "tags"> & { tags?: Array<{ tag: Tag }> } =>
        tech !== null,
    )
    .map((tech) => ({
      ...tech,
      tags: tech.tags?.map((item) => item.tag) ?? [],
    }));
}

export default async function BookmarkPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tags?: string }>;
}) {
  const params = await searchParams;
  const search = params.q ?? "";
  const selectedTags = params.tags
    ? params.tags.split(",").filter(Boolean)
    : [];

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tagGroups = await getTagGroups();

  if (!user) {
    redirect("/sign-in");
  }

  const techs = await getBookmarkedTechs(user.id);
  const bookmarkedIds = techs.map((tech) => tech.id);

  return (
    <BookmarkFeed
      initialTechs={techs}
      tagGroups={tagGroups}
      initialBookmarkedIds={bookmarkedIds}
      initialSearch={search}
      initialSelectedTags={selectedTags}
      userId={user.id}
    />
  );
}

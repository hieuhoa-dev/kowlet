import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Tech } from "@/types/database";
import { BookmarkFeed } from "./bookmark-feed";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getTags() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase.from("tag").select("id, name").order("name");
  return data ?? [];
}

async function getBookmarkedTechs(userId: string): Promise<Tech[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("bookmark")
    .select(
      "tech:tech(*, tags:tag_tech(tag:tag(id, name, created_at, updated_at)))",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => row.tech as Tech | null)
    .filter((tech): tech is Tech => tech !== null)
    .map((tech) => ({
      ...tech,
      tags:
        tech.tags?.map((item: { tag: Tech["tags"][number] }) => item.tag) ?? [],
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

  const tags = await getTags();

  if (!user) {
    redirect("/sign-in");
  }

  const techs = await getBookmarkedTechs(user.id);
  const bookmarkedIds = techs.map((tech) => tech.id);

  return (
    <BookmarkFeed
      initialTechs={techs}
      tags={tags}
      initialBookmarkedIds={bookmarkedIds}
      initialSearch={search}
      initialSelectedTags={selectedTags}
      userId={user.id}
    />
  );
}

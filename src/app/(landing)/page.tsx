import { getTechs } from "@/lib/actions/tech";
import { getUserBookmarks } from "@/lib/actions/bookmark";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { HomeFeed } from "./home-feed";

export const dynamic = "force-dynamic";

async function getTags() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase.from("tag").select("id, name").order("name");
  return data ?? [];
}

export default async function HomePage({
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

  const [techs, tags, bookmarkedIds] = await Promise.all([
    getTechs({ search, tags: selectedTags }),
    getTags(),
    user ? getUserBookmarks(user.id) : Promise.resolve([]),
  ]);

  return (
    <HomeFeed
      initialTechs={techs}
      tags={tags}
      initialBookmarkedIds={bookmarkedIds}
      initialSearch={search}
      initialSelectedTags={selectedTags}
      userId={user?.id ?? null}
    />
  );
}

"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

async function adjustBookmarkCount(
  supabase: ReturnType<typeof createClient>,
  techId: string,
  delta: number,
) {
  const { data: techRow, error: fetchError } = await supabase
    .from("tech")
    .select("bookmark_count")
    .eq("id", techId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const current =
    typeof techRow?.bookmark_count === "number" ? techRow.bookmark_count : 0;
  const next = Math.max(0, current + delta);

  const { error: updateError } = await supabase
    .from("tech")
    .update({ bookmark_count: next })
    .eq("id", techId);

  if (updateError) throw new Error(updateError.message);
}

export async function getUserBookmarks(userId: string): Promise<string[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("bookmark")
    .select("tech_id")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => row.tech_id as string);
}

export async function toggleBookmark(techId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("Not authenticated");

  const { data: existing, error: existingError } = await supabase
    .from("bookmark")
    .select("id")
    .eq("user_id", authData.user.id)
    .eq("tech_id", techId)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);

  if (existing?.id) {
    const { error: deleteError } = await supabase
      .from("bookmark")
      .delete()
      .eq("id", existing.id);

    if (deleteError) throw new Error(deleteError.message);

    await adjustBookmarkCount(supabase, techId, -1);
    return { added: false };
  }

  const { error: insertError } = await supabase
    .from("bookmark")
    .insert({ user_id: authData.user.id, tech_id: techId });

  if (insertError) throw new Error(insertError.message);

  await adjustBookmarkCount(supabase, techId, 1);
  return { added: true };
}

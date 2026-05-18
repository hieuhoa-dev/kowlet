"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface ContributionPayload {
  url?: string | null;
  github_url?: string | null;
}

export async function submitContribution({
  url,
  github_url,
}: ContributionPayload) {
  if (!url && !github_url) {
    throw new Error("At least one URL is required.");
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("Not authenticated");

  const { error } = await supabase.from("notification").insert({
    user_id: authData.user.id,
    status: "pending",
    url: url ?? null,
    github_url: github_url ?? null,
  });

  if (error) throw new Error(error.message);
}

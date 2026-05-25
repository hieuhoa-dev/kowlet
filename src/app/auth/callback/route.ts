import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const getBaseUrl = () => {
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
      return siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
    }
    // Fallback if env is missing
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "http";
    return forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.url;
  };

  const baseUrl = getBaseUrl();
  return NextResponse.redirect(new URL(next, baseUrl));
}

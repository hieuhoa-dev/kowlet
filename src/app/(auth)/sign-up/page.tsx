import { redirect } from "next/navigation";
import { AuthForm } from "@/components/custom-ui/auth-form";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const Page = async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <AuthForm mode="sign-up" />
    </div>
  );
};

export default Page;

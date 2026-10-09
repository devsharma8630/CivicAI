import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list: { name: string; value: string; options: CookieOptions }[]) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;
  const adminArea = path.startsWith("/admin") && path !== "/admin/login";
  const deptArea = path.startsWith("/department") && path !== "/department/login";
  const citizenArea = path.startsWith("/dashboard");

  if (!user) {
    if (adminArea) return NextResponse.redirect(new URL("/admin/login", req.url));
    if (deptArea) return NextResponse.redirect(new URL("/department/login", req.url));
    if (citizenArea) return NextResponse.redirect(new URL("/login", req.url));
    return res;
  }

  if (adminArea || deptArea || citizenArea) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = profile?.role;
    const home = role === "admin" ? "/admin/dashboard" : role === "department_staff" ? "/department/dashboard" : "/dashboard";
    if (adminArea && role !== "admin") return NextResponse.redirect(new URL(home, req.url));
    if (deptArea && role !== "department_staff") return NextResponse.redirect(new URL(home, req.url));
    if (citizenArea && role !== "citizen") return NextResponse.redirect(new URL(home, req.url));
  }
  return res;
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/department/:path*"] };

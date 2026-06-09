import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session on every request and enforces route guards:
 *  - /admin/*      → requires authenticated user with profiles.rol = 'admin'
 *  - /dashboard,
 *    /pedidos/nuevo,
 *    /perfil        → require any authenticated user
 *
 * Public routes (/, /login, /registro, /pedidos/[id]) pass through.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser().
  // getUser() revalidates the auth token on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  const isAdminRoute = path.startsWith("/admin");
  // Protect the dashboard, profile, orders list, and the new-order form.
  // IMPORTANT: /pedidos/[id] is the PUBLIC tracking page — never guard it.
  const isClientProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/perfil") ||
    path === "/pedidos" ||
    path === "/pedidos/nuevo";

  // Not logged in → redirect protected routes to /login
  if (!user && (isAdminRoute || isClientProtected)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Logged in but hitting /admin → verify admin role
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (profile?.rol !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

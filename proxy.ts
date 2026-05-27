import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// proxy.ts reemplaza a middleware.ts en Next 16. Es edge-safe: solo decodifica el
// JWT de sesión (sin pg). Si no hay sesión, redirige a /login. La verificación de
// `active` contra la BD ocurre en page.tsx y en las rutas /api (runtime Node).
export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|login|sin-acceso|_next|favicon.ico|.*\\.png).*)"],
};

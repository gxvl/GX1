import { NextResponse, type NextRequest } from "next/server";
import { COUNTRY_HEADER } from "@/lib/region";

/**
 * Runs before rendering. On Vercel, `x-vercel-ip-country` carries the visitor's
 * country; we forward it as our own request header so server components can
 * price GX1 locally without shipping any geolocation code to the client.
 * `?region=BR` overrides it for local testing.
 */
export function proxy(request: NextRequest) {
  const override = request.nextUrl.searchParams.get("region")?.toUpperCase();
  const country =
    override ?? request.headers.get("x-vercel-ip-country") ?? "US";

  const headers = new Headers(request.headers);
  headers.set(COUNTRY_HEADER, country);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Pages only: skip static assets, image optimization and metadata files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|opengraph-image).*)"],
};

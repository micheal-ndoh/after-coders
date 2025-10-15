import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|auth).*)"],
};

export default auth((req: NextRequest & { auth: any }) => {
  const reqUrl = new URL(req.url);
  if (!req.auth && reqUrl.pathname !== "/auth/signin") {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }
});

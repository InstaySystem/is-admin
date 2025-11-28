import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PATH } from "@/constants/path";
import { ACCESS_TOKEN } from "@/constants/token";

const ADMIN_ROUTES = ["/manage-staff", "/manage-department"];

const AUTH_PATHS = [PATH.LOGIN, PATH.REGISTER];
const PRIVATE_PATHS = [PATH.HOME];

export default function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN)?.value;
  const role = request.cookies.get("role")?.value ?? null;
  const pathname = request.nextUrl.pathname;

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL(PATH.LOGIN, request.url));
  }

  if (!token && PRIVATE_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(PATH.LOGIN, request.url));
  }

  const isStaff = role?.startsWith("staff");
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  if (isStaff && isAdminRoute) {
    return NextResponse.redirect(new URL(PATH.HOME, request.url));
  }

  if (token && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(PATH.HOME, request.url));
  }

  return NextResponse.next();
}

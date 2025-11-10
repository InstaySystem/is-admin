import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PATH } from "@/constants/path"
import { ACCESS_TOKEN } from "@/constants/token"

const AUTH_PATHS = [PATH.LOGIN, PATH.REGISTER]
const PRIVATE_PATHS = [PATH.HOME]

export default function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN)?.value
  const { pathname } = request.nextUrl

  // Nếu chưa đăng nhập và vào trang /dashboard → chuyển hướng về login
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL(PATH.LOGIN, request.url))
  }

  // Nếu chưa đăng nhập và vào trang riêng tư → chuyển hướng về login
  if (!token && PRIVATE_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(PATH.LOGIN, request.url))
  }

  // Nếu đã đăng nhập mà vào trang login/register → chuyển hướng về home
  if (token && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(PATH.HOME, request.url))
  }

  return NextResponse.next()
}

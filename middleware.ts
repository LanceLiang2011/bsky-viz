import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";
import { checkSecurity } from "./lib/security-helper";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // First check security
  const securityResponse = checkSecurity(request);
  if (securityResponse) {
    return securityResponse;
  }

  // Then run internationalization middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all paths except static files that should bypass middleware entirely
  matcher: [
    "/((?!_next/static|_next/image|favicon|.*\\.svg|.*\\.webp|.*\\.png|.*\\.ico|.*\\.txt|.*\\.xml).*)",
  ],
};

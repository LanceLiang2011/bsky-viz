import { NextRequest, NextResponse } from "next/server";

// WordPress and common CMS paths to block
const BLOCKED_PATHS = [
  "/wp-admin",
  "/wp-includes", 
  "/wp-content",
  "/wp-json",
  "/wp-login.php",
  "/wp-config.php",
  "/xmlrpc.php",
  "/administrator",
  "/phpmyadmin",
  "/.env",
  "/.git",
  "/config.php",
  "/install.php",
];

// Bot user agents to block
const BLOCKED_USER_AGENTS = [
  "bot",
  "crawler", 
  "spider",
  "scraper",
  "scanner",
  "exploit",
  "hack",
  "attack",
  "sqlmap",
  "nikto",
  "nessus",
  "wpscan",
  "dirbuster",
  "nuclei",
  "masscan",
  "nmap",
];

// Allow these specific static files
const ALLOWED_STATIC_PATHS = [
  "/logo.png",
  "/favicon/",
  "/favicon.ico",
  "/robots.txt",
  "/_next/",
  "/_vercel/",
];

function isBlockedPath(pathname: string): boolean {
  const lowerPath = pathname.toLowerCase();
  return BLOCKED_PATHS.some(blocked => 
    lowerPath.startsWith(blocked.toLowerCase())
  );
}

function isBlockedUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const lowerUA = userAgent.toLowerCase();
  // Allow legitimate social media crawlers
  if (lowerUA.includes('facebookexternalhit') || 
      lowerUA.includes('twitterbot') ||
      lowerUA.includes('linkedinbot')) {
    return false;
  }
  return BLOCKED_USER_AGENTS.some(blocked => lowerUA.includes(blocked));
}

function isAllowedStaticFile(pathname: string): boolean {
  return ALLOWED_STATIC_PATHS.some(allowed => 
    pathname.startsWith(allowed)
  );
}

export function checkSecurity(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent");

  // Always allow static files we need
  if (isAllowedStaticFile(pathname)) {
    return null; // Allow through
  }

  // Block malicious paths
  if (isBlockedPath(pathname)) {
    console.log(`Blocked malicious path: ${pathname} from ${userAgent}`);
    return new NextResponse("Not Found", { status: 404 });
  }

  // Block suspicious user agents
  if (isBlockedUserAgent(userAgent)) {
    console.log(`Blocked suspicious user agent: ${userAgent} accessing ${pathname}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  return null; // Allow through
}

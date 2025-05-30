"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const locale = useLocale();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Home Link */}
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="Bluesky Analytics Logo"
              width={32}
              height={26}
              className="h-8 w-auto"
            />
            <span className="font-semibold text-lg hidden sm:inline-block">
              Bluesky Analytics
            </span>
          </Link>

          {/* Language Switcher */}
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}

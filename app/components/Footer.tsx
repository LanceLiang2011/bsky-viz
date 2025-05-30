"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations("navigation");
  const locale = useLocale();

  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          {/* Navigation Links */}
          <nav className="flex space-x-6">
            <Link
              href={`/${locale}/about`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("about")}
            </Link>
            <Link
              href={`/${locale}/privacy`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              href={`/${locale}/help`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("help")}
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {currentYear} Created by{" "}
            <a
              href="https://bsky.app/profile/lanceliang.bsky.social"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              Lance
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

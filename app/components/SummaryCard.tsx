"use client";

import { useTranslations } from "next-intl";

interface SummaryCardProps {
  summary: string;
  username?: string;
  handle: string;
  showUserInfo: boolean;
}

export default function SummaryCard({
  summary,
  username,
  handle,
  showUserInfo,
}: SummaryCardProps) {
  const t = useTranslations();

  return (
    <div className="bg-background/95 dark:bg-zinc-900/95 backdrop-blur-sm border-l border-r border-b border-border/50 shadow-xl rounded-3xl overflow-clip p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground leading-tight">
          {showUserInfo ? (
            <div className="flex flex-col gap-1">
              {username && (
                <span className="text-xl sm:text-2xl lg:text-3xl">
                  {username}
                </span>
              )}
              <span className="text-sm sm:text-base lg:text-lg text-muted-foreground font-normal">
                @{handle}
              </span>
            </div>
          ) : (
            t("openai.summaryTitle")
          )}
        </h2>
      </div>

      {/* Bias Warning */}
      <div className="mb-6">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 sm:p-4">
          <p className="text-amber-800 dark:text-amber-200 text-sm sm:text-base font-medium text-center">
            {t("openai.biasWarning")}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-none">
        <div className="text-foreground/90 whitespace-pre-line text-base sm:text-lg lg:text-xl leading-relaxed sm:leading-loose lg:leading-loose font-normal tracking-wide">
          {summary}
        </div>
      </div>
    </div>
  );
}

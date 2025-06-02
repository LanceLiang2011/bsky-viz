"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import ProfileCard from "../../components/ProfileCard";
import AnalysisResults from "../../components/AnalysisResults";
import BackButton from "../../components/BackButton";
import OpenAISummaryCard from "../../components/OpenAISummaryCard";
import LoadingState from "../../components/LoadingState";
import { Card, CardContent } from "@/components/ui/card";
import { useBlueskyData, analyzeWithOpenAI } from "../../hooks/useBlueskyData";

interface HandlePageProps {
  params: Promise<{ handle: string; locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function HandlePage({ params, searchParams }: HandlePageProps) {
  const t = useTranslations();
  const locale = useLocale();

  // Unwrap the promises
  const { handle } = use(params);
  const resolvedSearchParams = use(searchParams);

  // State for OpenAI analysis
  const [openAISummary, setOpenAISummary] = useState<string | null>(null);
  const [openAILoading, setOpenAILoading] = useState(false);
  const [openAIError, setOpenAIError] = useState<string | null>(null);

  if (!handle) {
    notFound();
  }

  // Extract limit parameter from search params
  const limitParam = resolvedSearchParams.limit;
  const customMaxPages = limitParam
    ? parseInt(Array.isArray(limitParam) ? limitParam[0] : limitParam)
    : undefined;

  // Use the custom hook for data fetching
  const { data, error, isLoading } = useBlueskyData(
    decodeURIComponent(handle),
    customMaxPages
  );

  // Effect to trigger OpenAI analysis when data is ready
  useEffect(() => {
    if (data && data.categorizedContent && !openAISummary && !openAILoading) {
      const performOpenAIAnalysis = async () => {
        setOpenAILoading(true);
        setOpenAIError(null);

        try {
          const summary = await analyzeWithOpenAI(
            data.categorizedContent,
            data.profile.displayName || data.profile.handle,
            locale
          );
          setOpenAISummary(summary);
          console.log("✓ OpenAI summary generated");
        } catch (err) {
          console.error("Error generating OpenAI summary:", err);
          setOpenAIError(
            err instanceof Error ? err.message : "Failed to generate summary"
          );
        } finally {
          setOpenAILoading(false);
        }
      };

      performOpenAIAnalysis();
    }
  }, [data, locale, openAISummary, openAILoading]);

  // Loading state
  if (isLoading) {
    return <LoadingState message={t("loading.analyzing")} />;
  }

  // Error states
  if (error) {
    if (error === "User not found") {
      return (
        <div className="container mx-auto px-4 py-8 space-y-6">
          <BackButton locale={locale} />
          <Card className="mx-auto max-w-md">
            <CardContent className="pt-6 text-center">
              <h2 className="text-lg font-semibold mb-2">
                {t("errors.userNotFound")}
              </h2>
              <p className="text-muted-foreground">
                {t("errors.userNotFoundDescription")}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <BackButton locale={locale} />
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">{t("errors.title")}</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No data state
  if (!data || !data.profile) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <BackButton locale={locale} />
        <Card className="mx-auto max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">{t("errors.title")}</h2>
            <p className="text-muted-foreground">
              {t("errors.unexpectedError")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <BackButton locale={locale} />
      <ProfileCard profile={data.profile} />

      {/* OpenAI Summary with loading state */}
      {(openAISummary || openAILoading) && (
        <>
          {openAILoading && (
            <Card className="mx-auto max-w-4xl">
              <CardContent className="pt-6 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {t("loading.generatingSummary")}
                </p>
              </CardContent>
            </Card>
          )}

          {openAISummary && !openAILoading && (
            <OpenAISummaryCard
              summary={openAISummary}
              username={data.profile.displayName}
              handle={data.profile.handle}
            />
          )}

          {openAIError && !openAILoading && (
            <Card className="mx-auto max-w-4xl">
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-semibold mb-2 text-destructive">
                  {t("errors.openaiError")}
                </h3>
                <p className="text-muted-foreground">{openAIError}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {data.processedFeed && (
        <AnalysisResults
          processedFeed={data.processedFeed}
          currentUser={{
            did: data.profile.did,
            handle: data.profile.handle,
            displayName: data.profile.displayName,
            avatar: data.profile.avatar,
          }}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { analyzeUser } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProfileCard from "./ProfileCard";

interface BlueskyProfile {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  banner?: string;
  description?: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  createdAt: string;
  associated?: {
    lists: number;
    feedgens: number;
    starterPacks: number;
    labeler: boolean;
  };
  pinnedPost?: {
    cid: string;
    uri: string;
  };
}

interface AnalysisResult {
  success?: boolean;
  error?: string;
  profile?: BlueskyProfile;
  feed?: unknown;
}

export default function BlueskyAnalyzer() {
  const t = useTranslations();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    try {
      const response = await analyzeUser(formData);
      setResult(response);
    } catch {
      setResult({ error: t("errors.unexpected") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>{t("form.title")}</CardTitle>
          <CardDescription>{t("form.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <Input
              name="handle"
              placeholder={t("form.placeholder")}
              required
              className="w-full"
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("form.loading") : t("form.button")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {result.error ? (
            <Card className="mx-auto max-w-4xl">
              <CardContent className="pt-6">
                <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                  <strong>{t("results.error")}:</strong> {result.error}
                </div>
              </CardContent>
            </Card>
          ) : result.success && result.profile ? (
            <div className="space-y-6">
              <ProfileCard profile={result.profile} />

              {(() => {
                if (result.feed && typeof result.feed === "object") {
                  return (
                    <Card className="mx-auto max-w-4xl">
                      <CardHeader>
                        <CardTitle>{t("results.feedData")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <details className="cursor-pointer">
                          <summary className="text-sm font-medium text-gray-700 mb-2">
                            View Raw Feed Data
                          </summary>
                          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm mt-2">
                            {JSON.stringify(result.feed, null, 2)}
                          </pre>
                        </details>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })()}
            </div>
          ) : (
            <Card className="mx-auto max-w-4xl">
              <CardContent className="pt-6">
                <div className="text-gray-600">{t("results.noData")}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

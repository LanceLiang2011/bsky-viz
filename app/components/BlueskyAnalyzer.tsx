"use client";

import { useState } from "react";
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

interface AnalysisResult {
  success?: boolean;
  error?: string;
  profile?: unknown;
  feed?: unknown;
}

export default function BlueskyAnalyzer() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setResult(null);

    try {
      const response = await analyzeUser(formData);
      setResult(response);
    } catch {
      setResult({ error: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Enter Bluesky Handle</CardTitle>
          <CardDescription>
            Enter a Bluesky username (e.g., username.bsky.social or @username)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <Input
              name="handle"
              placeholder="username.bsky.social"
              required
              className="w-full"
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze User"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                <strong>Error:</strong> {result.error}
              </div>
            ) : result.success && result.profile && result.feed ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Profile Data</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(result.profile, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Feed Data</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(result.feed, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">No data available</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

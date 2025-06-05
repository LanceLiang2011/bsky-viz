"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShareButton from "./ShareButton";
import SummaryCard from "./SummaryCard";
import AnimalCard from "./AnimalCard";
import { BackgroundGradient } from "./ui/background-gradient";
import { type Animal } from "@/app/types/animals";

interface OpenAISummaryCardProps {
  summary: string;
  handle: string;
  username?: string;
  animal?: Animal | null;
  animalReason?: string | null;
}

export default function OpenAISummaryCard({
  summary,
  username,
  handle,
  animal,
  animalReason,
}: OpenAISummaryCardProps) {
  const t = useTranslations();
  const cardRef = useRef<HTMLDivElement>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  const handleBeforeCapture = () => {
    setShowUserInfo(true);
  };

  const handleAfterCapture = () => {
    // Reset after a longer delay to ensure capture is completely finished
    setTimeout(() => {
      setShowUserInfo(false);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Header with Share Button */}
        <div className="flex flex-row items-center justify-between px-6 sm:px-8 pt-6 pb-4 bg-background/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-border/50 rounded-t-[22px]">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="summary">
              {t("openai.summaryTitle")}
            </TabsTrigger>
            <TabsTrigger value="animal">{t("openai.animalTitle")}</TabsTrigger>
          </TabsList>

          <ShareButton
            targetRef={cardRef}
            filename={`bsky-viz-${activeTab}`}
            variant="ghost"
            size="sm"
            beforeCapture={handleBeforeCapture}
            afterCapture={handleAfterCapture}
          />
        </div>

        {/* Tab Content */}
        <div ref={cardRef}>
          {/* Summary Tab */}
          <TabsContent value="summary" className="mt-0">
            <BackgroundGradient
              className="rounded-[22px] bg-background dark:bg-zinc-900"
              gradientColors="subtle"
              animate={true}
            >
              <SummaryCard
                summary={summary}
                username={username}
                handle={handle}
                showUserInfo={showUserInfo}
              />
            </BackgroundGradient>
          </TabsContent>

          {/* Animal Tab */}
          <TabsContent value="animal" className="mt-0">
            <AnimalCard
              animal={animal}
              animalReason={animalReason}
              username={username}
              handle={handle}
              showUserInfo={showUserInfo}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

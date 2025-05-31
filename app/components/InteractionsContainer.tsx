"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AvatarCloud from "./AvatarCloud";
import InteractionsList from "./InteractionsList";
import type { InteractionData } from "./analysis-types";

interface InteractionsContainerProps {
  interactions: InteractionData[];
  currentUser?: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  className?: string;
  maxHeight?: string;
  maxItems?: number;
}

export default function InteractionsContainer({
  interactions,
  currentUser,
  className = "",
  maxHeight = "max-h-60",
  maxItems = 30,
}: InteractionsContainerProps) {
  const t = useTranslations();

  // Debug logging for client-side rendering
  console.log("🎨 InteractionsContainer Debug:");
  console.log("  Interactions received:", interactions?.length || 0);
  console.log("  Sample interactions:", interactions?.slice(0, 2));
  console.log("  Current user:", currentUser);

  return (
    <div className={`bg-card p-3 sm:p-4 rounded-lg border ${className}`}>
      <h3 className="text-base sm:text-lg font-medium mb-4">
        {t("analysis.topInteractions")}
      </h3>

      <Tabs defaultValue="circle" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="circle">{t("analysis.friendCircle")}</TabsTrigger>
          <TabsTrigger value="list">
            {t("analysis.interactionsList")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="circle" className="mt-4">
          <AvatarCloud interactions={interactions} currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <InteractionsList
            interactions={interactions}
            maxHeight={maxHeight}
            maxItems={maxItems}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

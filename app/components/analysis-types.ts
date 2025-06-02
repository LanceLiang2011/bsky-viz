// Re-export all component types for easier imports
export type { default as KeyInsights } from "./KeyInsights";
export type { default as TopInteractions } from "./TopInteractions";
export type { default as ActivityByHourChart } from "./ActivityByHourChart";
export type { default as MostActiveTimeSection } from "./MostActiveTimeSection";

// Type exports for external use
export interface InsightsData {
  totalPosts: number;
  totalReplies: number;
  totalReposts: number;
  averagePostLength: number;
}

export interface TopInteractionData {
  postsWithLinks: number;
}

export interface InteractionData {
  did: string;
  handle: string;
  displayName: string;
  avatar?: string;
  count: number;
}

export interface KeyInsightsProps {
  insights: InsightsData;
  className?: string;
}

export interface TopInteractionsProps {
  interactions: InteractionData[];
  currentUser?: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  className?: string;
  maxHeight?: string;
}

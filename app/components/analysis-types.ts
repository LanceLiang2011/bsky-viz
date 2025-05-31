// Re-export all component types for easier imports
export type { default as KeyInsights } from "./KeyInsights";
export type { default as MostActiveTime } from "./MostActiveTime";
export type { default as TopInteractions } from "./TopInteractions";

// Type exports for external use
export interface InsightsData {
  totalPosts: number;
  totalReplies: number;
  totalReposts: number;
  averagePostLength: number;
}

export interface MostActiveTimeData {
  totalPosts: number;
  totalReplies: number;
  totalReposts: number;
  averagePostLength: number;
  mostActiveHour: number;
  mostActiveDay: string;
  postsWithMedia: number;
  postsWithLinks: number;
  languagesUsed: Record<string, number>;
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

export interface MostActiveTimeProps {
  data: MostActiveTimeData;
  localizedMostActiveHour: number;
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

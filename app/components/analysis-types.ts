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
  mostActiveHour: number;
  mostActiveDay: string;
}

export interface InteractionData {
  did: string;
  handle: string;
  displayName: string;
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
  className?: string;
  maxHeight?: string;
}

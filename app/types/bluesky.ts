// Core Bluesky API Response Types
export interface BlueskyProfile {
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

export interface BlueskyPost {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record: {
    text: string;
    createdAt: string;
    $type: string;
    reply?: {
      root: { uri: string; cid: string };
      parent: { uri: string; cid: string };
    };
    embed?: {
      $type: string;
      [key: string]: unknown;
    };
    facets?: Array<{
      index: { byteStart: number; byteEnd: number };
      features: Array<{
        $type: string;
        [key: string]: unknown;
      }>;
    }>;
    langs?: string[];
    labels?: Record<string, unknown>;
    tags?: string[];
  };
  embed?: Record<string, unknown>;
  indexedAt: string;
  likeCount?: number;
  replyCount?: number;
  repostCount?: number;
  viewer?: {
    like?: string;
    repost?: string;
    threadMuted?: boolean;
    embeddingDisabled?: boolean;
  };
  labels?: Record<string, unknown>[];
  threadgate?: Record<string, unknown>;
}

export interface BlueskyFeedItem {
  post: BlueskyPost;
  reply?: {
    root: BlueskyPost;
    parent: BlueskyPost;
    grandparentAuthor?: {
      did: string;
      handle: string;
      displayName?: string;
      avatar?: string;
    };
  };
  reason?: {
    $type: string;
    by: {
      did: string;
      handle: string;
      displayName?: string;
      avatar?: string;
    };
    indexedAt: string;
  };
}

export interface BlueskyFeedResponse {
  feed: BlueskyFeedItem[];
  cursor?: string;
}

// Preprocessed Data Types
export interface PreprocessedPost {
  id: string; // uri
  cid: string;
  text: string;
  createdAt: string;
  indexedAt: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  metrics: {
    likes: number;
    replies: number;
    reposts: number;
  };
  metadata: {
    languages?: string[];
    hasMedia: boolean;
    hasLinks: boolean;
    hashtags: string[];
    mentions: string[];
    textLength: number;
  };
  embed?: {
    type: string;
    data: unknown;
  };
}

export interface PreprocessedReply extends PreprocessedPost {
  replyTo: {
    root?: {
      uri?: string;
      cid?: string;
      author?: {
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
      };
    };
    parent?: {
      uri?: string;
      cid?: string;
      author?: {
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
      };
    };
  };
  threadDepth: number;
}

export interface PreprocessedRepost {
  id: string; // repost uri
  createdAt: string;
  indexedAt: string;
  reposter: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  originalPost: PreprocessedPost;
}

export interface CategorizedContent {
  ownPosts: PreprocessedPost[];
  ownReplies: PreprocessedReply[];
  ownReposts: PreprocessedRepost[];
  otherContent: BlueskyFeedItem[]; // Everything else for interaction analysis
  metadata: {
    totalItems: number;
    userContentItems: number;
    originalPostsCount: number;
    repliesCount: number;
    repostsCount: number;
    timeRange: {
      earliest: string;
      latest: string;
    };
  };
}

export interface ProcessedFeedData {
  activityByHour: Record<number, number>;
  activityByHourAndType?: {
    posts: Record<number, number>;
    replies: Record<number, number>;
    reposts: Record<number, number>;
  };
  activityTimeline: Array<{
    date: string;
    posts: number;
    replies: number;
    reposts: number;
    likes: number;
    total: number;
  }>;
  topInteractions: Array<{
    did: string;
    handle: string;
    displayName: string;
    avatar?: string;
    count: number;
  }>;
  commonHashtags: Array<{
    tag: string;
    count: number;
  }>;
  rawText?: string; // Raw text for client-side processing
  isChineseContent?: boolean; // Flag to indicate Chinese content
  insights: {
    totalPosts: number;
    totalReplies: number;
    totalReposts: number;
    averagePostLength: number;
    mostActiveHour: number;
    mostActiveDay: string;
    postsWithMedia: number;
    postsWithLinks: number;
  };
}

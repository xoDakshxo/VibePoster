export interface TrendWithCounts {
  id: string;
  name: string;
  keywords: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  styleCard: StyleCardView | null;
  _count: {
    scrapedPosts: number;
    posts: number;
  };
}

export interface StyleCardView {
  id: string;
  trendId: string;
  tone: string;
  format: string;
  minWords: number;
  maxWords: number;
  hooks: string[];
  avoid: string[];
  examples: string[];
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScrapedPostView {
  id: string;
  trendId: string;
  uri: string;
  authorHandle: string;
  content: string;
  likes: number;
  reposts: number;
  replies: number;
  engagement: number;
  postedAt: Date;
}

export interface PostView {
  id: string;
  trendId: string;
  content: string;
  status: string;
  tweetId: string | null;
  tweetUrl: string | null;
  createdAt: Date;
  publishedAt: Date | null;
  trend?: {
    id: string;
    name: string;
  };
}

// Helper to parse JSON string fields from the DB StyleCard
export function parseStyleCard(raw: {
  id: string;
  trendId: string;
  tone: string;
  format: string;
  minWords: number;
  maxWords: number;
  hooks: string;
  avoid: string;
  examples: string;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}): StyleCardView {
  return {
    ...raw,
    hooks: JSON.parse(raw.hooks),
    avoid: JSON.parse(raw.avoid),
    examples: JSON.parse(raw.examples),
  };
}

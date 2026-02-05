const BSKY_PUBLIC_API = "https://public.api.bsky.app/xrpc";

export interface BlueskyPost {
  uri: string;
  authorDid: string;
  authorHandle: string;
  content: string;
  likes: number;
  reposts: number;
  replies: number;
  engagement: number;
  postedAt: string;
}

interface SearchPostsResponse {
  posts: Array<{
    uri: string;
    author: {
      did: string;
      handle: string;
      displayName?: string;
    };
    record: {
      text: string;
      createdAt: string;
    };
    likeCount?: number;
    repostCount?: number;
    replyCount?: number;
  }>;
  cursor?: string;
}

export async function searchBlueskyPosts(
  query: string,
  options: { hoursBack?: number; limit?: number } = {}
): Promise<BlueskyPost[]> {
  const { hoursBack = 48, limit = 50 } = options;

  const since = new Date(
    Date.now() - hoursBack * 60 * 60 * 1000
  ).toISOString();

  const allPosts: BlueskyPost[] = [];
  let cursor: string | undefined;
  const perPage = Math.min(limit, 100);

  while (allPosts.length < limit) {
    const params = new URLSearchParams({
      q: query,
      sort: "top",
      since,
      limit: String(perPage),
    });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(
      `${BSKY_PUBLIC_API}/app.bsky.feed.searchPosts?${params}`
    );

    if (!res.ok) {
      throw new Error(
        `Bluesky search failed: ${res.status} ${res.statusText}`
      );
    }

    const data: SearchPostsResponse = await res.json();

    for (const post of data.posts) {
      const likes = post.likeCount ?? 0;
      const reposts = post.repostCount ?? 0;
      const replies = post.replyCount ?? 0;

      allPosts.push({
        uri: post.uri,
        authorDid: post.author.did,
        authorHandle: post.author.handle,
        content: post.record.text,
        likes,
        reposts,
        replies,
        engagement: likes + reposts * 2 + replies,
        postedAt: post.record.createdAt,
      });
    }

    cursor = data.cursor;
    if (!cursor || data.posts.length < perPage) break;
  }

  // Sort by engagement descending and trim to limit
  return allPosts
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, limit);
}

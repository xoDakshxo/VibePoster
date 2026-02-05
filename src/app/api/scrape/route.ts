import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchBlueskyPosts } from "@/lib/bluesky";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { trendId, hoursBack = 48, limit = 50 } = body;

  if (!trendId) {
    return NextResponse.json(
      { error: "trendId is required" },
      { status: 400 }
    );
  }

  const trend = await prisma.trend.findUnique({ where: { id: trendId } });
  if (!trend) {
    return NextResponse.json(
      { error: "Trend not found" },
      { status: 404 }
    );
  }

  // Clear old scraped posts for this trend
  await prisma.scrapedPost.deleteMany({ where: { trendId } });

  // Scrape from Bluesky
  const posts = await searchBlueskyPosts(trend.keywords, {
    hoursBack,
    limit,
  });

  // Store scraped posts
  if (posts.length > 0) {
    await prisma.scrapedPost.createMany({
      data: posts.map((p) => ({
        trendId,
        uri: p.uri,
        authorDid: p.authorDid,
        authorHandle: p.authorHandle,
        content: p.content,
        likes: p.likes,
        reposts: p.reposts,
        replies: p.replies,
        engagement: p.engagement,
        postedAt: new Date(p.postedAt),
      })),
    });
  }

  // Update trend status
  await prisma.trend.update({
    where: { id: trendId },
    data: { status: "scraped" },
  });

  return NextResponse.json({
    scrapedCount: posts.length,
    topPost: posts[0] || null,
    posts,
  });
}

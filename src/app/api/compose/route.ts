import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { composePost } from "@/lib/llm";
import { parseStyleCard } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { trendId, count = 1 } = body;

  if (!trendId) {
    return NextResponse.json(
      { error: "trendId is required" },
      { status: 400 }
    );
  }

  const trend = await prisma.trend.findUnique({
    where: { id: trendId },
    include: { styleCard: true },
  });

  if (!trend) {
    return NextResponse.json(
      { error: "Trend not found" },
      { status: 404 }
    );
  }

  if (!trend.styleCard || !trend.styleCard.locked) {
    return NextResponse.json(
      { error: "Trend must have a locked Style Card before composing posts." },
      { status: 422 }
    );
  }

  const styleCard = parseStyleCard(trend.styleCard);

  // Get recent scraped content for context
  const recentPosts = await prisma.scrapedPost.findMany({
    where: { trendId },
    orderBy: { postedAt: "desc" },
    take: 10,
  });

  const recentContent = recentPosts.map((p) => p.content);

  // Generate posts
  const generatedPosts = [];
  for (let i = 0; i < Math.min(count, 5); i++) {
    const content = await composePost(trend.name, styleCard, recentContent);

    const post = await prisma.post.create({
      data: {
        trendId,
        content,
        status: "draft",
      },
    });

    generatedPosts.push(post);
  }

  // Update trend status to active
  if (trend.status !== "active") {
    await prisma.trend.update({
      where: { id: trendId },
      data: { status: "active" },
    });
  }

  return NextResponse.json({ posts: generatedPosts });
}

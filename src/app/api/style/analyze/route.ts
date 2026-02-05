import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeStyle } from "@/lib/llm";
import { parseStyleCard } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { trendId } = body;

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

  // Get scraped posts
  const scrapedPosts = await prisma.scrapedPost.findMany({
    where: { trendId },
    orderBy: { engagement: "desc" },
    take: 50,
  });

  if (scrapedPosts.length === 0) {
    return NextResponse.json(
      { error: "No scraped posts found. Run a scrape first." },
      { status: 422 }
    );
  }

  // Analyze with LLM
  const styleData = await analyzeStyle(
    trend.name,
    scrapedPosts.map((p) => ({
      content: p.content,
      likes: p.likes,
      reposts: p.reposts,
    }))
  );

  // Delete existing unlocked style card if any
  await prisma.styleCard.deleteMany({
    where: { trendId, locked: false },
  });

  // Create new style card
  const styleCard = await prisma.styleCard.create({
    data: {
      trendId,
      tone: styleData.tone,
      format: styleData.format,
      minWords: styleData.min_words,
      maxWords: styleData.max_words,
      hooks: JSON.stringify(styleData.hooks),
      avoid: JSON.stringify(styleData.avoid),
      examples: JSON.stringify(styleData.examples),
      locked: false,
    },
  });

  return NextResponse.json({ styleCard: parseStyleCard(styleCard) });
}

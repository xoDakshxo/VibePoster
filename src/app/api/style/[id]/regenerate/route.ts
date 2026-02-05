import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeStyle } from "@/lib/llm";
import { parseStyleCard } from "@/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await prisma.styleCard.findUnique({
    where: { id: params.id },
    include: { trend: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Style Card not found" },
      { status: 404 }
    );
  }

  if (existing.locked) {
    return NextResponse.json(
      { error: "Cannot regenerate a locked Style Card. Unlock it first." },
      { status: 422 }
    );
  }

  // Get scraped posts for the trend
  const scrapedPosts = await prisma.scrapedPost.findMany({
    where: { trendId: existing.trendId },
    orderBy: { engagement: "desc" },
    take: 50,
  });

  if (scrapedPosts.length === 0) {
    return NextResponse.json(
      { error: "No scraped posts found. Run a scrape first." },
      { status: 422 }
    );
  }

  // Re-analyze with LLM
  const styleData = await analyzeStyle(
    existing.trend.name,
    scrapedPosts.map((p) => ({
      content: p.content,
      likes: p.likes,
      reposts: p.reposts,
    }))
  );

  const updated = await prisma.styleCard.update({
    where: { id: params.id },
    data: {
      tone: styleData.tone,
      format: styleData.format,
      minWords: styleData.min_words,
      maxWords: styleData.max_words,
      hooks: JSON.stringify(styleData.hooks),
      avoid: JSON.stringify(styleData.avoid),
      examples: JSON.stringify(styleData.examples),
    },
  });

  return NextResponse.json({ styleCard: parseStyleCard(updated) });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const trends = await prisma.trend.findMany({
    include: {
      styleCard: { select: { id: true, tone: true, locked: true } },
      _count: { select: { scrapedPosts: true, posts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ trends });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, keywords, description } = body;

  if (!name || !keywords) {
    return NextResponse.json(
      { error: "name and keywords are required" },
      { status: 400 }
    );
  }

  const trend = await prisma.trend.create({
    data: { name, keywords, description: description || null },
  });

  return NextResponse.json(trend, { status: 201 });
}

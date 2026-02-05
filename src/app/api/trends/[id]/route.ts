import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseStyleCard } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const trend = await prisma.trend.findUnique({
    where: { id: params.id },
    include: {
      styleCard: true,
      _count: { select: { scrapedPosts: true, posts: true } },
    },
  });

  if (!trend) {
    return NextResponse.json(
      { error: "Trend not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ...trend,
    styleCard: trend.styleCard ? parseStyleCard(trend.styleCard) : null,
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const trend = await prisma.trend.findUnique({
    where: { id: params.id },
  });

  if (!trend) {
    return NextResponse.json(
      { error: "Trend not found" },
      { status: 404 }
    );
  }

  await prisma.trend.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}

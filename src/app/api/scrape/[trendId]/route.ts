import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { trendId: string } }
) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  const posts = await prisma.scrapedPost.findMany({
    where: { trendId: params.trendId },
    orderBy: { engagement: "desc" },
    take: limit,
    skip: offset,
  });

  return NextResponse.json({ posts });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { postTweet } from "@/lib/x-api";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });

  if (!post) {
    return NextResponse.json(
      { error: "Post not found" },
      { status: 404 }
    );
  }

  if (post.status !== "approved") {
    return NextResponse.json(
      { error: "Post must be approved before publishing." },
      { status: 422 }
    );
  }

  const result = await postTweet(post.content);

  await prisma.post.update({
    where: { id: params.id },
    data: {
      status: "published",
      tweetId: result.id,
      tweetUrl: result.url,
      publishedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    tweetId: result.id,
    tweetUrl: result.url,
  });
}

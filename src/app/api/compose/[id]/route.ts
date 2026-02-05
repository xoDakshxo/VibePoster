import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const post = await prisma.post.findUnique({ where: { id: params.id } });

  if (!post) {
    return NextResponse.json(
      { error: "Post not found" },
      { status: 404 }
    );
  }

  const updateData: Record<string, unknown> = {};

  if (body.content !== undefined) updateData.content = body.content;
  if (body.status !== undefined) {
    const validStatuses = ["draft", "approved", "rejected"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }
    updateData.status = body.status;
  }

  const updated = await prisma.post.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

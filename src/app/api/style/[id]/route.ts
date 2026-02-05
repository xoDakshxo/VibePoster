import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseStyleCard } from "@/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const existing = await prisma.styleCard.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Style Card not found" },
      { status: 404 }
    );
  }

  const updateData: Record<string, unknown> = {};

  if (body.tone !== undefined) updateData.tone = body.tone;
  if (body.format !== undefined) updateData.format = body.format;
  if (body.minWords !== undefined) updateData.minWords = body.minWords;
  if (body.maxWords !== undefined) updateData.maxWords = body.maxWords;
  if (body.hooks !== undefined)
    updateData.hooks = JSON.stringify(body.hooks);
  if (body.avoid !== undefined)
    updateData.avoid = JSON.stringify(body.avoid);
  if (body.examples !== undefined)
    updateData.examples = JSON.stringify(body.examples);
  if (body.locked !== undefined) updateData.locked = body.locked;

  const updated = await prisma.styleCard.update({
    where: { id: params.id },
    data: updateData,
  });

  // If locking the style card, update trend status
  if (body.locked === true) {
    await prisma.trend.update({
      where: { id: updated.trendId },
      data: { status: "styled" },
    });
  }

  return NextResponse.json({ styleCard: parseStyleCard(updated) });
}

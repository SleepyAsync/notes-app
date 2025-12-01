import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const { id, title, content } = body as {
    id?: string;
    title: string;
    content: string;
  };

  if (!title?.trim()) {
    return new NextResponse("Title is required", { status: 400 });
  }

  const note = await prisma.note.upsert({
    where: { id: id ?? "" },
    create: {
      title,
      content,
      userId: session.user.id,
    },
    update: {
      title,
      content,
    },
  });

  return NextResponse.json(note);
}


export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  await prisma.note.delete({
    where: {
      id,
    },
  });

  return new NextResponse(null, { status: 204 });
}


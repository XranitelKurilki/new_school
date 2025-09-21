import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const item = await prisma.class.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            headTeacher: { select: { id: true, name: true } },
            lessons: {
                select: {
                    id: true,
                    day: true,
                    lessonNumber: true,
                    subject: true,
                    room: true,
                    teacher: { select: { id: true, name: true } },
                },
                orderBy: [{ day: "asc" }, { lessonNumber: "asc" }],
            },
        },
    });

    if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(item);
}



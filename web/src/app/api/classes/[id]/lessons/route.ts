import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || (((session.user as { role?: number })?.role) ?? 0) < 5) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = (await req.json()) as { day: string; lessonNumber: number; subjectId: string; subject?: string; room: string; teacherId?: string | null };
    const { day, lessonNumber, subjectId, subject, room, teacherId } = body;

    const subj = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subj) return NextResponse.json({ message: "Invalid subjectId" }, { status: 400 });
    if (teacherId) {
        const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
        if (!teacher) return NextResponse.json({ message: "Invalid teacherId" }, { status: 400 });
    }

    const created = await prisma.lesson.create({
        data: { classId: id, day, lessonNumber, subject: subject ?? subj.name, subjectId, room, teacherId: teacherId ?? null },
        include: { teacher: { select: { id: true, name: true } } },
    });
    return NextResponse.json(created, { status: 201 });
}



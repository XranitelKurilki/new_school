import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ lessonId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || (((session.user as { role?: number })?.role) ?? 0) < 5) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const { lessonId } = await params;
    const body = (await req.json()) as { day?: string; lessonNumber?: number; subjectId?: string | null; subject?: string; room?: string; teacherId?: string | null };

    // normalize empty strings
    if (body && 'teacherId' in body && (!body.teacherId || body.teacherId === "")) body.teacherId = null;
    if (body && 'subjectId' in body && (!body.subjectId || body.subjectId === "")) body.subjectId = null;

    if (body.subjectId) {
        const subj = await prisma.subject.findUnique({ where: { id: body.subjectId } });
        if (!subj) return NextResponse.json({ message: "Invalid subjectId" }, { status: 400 });
        if (!body.subject) body.subject = subj.name;
    }
    if (typeof body.teacherId === "string" && body.teacherId.length > 0) {
        const teacher = await prisma.teacher.findUnique({ where: { id: body.teacherId } });
        if (!teacher) return NextResponse.json({ message: "Invalid teacherId" }, { status: 400 });
    }
    const updated = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
            day: body.day,
            lessonNumber: body.lessonNumber,
            subject: body.subject,
            subjectId: body.subjectId ?? undefined,
            room: body.room,
            teacherId: body.teacherId ?? undefined,
        },
        include: { teacher: { select: { id: true, name: true } } },
    });
    return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ lessonId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || (((session.user as { role?: number })?.role) ?? 0) < 5) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const { lessonId } = await params;
    await prisma.lesson.delete({ where: { id: lessonId } });
    return NextResponse.json({ ok: true });
}



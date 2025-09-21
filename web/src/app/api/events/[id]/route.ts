import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || (((session.user as { role?: number })?.role) ?? 0) < 5) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = (await req.json()) as { title?: string; description?: string | null; date?: string };
    const updated = await prisma.event.update({
        where: { id },
        data: {
            title: body.title,
            description: body.description,
            date: body.date ? new Date(body.date) : undefined,
        },
    });
    return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || (((session.user as { role?: number })?.role) ?? 0) < 5) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    try {
        await prisma.event.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (e) {
        // Если уже удалено/нет записи — вернуть 200 идемпотентно
        return NextResponse.json({ ok: true });
    }
}



import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/auth";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {};
    if (from || to) {
        where.date = {} as any;
        if (from) (where.date as any).gte = new Date(from);
        if (to) (where.date as any).lte = new Date(to);
    }

    const events = await prisma.event.findMany({
        where,
        orderBy: { date: "asc" },
        select: { id: true, title: true, description: true, date: true },
    });
    return NextResponse.json(events);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (((session.user as { role?: number })?.role) ?? 0) < 5) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const body = (await req.json()) as { title: string; description?: string; date: string };
    if (!body?.title || !body?.date) {
        return NextResponse.json({ message: "title and date are required" }, { status: 400 });
    }
    const created = await prisma.event.create({
        data: {
            title: body.title,
            description: body.description ?? null,
            date: new Date(body.date),
            createdById: (session.user as { id?: string })?.id ?? null,
        },
    });
    return NextResponse.json(created, { status: 201 });
}



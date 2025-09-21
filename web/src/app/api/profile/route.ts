import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    console.log("[GET /api/profile] session:", {
        hasSession: !!session,
        userId: session?.user?.id,
    });
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, image: true } });
        console.log("[GET /api/profile] user: ", !!user);
        return NextResponse.json(user);
    } catch (e) {
        console.error("[GET /api/profile] error:", e);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    console.log("[PUT /api/profile] session:", {
        hasSession: !!session,
        userId: session?.user?.id,
    });
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    try {
        const body = (await req.json()) as { name?: string };
        const updated = await prisma.user.update({ where: { id: session.user.id }, data: { name: body.name } });
        console.log("[PUT /api/profile] updated name");
        return NextResponse.json({ ok: true, name: updated.name });
    } catch (e) {
        console.error("[PUT /api/profile] error:", e);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}



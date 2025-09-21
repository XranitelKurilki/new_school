import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const body = (await req.json()) as { currentPassword: string; newPassword: string };
    if (!body?.currentPassword || !body?.newPassword) return NextResponse.json({ message: "Bad Request" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.passwordHash) return NextResponse.json({ message: "No password set" }, { status: 400 });

    const ok = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!ok) return NextResponse.json({ message: "Wrong password" }, { status: 400 });

    const newHash = await bcrypt.hash(body.newPassword, 10);
    await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: newHash } });
    return NextResponse.json({ ok: true });
}



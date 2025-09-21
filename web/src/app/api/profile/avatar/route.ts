import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) return NextResponse.json({ message: "Bad Request" }, { status: 400 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ message: "File required" }, { status: 400 });

    // В демо: сохраняем картинку как data URL в базе (для проде вынести в S3/Cloudinary)
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    await prisma.user.update({ where: { id: session.user.id }, data: { image: dataUrl } });
    return NextResponse.json({ ok: true, image: dataUrl });
}



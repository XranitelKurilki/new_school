import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const classes = await prisma.class.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, headTeacher: { select: { id: true, name: true } } },
    });
    return NextResponse.json(classes);
}



import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const teachers = await prisma.teacher.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(teachers);
}



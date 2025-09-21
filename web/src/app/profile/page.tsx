import { getServerSession } from "next-auth";
import authOptions from "@/auth";
import { redirect } from "next/navigation";
import ProfileClient from "./ui/ProfileClient";
import prisma from "@/lib/prisma";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    console.log("[/profile] session:", { hasSession: !!session, userId: (session?.user as { id?: string })?.id });
    if (!session) redirect("/login");

    const profile = await prisma.user.findUnique({
        where: { id: (session.user as { id?: string })?.id ?? "" },
        select: { id: true, name: true, email: true, image: true },
    });
    console.log("[/profile] profile loaded:", !!profile);

    if (!profile) {
        return (
            <div className="min-h-dvh p-6 max-w-xl mx-auto">
                <h1 className="text-2xl font-semibold mb-2">Профиль</h1>
                <div className="opacity-80">Не удалось загрузить профиль.</div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh p-6 max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold">Профиль</h1>
            <ProfileClient initial={profile} />
        </div>
    );
}



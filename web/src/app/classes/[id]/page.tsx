import { getServerSession } from "next-auth";
import authOptions from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DayTabs from "@/components/DayTabs";

const dayOrder = ["MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const dayLabel: Record<string, string> = {
    MON: "Понедельник",
    TUE: "Вторник",
    WED: "Среда",
    THU: "Четверг",
    FRI: "Пятница",
    SAT: "Суббота",
};

async function getData(id: string) {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/classes/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as {
        id: string;
        name: string;
        headTeacher: { id: string; name: string } | null;
        lessons: { id: string; day: string; lessonNumber: number; subject: string; room: string; teacher: { id: string; name: string } | null }[];
    } | null;
}

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const data = await getData(id);
    if (!data) return redirect("/");

    const lessonsByDay = Object.fromEntries(dayOrder.map((d) => [d, [] as typeof data.lessons]));
    for (const l of data.lessons) {
        (lessonsByDay[l.day] as typeof data.lessons).push(l);
    }

    const isEdit = ((session.user as { role?: number })?.role ?? 0) >= 5;

    return (
        <div className="min-h-dvh p-8 max-w-3xl mx-auto space-y-6">
            <div className="flex items-baseline justify-between gap-3">
                <h1 className="text-2xl font-semibold">{data.name}</h1>
                <Link href="/" className="text-sm opacity-70 hover:opacity-100">← Назад</Link>
            </div>
            <div className="opacity-80">Классный руководитель: {data.headTeacher?.name ?? "—"}</div>

            <DayTabs
                days={dayOrder.map((d) => ({ key: d, label: dayLabel[d] }))}
                lessonsByDay={lessonsByDay as Record<string, any>}
                initialDay={dayOrder.find((d) => (lessonsByDay as any)[d]?.length > 0) || dayOrder[0]}
                editable={isEdit}
                classId={data.id}
            />
        </div>
    );
}



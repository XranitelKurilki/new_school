import { getServerSession } from "next-auth";
import authOptions from "@/auth";
import { redirect } from "next/navigation";
import CreateEvent from "./ui/CreateEvent";
import EventActions from "./ui/EventActions";

type EventDto = { id: string; title: string; description?: string | null; date: string };

async function getEvents() {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/events`, { cache: "no-store" });
    if (!res.ok) return [] as EventDto[];
    return (await res.json()) as EventDto[];
}

function formatDateLabel(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", { weekday: "long", day: "2-digit", month: "long" });
}

export default async function CalendarPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const events = await getEvents();
    const byDate = new Map<string, EventDto[]>();
    for (const e of events) {
        const key = new Date(e.date).toISOString().slice(0, 10);
        if (!byDate.has(key)) byDate.set(key, []);
        byDate.get(key)!.push(e);
    }

    const ordered = Array.from(byDate.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    const canEdit = ((session.user as { role?: number })?.role ?? 0) >= 5;

    return (
        <div className="min-h-dvh p-6 max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-semibold">Календарь</h1>
                {canEdit ? <CreateEvent /> : null}
            </div>
            {ordered.length === 0 ? (
                <div className="opacity-60">Событий нет</div>
            ) : (
                ordered.map(([date, list]) => (
                    <section key={date} className="space-y-2">
                        <div className="text-sm font-medium opacity-80">{formatDateLabel(date)}</div>
                        <div className="space-y-2">
                            {list.map((e) => (
                                <div key={e.id} className="border border-black/10 dark:border-white/10 rounded-md p-3 flex items-start justify-between gap-3">
                                    <div>
                                        <div className="font-medium">{e.title}</div>
                                        {e.description ? (
                                            <div className="text-sm opacity-80 mt-1">{e.description}</div>
                                        ) : null}
                                    </div>
                                    {canEdit ? (
                                        <EventActions event={e} />
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}



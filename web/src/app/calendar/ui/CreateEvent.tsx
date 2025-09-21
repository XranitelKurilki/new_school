"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEvent() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function submit() {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/events", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ title: title.trim(), description: description.trim(), date }),
        });
        setLoading(false);
        if (!res.ok) {
            setError("Не удалось создать событие");
            return;
        }
        setOpen(false);
        setTitle("");
        setDescription("");
        router.refresh();
    }

    return (
        <>
            <button onClick={() => setOpen(true)} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10 text-sm hover:bg-black/[.03] dark:hover:bg-white/[.06]">
                Создать мероприятие
            </button>
            {open ? (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-lg border border-black/10 dark:border-white/10 bg-background p-4 space-y-3">
                        <div className="text-lg font-semibold">Создать мероприятие</div>
                        <label className="text-sm">
                            <span className="block mb-1">Дата</span>
                            <input type="date" className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
                        </label>
                        <label className="text-sm">
                            <span className="block mb-1">Название</span>
                            <input className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </label>
                        <label className="text-sm">
                            <span className="block mb-1">Описание</span>
                            <textarea className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </label>
                        {error ? <div className="text-red-500 text-sm">{error}</div> : null}
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setOpen(false)} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10">Отмена</button>
                            <button onClick={submit} disabled={loading} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10 disabled:opacity-50">
                                {loading ? "Сохраняю..." : "Сохранить"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}



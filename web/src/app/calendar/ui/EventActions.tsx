"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EventActions({ event }: { event: { id: string; title: string; description?: string | null; date: string } }) {
    const router = useRouter();
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [title, setTitle] = useState(event.title);
    const [description, setDescription] = useState(event.description ?? "");
    const [date, setDate] = useState<string>(new Date(event.date).toISOString().slice(0, 10));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function save() {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/events/${event.id}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ title, description, date }),
        });
        setLoading(false);
        if (!res.ok) {
            setError("Не удалось сохранить");
            return;
        }
        setOpenEdit(false);
        router.refresh();
    }

    async function remove() {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
        setLoading(false);
        if (!res.ok) {
            setError("Не удалось удалить");
            return;
        }
        setOpenDelete(false);
        router.refresh();
    }

    return (
        <>
            <button onClick={() => setOpenEdit(true)} className="h-8 px-2 rounded-md border border-black/10 dark:border-white/10 text-xs hover:bg-black/[.03] dark:hover:bg-white/[.06]">Изменить</button>
            <button onClick={() => setOpenDelete(true)} className="h-8 px-2 rounded-md border border-black/10 dark:border-white/10 text-xs hover:bg-black/[.03] dark:hover:bg-white/[.06]">Удалить</button>

            {openEdit ? (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-lg border border-black/10 dark:border-white/10 bg-background p-4 space-y-3">
                        <div className="text-lg font-semibold">Изменить событие</div>
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
                            <button onClick={() => setOpenEdit(false)} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10">Отмена</button>
                            <button onClick={save} disabled={loading} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10 disabled:opacity-50">{loading ? "Сохраняю..." : "Сохранить"}</button>
                        </div>
                    </div>
                </div>
            ) : null}

            {openDelete ? (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-lg border border-black/10 dark:border-white/10 bg-background p-4 space-y-3">
                        <div className="text-lg font-semibold">Удалить событие</div>
                        <div className="text-sm opacity-80">Вы уверены, что хотите удалить "{event.title}"?</div>
                        {error ? <div className="text-red-500 text-sm">{error}</div> : null}
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => setOpenDelete(false)} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10">Отмена</button>
                            <button onClick={remove} disabled={loading} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10 disabled:opacity-50">Удалить</button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}



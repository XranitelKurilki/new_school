"use client";
import { useState } from "react";

export type LessonItem = {
    id: string;
    day: string;
    lessonNumber: number;
    subject: string;
    subjectId?: string | null;
    room: string;
    teacher: { id: string; name: string } | null;
};

export default function DayTabs({
    days,
    lessonsByDay,
    initialDay,
    editable,
    classId,
}: {
    days: { key: string; label: string }[];
    lessonsByDay: Record<string, LessonItem[]>;
    initialDay?: string;
    editable?: boolean;
    classId: string;
}) {
    const defaultDay = initialDay && lessonsByDay[initialDay] ? initialDay : days[0]?.key;
    const [active, setActive] = useState<string>(defaultDay);
    const [data, setData] = useState<Record<string, LessonItem[]>>(() => {
        const copy: Record<string, LessonItem[]> = {};
        for (const k of Object.keys(lessonsByDay)) copy[k] = [...lessonsByDay[k]];
        return copy;
    });

    const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
    const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);

    const [modal, setModal] = useState<
        | { type: "add"; day: string; lesson?: undefined }
        | { type: "edit"; day: string; lesson: LessonItem }
        | { type: "delete"; day: string; lesson: LessonItem }
        | null
    >(null);

    const [form, setForm] = useState<{ day: string; lessonNumber: number; subjectId: string; subject: string; room: string; teacherId: string }>(
        { day: defaultDay, lessonNumber: 1, subjectId: "", subject: "", room: "", teacherId: "" }
    );

    async function ensureLookups() {
        try {
            if (subjects.length === 0) {
                const res = await fetch("/api/subjects");
                if (res.ok) setSubjects(await res.json());
            }
            if (teachers.length === 0) {
                const res = await fetch("/api/teachers");
                if (res.ok) setTeachers(await res.json());
            }
        } catch { }
    }

    async function openAdd(day: string) {
        await ensureLookups();
        setForm({ day, lessonNumber: (data[day]?.[data[day].length - 1]?.lessonNumber ?? 0) + 1, subjectId: subjects[0]?.id ?? "", subject: subjects[0]?.name ?? "", room: "", teacherId: teachers[0]?.id ?? "" });
        setModal({ type: "add", day });
    }
    async function openEdit(lesson: LessonItem) {
        await ensureLookups();
        setForm({ day: lesson.day, lessonNumber: lesson.lessonNumber, subjectId: lesson.subjectId ?? "", subject: lesson.subject, room: lesson.room, teacherId: lesson.teacher?.id ?? "" });
        setModal({ type: "edit", day: lesson.day, lesson });
    }
    function openDelete(lesson: LessonItem) {
        setModal({ type: "delete", day: lesson.day, lesson });
    }

    async function submitAdd() {
        const res = await fetch(`/api/classes/${classId}/lessons`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                day: form.day,
                lessonNumber: form.lessonNumber,
                subjectId: form.subjectId,
                subject: form.subject,
                room: form.room,
                teacherId: form.teacherId || null,
            }),
        });
        if (!res.ok) return;
        const created: any = await res.json();
        setData((prev) => ({ ...prev, [form.day]: [...(prev[form.day] ?? []), { ...created, teacher: created.teacher ?? null }] }));
        setModal(null);
    }

    async function submitEdit(lessonId: string) {
        const res = await fetch(`/api/lessons/${lessonId}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                day: form.day,
                lessonNumber: form.lessonNumber,
                subjectId: form.subjectId,
                subject: form.subject,
                room: form.room,
                teacherId: form.teacherId || null,
            }),
        });
        if (!res.ok) return;
        const updated: any = await res.json();
        setData((prev) => {
            const copy: Record<string, LessonItem[]> = {};
            for (const k of Object.keys(prev)) copy[k] = [...prev[k]];
            for (const k of Object.keys(copy)) copy[k] = copy[k].filter((l) => l.id !== updated.id);
            copy[updated.day] = [...(copy[updated.day] ?? []), { ...updated, teacher: updated.teacher ?? null }];
            copy[updated.day].sort((a, b) => a.lessonNumber - b.lessonNumber);
            return copy;
        });
        setModal(null);
    }

    async function submitDelete(lessonId: string, day: string) {
        const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
        if (!res.ok) return;
        setData((prev) => ({ ...prev, [day]: (prev[day] ?? []).filter((l) => l.id !== lessonId) }));
        setModal(null);
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {days.map((d) => (
                        <button
                            key={d.key}
                            onClick={() => setActive(d.key)}
                            className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${active === d.key
                                ? "border-black/20 dark:border-white/20 bg-black/[.06] dark:bg-white/[.08]"
                                : "border-black/10 dark:border-white/10 hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                                }`}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-2">
                    {editable ? (
                        <div className="flex justify-end">
                            <button
                                onClick={() => openAdd(active)}
                                className="h-8 px-3 rounded-md border border-black/10 dark:border-white/10 text-sm hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                            >
                                Добавить урок
                            </button>
                        </div>
                    ) : null}
                    {(data[active] ?? []).length === 0 ? (
                        <div className="opacity-60 text-sm">Нет уроков</div>
                    ) : (
                        (data[active] ?? []).map((l) => (
                            <div
                                key={l.id}
                                className="flex items-center justify-between border border-black/10 dark:border-white/10 rounded-md p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center">
                                        {l.lessonNumber}
                                    </div>
                                    <div>
                                        <div className="font-medium">{l.subject}</div>
                                        <div className="text-xs opacity-70">Преподаватель: {l.teacher?.name ?? "—"}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm opacity-80">Кабинет {l.room}</div>
                                    {editable ? (
                                        <>
                                            <button
                                                onClick={() => openEdit(l)}
                                                className="h-8 px-2 rounded-md border border-black/10 dark:border-white/10 text-xs hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => openDelete(l)}
                                                className="h-8 px-2 rounded-md border border-black/10 dark:border-white/10 text-xs hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                                            >
                                                Удалить
                                            </button>
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {editable && modal ? (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-lg border border-black/10 dark:border-white/10 bg-background p-4 space-y-3">
                        {modal.type === "delete" ? (
                            <>
                                <div className="text-lg font-semibold">Удалить урок</div>
                                <div className="text-sm opacity-80">Вы уверены, что хотите удалить урок "{modal.lesson?.subject}"?</div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={() => setModal(null)} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10">Отмена</button>
                                    <button onClick={() => submitDelete(modal.lesson!.id, modal.day)} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10">Удалить</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-semibold">{modal.type === "add" ? "Добавить урок" : "Изменить урок"}</div>
                                <div className="grid gap-3">
                                    {modal.type === "add" ? (
                                        <label className="text-sm">
                                            <span className="block mb-1">День</span>
                                            <select
                                                className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2"
                                                value={form.day}
                                                onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                                            >
                                                {days.map((d) => (
                                                    <option key={d.key} value={d.key}>{d.label}</option>
                                                ))}
                                            </select>
                                        </label>
                                    ) : null}

                                    <label className="text-sm">
                                        <span className="block mb-1">Номер урока</span>
                                        <input type="number" className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2"
                                            value={form.lessonNumber}
                                            onChange={(e) => setForm((f) => ({ ...f, lessonNumber: Number(e.target.value) }))}
                                        />
                                    </label>

                                    <label className="text-sm">
                                        <span className="block mb-1">Предмет</span>
                                        <select
                                            className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2"
                                            value={form.subjectId}
                                            onChange={(e) => {
                                                const sid = e.target.value;
                                                const s = subjects.find((x) => x.id === sid);
                                                setForm((f) => ({ ...f, subjectId: sid, subject: s?.name ?? f.subject }));
                                            }}
                                        >
                                            {subjects.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="text-sm">
                                        <span className="block mb-1">Кабинет</span>
                                        <input className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2"
                                            value={form.room}
                                            onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                                        />
                                    </label>

                                    <label className="text-sm">
                                        <span className="block mb-1">Преподаватель</span>
                                        <select
                                            className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2"
                                            value={form.teacherId}
                                            onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
                                        >
                                            <option value="">—</option>
                                            {teachers.map((t) => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button onClick={() => setModal(null)} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10">Отмена</button>
                                    {modal.type === "add" ? (
                                        <button onClick={submitAdd} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10">Добавить</button>
                                    ) : (
                                        <button onClick={() => submitEdit(modal.lesson!.id)} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10">Сохранить</button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : null}
        </>
    );
}



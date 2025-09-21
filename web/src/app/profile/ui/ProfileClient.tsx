"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileClient({ initial }: { initial: { id: string; name?: string | null; email?: string | null; image?: string | null } }) {
    const router = useRouter();
    const [name, setName] = useState(initial.name ?? "");
    const [image, setImage] = useState<string | null>(initial.image ?? null);
    const [pwd, setPwd] = useState({ current: "", next: "" });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    async function saveName() {
        setLoading(true);
        setMsg(null);
        const res = await fetch("/api/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
        setLoading(false);
        if (!res.ok) return setMsg("Не удалось сохранить имя");
        router.refresh();
    }

    async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        setLoading(true);
        setMsg(null);
        const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
        setLoading(false);
        if (!res.ok) return setMsg("Не удалось загрузить аватар");
        const data = await res.json();
        setImage(data.image ?? null);
        router.refresh();
    }

    async function changePassword() {
        if (!pwd.current || !pwd.next) return setMsg("Заполните пароли");
        setLoading(true);
        setMsg(null);
        const res = await fetch("/api/profile/password", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }) });
        setLoading(false);
        if (!res.ok) return setMsg("Не удалось сменить пароль");
        setPwd({ current: "", next: "" });
        setMsg("Пароль обновлен");
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    {image ? <img src={image} alt="avatar" className="w-full h-full object-cover" /> : null}
                </div>
                <label className="text-sm cursor-pointer inline-flex items-center gap-2">
                    <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
                    <span className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/[.03] dark:hover:bg-white/[.06]">Загрузить аватар</span>
                </label>
            </div>

            <div className="space-y-2">
                <label className="text-sm block">
                    <span className="block mb-1">Имя и фамилия</span>
                    <input className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <button onClick={saveName} disabled={loading} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10 disabled:opacity-50">Сохранить</button>
            </div>

            <div className="space-y-2">
                <div className="text-sm opacity-80">Почта: {initial.email ?? "—"}</div>
            </div>

            <div className="space-y-2">
                <div className="font-medium">Смена пароля</div>
                <label className="text-sm block">
                    <span className="block mb-1">Текущий пароль</span>
                    <input type="password" className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2" value={pwd.current} onChange={(e) => setPwd((s) => ({ ...s, current: e.target.value }))} />
                </label>
                <label className="text-sm block">
                    <span className="block mb-1">Новый пароль</span>
                    <input type="password" className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2" value={pwd.next} onChange={(e) => setPwd((s) => ({ ...s, next: e.target.value }))} />
                </label>
                <button onClick={changePassword} disabled={loading} className="h-9 px-3 rounded-md border border-black/10 dark:border-white/10 disabled:opacity-50">Обновить пароль</button>
            </div>

            {msg ? <div className="text-sm opacity-80">{msg}</div> : null}
        </div>
    );
}



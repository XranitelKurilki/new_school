"use client";
import { useState, FormEvent, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });
        setLoading(false);
        if (!res || res.error) {
            setError("Неверная почта или пароль");
            return;
        }
        const callbackUrl = params.get("callbackUrl") ?? "/";
        router.replace(callbackUrl);
    }

    return (
        <div className="min-h-dvh flex items-center justify-center p-6">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-sm bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-6 space-y-4"
            >
                <h1 className="text-xl font-semibold">Вход</h1>
                <label className="block text-sm">
                    <span className="mb-1 block">Почта</span>
                    <input
                        type="email"
                        className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <label className="block text-sm">
                    <span className="mb-1 block">Пароль</span>
                    <input
                        type="password"
                        className="w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                {error ? (
                    <p className="text-red-500 text-sm">{error}</p>
                ) : null}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-foreground text-background py-2 disabled:opacity-50"
                >
                    {loading ? "Входим..." : "Войти"}
                </button>
            </form>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}



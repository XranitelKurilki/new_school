"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`px-3 py-2 rounded-md text-sm transition-colors ${active ? "underline underline-offset-4" : "hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                }`}
        >
            {label}
        </Link>
    );
}

export default function Header() {
    const pathname = usePathname();
    const { status } = useSession();
    const isSchedule = pathname === "/" || pathname?.startsWith("/classes");

    if (pathname === "/login") return null;
    if (status !== "authenticated") return null;

    return (
        <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-black/10 dark:border-white/10">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-black/10 dark:bg-white/10" />
                        <span className="font-semibold">Школа 35</span>
                    </Link>
                    <div className="hidden sm:flex items-center gap-2 ml-4">
                        <div className="w-24 h-5 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
                    </div>
                </div>

                <nav className="flex items-center gap-1">
                    <NavLink href="/" label="Расписание" active={!!isSchedule} />
                    <NavLink href="/calendar" label="Календарь" active={pathname === "/calendar"} />
                    <NavLink href="/orders" label="Заказы" active={pathname === "/orders"} />
                    <NavLink href="/reception" label="Приемная" active={pathname === "/reception"} />
                    <NavLink href="/profile" label="Профиль" active={pathname === "/profile"} />
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="ml-1 px-3 py-2 rounded-md text-sm hover:bg-black/[.03] dark:hover:bg-white/[.06]"
                    >
                        Выйти
                    </button>
                </nav>
            </div>
        </header>
    );
}



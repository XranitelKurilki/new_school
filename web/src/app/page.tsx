import { getServerSession } from "next-auth";
import authOptions from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }
  const res = await fetch(`${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/classes`, { cache: "no-store" });
  const classes: { id: string; name: string; headTeacher: { id: string; name: string } | null }[] = await res.json();

  return (
    <div className="min-h-dvh p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Классы</h1>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {classes.map((c) => (
          <Link
            key={c.id}
            href={`/classes/${c.id}${typeof (session.user as any)?.role !== "undefined" && (session.user as any).role >= 5 ? "?edit=1" : ""}`}
            className="inline-flex items-center justify-center h-9 px-3 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/[.03] dark:hover:bg-white/[.06] transition-colors text-sm"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

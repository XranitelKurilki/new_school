import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import type { NextAuthOptions, DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: { email: {}, password: {} },
            async authorize(credentials): Promise<{ id: string; name?: string; email?: string; image?: string; role?: number } | null> {
                const parsed = await signInSchema.safeParseAsync(credentials);
                if (!parsed.success) return null;
                const { email, password } = parsed.data;

                const user = await prisma.user.findUnique({ where: { email } });
                if (!user || !user.passwordHash) return null;

                const ok = await bcrypt.compare(password, user.passwordHash);
                if (!ok) return null;

                return {
                    id: user.id,
                    name: user.name ?? undefined,
                    email: user.email ?? undefined,
                    image: user.image ?? undefined,
                    role: (user as any).role ?? 0,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.userId = (user as { id: string }).id;
                // @ts-expect-error extend
                token.role = (user as { role?: number }).role ?? 0;
            }
            return token as JWT;
        },
        async session({ session, token }) {
            if (session.user && (token as JWT).userId) {
                session.user.id = (token as JWT).userId;
            }
            // @ts-expect-error extend
            (session.user as any).role = (token as any).role ?? 0;
            return session;
        },
    },
};

export default authOptions;

declare module "next-auth" {
    interface Session {
        user?: (DefaultSession["user"] & { id?: string; role?: number }) | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        userId?: string;
        role?: number;
    }
}



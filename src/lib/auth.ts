import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// JWT sessions, no database adapter. Credentials is the only provider, so the
// Account/Session/VerificationToken tables an adapter needs would sit empty.
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/auth/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        // A password-less account (created by an admin, or a future OTP
        // sign-up) can't authenticate here.
        if (!user?.password || !user.isActive) return null;

        if (!(await bcrypt.compare(password, user.password))) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});

/**
 * Is the current request an active admin?
 *
 * The role is re-read from the database rather than trusted from the JWT, so
 * revoking admin takes effect on the next request instead of whenever the
 * token happens to refresh. Never throws — every failure reads as `false` so
 * callers fail closed.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth();
    if (!session?.user?.id) return false;
    const me = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true },
    });
    return !!me && me.isActive && me.role === "ADMIN";
  } catch {
    return false;
  }
}

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import authConfig from "@/auth.config";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Credentials se define aquí (runtime Node) y no en auth.config, para no arrastrar
  // bcryptjs/pg al bundle edge del proxy. No hay registro: solo valida usuarios
  // existentes con password_hash (provisionados con `npm run set-password`).
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const r = await db.query<{ id: string; password_hash: string | null; active: boolean }>(
          `select id, password_hash, active from users where email = $1 limit 1`,
          [email]
        );
        const u = r.rows[0];
        if (!u || !u.password_hash || !u.active) return null;

        const ok = await bcrypt.compare(password, u.password_hash);
        if (!ok) return null;

        return { id: u.id, email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    // Corre en el flujo de login (runtime Node). Crea el usuario si es nuevo
    // (active = true por defecto) y deniega el acceso si fue desactivado.
    async signIn({ user }) {
      const email = user.email?.trim().toLowerCase();
      if (!email) return false;
      const r = await db.query<{ active: boolean }>(
        `insert into users (email) values ($1)
         on conflict (email) do update set last_seen_at = now()
         returning active`,
        [email]
      );
      return r.rows[0]?.active ?? false;
    },
    async jwt({ token, user }) {
      // user solo está presente en el login inicial → único momento que toca la BD.
      if (user?.email) {
        const email = user.email.trim().toLowerCase();
        const r = await db.query<{ id: string; active: boolean }>(
          `select id, active from users where email = $1 limit 1`,
          [email]
        );
        if (r.rows[0]) {
          token.userId = r.rows[0].id;
          token.active = r.rows[0].active;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? "";
        session.user.active = (token.active as boolean) ?? false;
      }
      return session;
    },
  },
});

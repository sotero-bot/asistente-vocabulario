import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

// Config compartida y edge-safe (sin acceso a la BD / pg).
// La usa proxy.ts para proteger rutas y lib/auth.ts la extiende con los
// callbacks que tocan Postgres (signIn / jwt / session), que solo corren en Node.
export default {
  providers: [Google, MicrosoftEntraID],
  pages: {
    signIn: "/login",
    error: "/sin-acceso",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;

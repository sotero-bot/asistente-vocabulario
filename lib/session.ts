import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export interface ActiveUser {
  userId: string;
  email: string;
}

// Resuelve el usuario autenticado desde la sesión y verifica que siga activo.
// Devuelve null si no hay sesión o el usuario fue desactivado — las rutas API
// deben tratar ese caso como 401/403 en vez de confiar en datos del cliente.
export async function getActiveUser(): Promise<ActiveUser | null> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;

  const r = await db.query<{ id: string; active: boolean }>(
    `select id, active from users where email = $1 limit 1`,
    [email]
  );
  const u = r.rows[0];
  if (!u || !u.active) return null;
  return { userId: u.id, email };
}

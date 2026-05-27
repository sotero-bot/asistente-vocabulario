import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { logout } from "@/app/actions";

interface AdminUserRow {
  id: string;
  email: string;
  profession_label: string | null;
  active: boolean;
  has_password: boolean;
  created_at: string;
  last_seen_at: string;
}

async function toggleActive(formData: FormData) {
  "use server";
  const session = await auth();
  if (!isAdmin(session?.user?.email)) throw new Error("No autorizado");
  const id = formData.get("id") as string;
  const next = formData.get("next") === "true";
  await db.query("update users set active = $1 where id = $2", [next, id]);
  revalidatePath("/admin");
}

async function setPassword(formData: FormData) {
  "use server";
  const session = await auth();
  if (!isAdmin(session?.user?.email)) throw new Error("No autorizado");
  const id = formData.get("id") as string;
  const password = (formData.get("password") as string | null)?.trim();
  if (!password || password.length < 6) return;
  const hash = await bcrypt.hash(password, 12);
  await db.query("update users set password_hash = $1 where id = $2", [hash, id]);
  revalidatePath("/admin");
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (!isAdmin(session.user.email)) redirect("/");

  const res = await db.query<AdminUserRow>(
    `select id, email, profession_label, active,
            (password_hash is not null) as has_password,
            created_at, last_seen_at
       from users
      order by created_at desc`
  );
  const users = res.rows;

  const fmt = (d: string) =>
    new Date(d).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Administración de usuarios</h1>
            <p className="text-sm text-slate-500">
              {users.length} usuario{users.length === 1 ? "" : "s"} · gestiona acceso y contraseñas
            </p>
          </div>
          <form action={logout}>
            <button className="text-slate-400 hover:text-red-600 text-xs underline transition-colors">
              Cerrar sesión
            </button>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Perfil</th>
                <th className="px-4 py-3 font-semibold">Registro</th>
                <th className="px-4 py-3 font-semibold">Última actividad</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Contraseña</th>
                <th className="px-4 py-3 font-semibold text-right">Acceso</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-800">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500">{u.profession_label ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmt(u.created_at)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{fmt(u.last_seen_at)}</td>
                  <td className="px-4 py-3">
                    {u.active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        ● Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        ● Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <form action={setPassword} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={u.id} />
                      <input
                        type="password"
                        name="password"
                        placeholder={u.has_password ? "••••••••" : "Sin contraseña"}
                        minLength={6}
                        className="w-32 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-slate-300"
                      />
                      <button
                        type="submit"
                        className="px-2 py-1 text-xs bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg transition-colors"
                      >
                        Guardar
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={toggleActive}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="next" value={(!u.active).toString()} />
                      <button
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          u.active
                            ? "bg-white border border-slate-200 text-slate-600 hover:border-red-400 hover:text-red-600"
                            : "bg-blue-600 text-white hover:bg-blue-500"
                        }`}
                      >
                        {u.active ? "Desactivar" : "Activar"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

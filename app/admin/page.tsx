import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { logout } from "@/app/actions";

interface AdminUserRow {
  id: string;
  email: string;
  profession_label: string | null;
  active: boolean;
  created_at: string;
  last_seen_at: string;
}

async function toggleActive(formData: FormData) {
  "use server";
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    throw new Error("No autorizado");
  }
  const id = formData.get("id") as string;
  const next = formData.get("next") === "true";
  await db.query("update users set active = $1 where id = $2", [next, id]);
  revalidatePath("/admin");
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");
  if (!isAdmin(session.user.email)) redirect("/");

  const res = await db.query<AdminUserRow>(
    `select id, email, profession_label, active, created_at, last_seen_at
       from users
      order by created_at desc`
  );
  const users = res.rows;

  const fmt = (d: string) =>
    new Date(d).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Administración de usuarios</h1>
            <p className="text-sm text-slate-500">
              {users.length} usuario{users.length === 1 ? "" : "s"} · activa o desactiva el acceso al chat
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
                <th className="px-4 py-3 font-semibold text-right">Acción</th>
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

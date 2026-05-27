// Es admin el usuario sembrado por seed-admin (ADMIN_USERNAME, default "admin")
// o cualquier email listado en ADMIN_EMAILS (separados por coma).
export function isAdmin(identifier: string | null | undefined): boolean {
  if (!identifier) return false;
  const id = identifier.trim().toLowerCase();

  const adminUsername = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  if (id === adminUsername) return true;

  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(id);
}

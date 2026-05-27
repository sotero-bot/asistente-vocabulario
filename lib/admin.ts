const ADMIN_EMAIL = "sotero@danalyticspro.co";

export function isAdmin(identifier: string | null | undefined): boolean {
  if (!identifier) return false;
  const id = identifier.trim().toLowerCase();

  if (id === ADMIN_EMAIL) return true;

  const extra = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return extra.includes(id);
}

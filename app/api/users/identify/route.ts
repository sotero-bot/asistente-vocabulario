import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const {
    email,
    profession,
    profession_label,
    custom_profession,
    sector,
    custom_sector,
    tone,
  } = (body ?? {}) as Record<string, string | undefined>;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const result = await db.query<{ id: string }>(
      `insert into users
         (email, profession, profession_label, custom_profession, sector, custom_sector, tone)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (email) do update set
         profession        = coalesce(excluded.profession, users.profession),
         profession_label  = coalesce(excluded.profession_label, users.profession_label),
         custom_profession = coalesce(excluded.custom_profession, users.custom_profession),
         sector            = coalesce(excluded.sector, users.sector),
         custom_sector     = coalesce(excluded.custom_sector, users.custom_sector),
         tone              = coalesce(excluded.tone, users.tone),
         last_seen_at      = now()
       returning id`,
      [
        normalizedEmail,
        profession ?? null,
        profession_label ?? null,
        custom_profession ?? null,
        sector ?? null,
        custom_sector ?? null,
        tone ?? null,
      ]
    );
    return NextResponse.json({ user_id: result.rows[0].id });
  } catch (err) {
    console.error("identify error", err);
    return NextResponse.json(
      { error: "No se pudo registrar el usuario" },
      { status: 500 }
    );
  }
}

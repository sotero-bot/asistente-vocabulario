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
  const { email } = (body ?? {}) as { email?: string };
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  const normalized = email.trim().toLowerCase();

  try {
    const r = await db.query(
      `select id as user_id, email, profession, profession_label,
              custom_profession, sector, custom_sector, tone
         from users
        where email = $1
        limit 1`,
      [normalized]
    );
    if (r.rows.length === 0) {
      return NextResponse.json({ found: false });
    }
    return NextResponse.json({ found: true, user: r.rows[0] });
  } catch (err) {
    console.error("lookup error", err);
    return NextResponse.json(
      { error: "No se pudo consultar el usuario" },
      { status: 500 }
    );
  }
}

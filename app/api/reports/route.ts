import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_REASONS = new Set([
  "incorrecto",
  "no_responde",
  "tono",
  "otro",
]);

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { userId, messageId, reason, userComment } = (body ?? {}) as {
    userId?: string;
    messageId?: string | null;
    reason?: string;
    userComment?: string;
  };

  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }
  if (!reason || !VALID_REASONS.has(reason)) {
    return NextResponse.json({ error: "Motivo inválido" }, { status: 400 });
  }

  try {
    const r = await db.query<{ id: string }>(
      `insert into reports (user_id, message_id, reason, user_comment)
       values ($1, $2, $3, $4) returning id`,
      [userId, messageId ?? null, reason, userComment?.trim() || null]
    );
    return NextResponse.json({ id: r.rows[0].id });
  } catch (err) {
    console.error("report insert failed", err);
    return NextResponse.json(
      { error: "No se pudo guardar el reporte" },
      { status: 500 }
    );
  }
}

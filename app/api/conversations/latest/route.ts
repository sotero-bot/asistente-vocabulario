import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const { userId } = (body ?? {}) as { userId?: string };
  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  try {
    const convRes = await db.query<{ id: string }>(
      `select id from conversations
        where user_id = $1
        order by started_at desc
        limit 1`,
      [userId]
    );
    if (convRes.rows.length === 0) {
      return NextResponse.json({ found: false });
    }
    const conversationId = convRes.rows[0].id;
    const msgRes = await db.query(
      `select id as message_id, role, content
         from messages
        where conversation_id = $1
        order by created_at asc`,
      [conversationId]
    );
    return NextResponse.json({
      found: true,
      conversation_id: conversationId,
      messages: msgRes.rows,
    });
  } catch (err) {
    console.error("latest conversation error", err);
    return NextResponse.json(
      { error: "No se pudo cargar la conversación" },
      { status: 500 }
    );
  }
}

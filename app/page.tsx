import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { UserRecord } from "@/lib/profile";
import HomeClient, { InitialMessage } from "@/components/HomeClient";

export default async function Home() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) redirect("/login");

  const userRes = await db.query<UserRecord & { active: boolean }>(
    `select id as user_id, email, profession, profession_label,
            custom_profession, sector, custom_sector, tone, active
       from users
      where email = $1
      limit 1`,
    [email]
  );
  const user = userRes.rows[0];

  // El usuario tuvo que pasar por signIn (que crea la fila), pero re-verificamos
  // active aquí para que una desactivación surta efecto aunque tenga JWT vivo.
  if (!user || !user.active) redirect("/sin-acceso");

  // El admin no usa el chat: va directo al panel.
  if (isAdmin(email)) redirect("/admin");

  const needsOnboarding = !user.profession || !(user.sector || user.custom_sector);

  // Carga la última conversación para usuarios con perfil completo.
  let conversationId: string | null = null;
  let initialMessages: InitialMessage[] = [];
  if (!needsOnboarding) {
    const convRes = await db.query<{ id: string }>(
      `select id from conversations
        where user_id = $1
        order by started_at desc
        limit 1`,
      [user.user_id]
    );
    if (convRes.rows[0]) {
      conversationId = convRes.rows[0].id;
      const msgRes = await db.query<InitialMessage>(
        `select id as message_id, role, content
           from messages
          where conversation_id = $1
          order by created_at asc`,
        [conversationId]
      );
      initialMessages = msgRes.rows;
    }
  }

  return (
    <HomeClient
      user={user}
      needsOnboarding={needsOnboarding}
      initialConversationId={conversationId}
      initialMessages={initialMessages}
    />
  );
}

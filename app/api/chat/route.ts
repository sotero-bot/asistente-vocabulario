import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import { db } from "@/lib/db";
import { getActiveUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const authedUser = await getActiveUser();
  if (!authedUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const userId = authedUser.userId;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const {
    messages,
    profession,
    systemPromptContext,
    tonePrompt,
    tone,
    conversationId,
    termClicked,
  } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Mensajes inválidos" }, { status: 400 });
  }

  // Resolve / create conversation. Solo se acepta un conversationId si pertenece
  // al usuario autenticado; de lo contrario se ignora y se crea uno nuevo.
  let activeConversationId: string | null = null;
  let userMessageId: string | null = null;
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  if (userId) {
    try {
      if (conversationId) {
        const owns = await db.query(
          "select 1 from conversations where id = $1 and user_id = $2 limit 1",
          [conversationId, userId]
        );
        if (owns.rowCount) activeConversationId = conversationId;
      }
      if (!activeConversationId) {
        const r = await db.query<{ id: string }>(
          "insert into conversations (user_id) values ($1) returning id",
          [userId]
        );
        activeConversationId = r.rows[0].id;
      }
      if (lastUserMessage?.content) {
        const r = await db.query<{ id: string }>(
          `insert into messages (conversation_id, role, content, tone, term_clicked)
           values ($1, 'user', $2, $3, $4) returning id`,
          [activeConversationId, lastUserMessage.content, tone ?? null, termClicked ?? null]
        );
        userMessageId = r.rows[0].id;
      }
    } catch (err) {
      console.error("persist user message failed", err);
    }
  }

  const glossaryIndex = GLOSSARY_TERMS.map(
    (t) => `- ${t.term}: ${t.shortDefinition}`
  ).join("\n");

  const systemPrompt = `Eres un asistente experto en inteligencia artificial y agentes de IA, especializado en explicar conceptos técnicos de forma clara y adaptada al contexto profesional del usuario.

${systemPromptContext}

Tono de respuesta (OBLIGATORIO): ${tonePrompt}
Este tono es una instrucción activa que debes aplicar en tu PRÓXIMA respuesta y en todas las siguientes, sin excepción. Si el estilo de mensajes anteriores en esta conversación era diferente, ignóralo completamente y adóptate al tono indicado ahora.

GLOSARIO DE REFERENCIA:
Antes de responder cualquier pregunta sobre un término o concepto de IA, busca primero si aparece en el siguiente glosario. Si lo encuentras, usa esa definición como base autoritativa de tu respuesta y amplíala con ejemplos. Si no lo encuentras, responde con tu conocimiento general.
${glossaryIndex}

RESTRICCIÓN DE ALCANCE (prioridad máxima):
Solo puedes responder preguntas relacionadas con inteligencia artificial, machine learning, agentes de IA, modelos de lenguaje, automatización inteligente y tecnologías afines. Si el usuario hace una pregunta completamente ajena a estos temas (cocina, deportes, historia, geografía, entretenimiento, etc.), responde únicamente: "Solo puedo ayudarte con términos y conceptos de inteligencia artificial. ¿Tienes alguna duda sobre IA?" No respondas ni parcialmente el tema no relacionado bajo ninguna circunstancia.

Reglas importantes:
- Siempre responde en español.
- Responde en texto plano, sin markdown, excepto para resaltar conceptos clave: usa **negrilla** únicamente en el nombre del término principal que estás explicando o en conceptos técnicos directamente relacionados. Máximo 2 o 3 palabras en negrilla por respuesta. No uses almohadillas, guiones de lista ni comillas invertidas.
- Cuando expliques un término, adapta el ejemplo al contexto profesional del usuario (${profession}).
- Sé conciso pero completo. Si el usuario pregunta sobre un término, primero da la definición general y luego un ejemplo específico de su sector.
- Si el usuario pide que expliques cómo aplicar IA en su trabajo, dá recomendaciones prácticas y realistas.
- No inventes capacidades que los modelos actuales no tienen. Si algo está en desarrollo o es experimental, indícalo.
- Puedes sugerir términos relacionados del glosario cuando sea relevante.
- NUNCA termines tu respuesta con preguntas al usuario. No preguntes cosas como "¿te gustaría saber más?", "¿quieres un ejemplo?", "¿cómo crees que esto te puede ayudar?" ni ninguna variante. Da la respuesta completa y ciérrala sin invitar a seguir. El usuario preguntará si quiere profundizar.`;

  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    max_tokens: 800,
    temperature: 0.7,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      let assistantText = "";
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) {
            assistantText += text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }

        // Persist assistant message after streaming completes
        let assistantMessageId: string | null = null;
        if (userId && activeConversationId && assistantText) {
          try {
            const r = await db.query<{ id: string }>(
              `insert into messages (conversation_id, role, content, tone)
               values ($1, 'assistant', $2, $3) returning id`,
              [activeConversationId, assistantText, tone ?? null]
            );
            assistantMessageId = r.rows[0].id;
          } catch (err) {
            console.error("persist assistant message failed", err);
          }
        }

        // Emit meta (ids) before [DONE] so the client can attach them to the rendered message
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              meta: {
                conversationId: activeConversationId,
                userMessageId,
                assistantMessageId,
              },
            })}\n\n`
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

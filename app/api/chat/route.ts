import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { messages, profession, systemPromptContext, tonePrompt } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Mensajes inválidos" }, { status: 400 });
  }

  const systemPrompt = `Eres un asistente experto en inteligencia artificial y agentes de IA, especializado en explicar conceptos técnicos de forma clara y adaptada al contexto profesional del usuario.

${systemPromptContext}

Tono de respuesta (OBLIGATORIO): ${tonePrompt}
Este tono es una instrucción activa que debes aplicar en tu PRÓXIMA respuesta y en todas las siguientes, sin excepción. Si el estilo de mensajes anteriores en esta conversación era diferente, ignóralo completamente y adóptate al tono indicado ahora.

Reglas importantes:
- Siempre responde en español.
- Responde en texto plano, sin markdown, excepto para resaltar conceptos clave: usa **negrilla** únicamente en el nombre del término principal que estás explicando o en conceptos técnicos directamente relacionados. Máximo 2 o 3 palabras en negrilla por respuesta. No uses almohadillas, guiones de lista ni comillas invertidas.
- Cuando expliques un término, adapta el ejemplo al contexto profesional del usuario (${profession}).
- Sé conciso pero completo. Si el usuario pregunta sobre un término, primero da la definición general y luego un ejemplo específico de su sector.
- Si el usuario pide que expliques cómo aplicar IA en su trabajo, dá recomendaciones prácticas y realistas.
- No inventes capacidades que los modelos actuales no tienen. Si algo está en desarrollo o es experimental, indícalo.
- Puedes sugerir términos relacionados del glosario cuando sea relevante.`;

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
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
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

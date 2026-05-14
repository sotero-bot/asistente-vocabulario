"use client";

import { useEffect, useRef } from "react";

export default function TourGuide() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current || window.innerWidth < 768) return;
    started.current = true;

    import("intro.js").then(({ default: introJs }) => {
      introJs()
        .setOptions({
          steps: [
            {
              element: document.querySelector("#tour-glossary") as Element,
              title: "📚 Glosario de IA",
              intro:
                "Aquí encuentras los conceptos clave de Inteligencia Artificial y Agentes. Haz clic en cualquier término y el asistente te lo explicará con ejemplos de tu área profesional.",
            },
            {
              element: document.querySelector("#tour-chat") as Element,
              title: "💬 Tu asistente personal",
              intro:
                "Aquí puedes hacer cualquier pregunta sobre IA. Las respuestas están adaptadas a tu profesión y al tono que elegiste. También puedes cambiarlo cuando quieras.",
            },
          ],
          nextLabel: "Siguiente →",
          prevLabel: "← Anterior",
          doneLabel: "¡Entendido!",
          showBullets: false,
          showProgress: true,
          disableInteraction: true,
          scrollToElement: false,
        })
        .start();
    });
  }, []);

  return null;
}

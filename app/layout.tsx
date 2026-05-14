import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "intro.js/introjs.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Asistente Vocabulario",
  description: "Glosario interactivo de términos de Inteligencia Artificial y Agentes, con explicaciones personalizadas según tu área profesional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-poppins)]">
        {children}
      </body>
    </html>
  );
}

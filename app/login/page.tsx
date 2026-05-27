import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { loginWith, loginWithPassword } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/");

  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo-horizontal.png"
            alt="Asistente Vocabulario"
            width={260}
            height={80}
            priority
            className="object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Asistente Vocabulario</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-8">
          Inicia sesión con tu cuenta corporativa para acceder a tu glosario
          personalizado de IA.
        </p>

        <div className="flex flex-col gap-3">
          <form action={loginWith.bind(null, "google")}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 rounded-xl px-5 py-3 text-sm font-semibold transition-colors shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
              </svg>
              Continuar con Google
            </button>
          </form>

          <form action={loginWith.bind(null, "microsoft-entra-id")}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 rounded-xl px-5 py-3 text-sm font-semibold transition-colors shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true">
                <path fill="#F25022" d="M1 1h10v10H1z" />
                <path fill="#7FBA00" d="M12 1h10v10H12z" />
                <path fill="#00A4EF" d="M1 12h10v10H1z" />
                <path fill="#FFB900" d="M12 12h10v10H12z" />
              </svg>
              Continuar con Microsoft
            </button>
          </form>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">o</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form action={loginWithPassword} className="flex flex-col gap-3 text-left">
          <input
            type="text"
            name="email"
            required
            placeholder="Usuario o correo"
            autoComplete="username"
            className="w-full bg-white border border-slate-200 focus:border-blue-400 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors shadow-sm"
          />
          <input
            type="password"
            name="password"
            required
            placeholder="Contraseña"
            autoComplete="current-password"
            className="w-full bg-white border border-slate-200 focus:border-blue-400 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors shadow-sm"
          />
          {error && (
            <p className="text-sm text-red-600">
              Correo o contraseña incorrectos, o tu cuenta no tiene acceso.
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-3 text-sm font-semibold transition-colors shadow-sm"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

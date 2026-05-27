import Image from "next/image";
import { logout } from "@/app/actions";

export default function SinAccesoPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo-horizontal.png"
            alt="Asistente Vocabulario"
            width={220}
            height={68}
            priority
            className="object-contain"
          />
        </div>
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso no disponible</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-8">
          Tu cuenta aún no tiene acceso al asistente o ha sido desactivada. Si crees
          que es un error, contacta al administrador para que active tu acceso.
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium underline"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

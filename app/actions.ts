"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

export async function loginWith(provider: "google" | "microsoft-entra-id") {
  await signIn(provider, { redirectTo: "/" });
}

export async function loginWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    // Fallo de credenciales → volvemos al login con mensaje. El redirect de un
    // login exitoso lanza NEXT_REDIRECT (no es AuthError) y debe propagarse.
    if (error instanceof AuthError) {
      redirect("/login?error=credenciales");
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión — Dealer OS",
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f4f5f6] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#cc62d5]/10 border border-[#cc62d5]/20 flex items-center justify-center mb-4 shadow-sm">
            <span className="text-2xl font-black text-[#cc62d5]">D</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#131517]">Dealer OS</h1>
          <p className="text-sm text-[#737577] mt-1">Panel de control y gestión comercial</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction } from "@/actions/authActions";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);

    if (res.success) {
      router.push("/");
      router.refresh();
    } else {
      setLoading(false);
      setError(res.error || "No se pudo iniciar sesión.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#b3b5b7]/30 rounded-[32px] md:rounded-[40px] p-6 sm:p-8 space-y-5 shadow-sm"
    >
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#e83b47]/10 border border-[#e83b47]/20 text-[#e83b47] text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#131517] mb-1.5">
          Usuario o Correo
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-[#737577] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            name="email"
            type="text"
            required
            autoComplete="username"
            autoFocus
            placeholder="admin o admin@dealer.com"
            className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl pl-10 pr-3 py-3 text-sm text-[#131517] placeholder-[#737577] focus:outline-none focus:border-[#cc62d5] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#131517] mb-1.5">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-[#737577] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl pl-10 pr-10 py-3 text-sm text-[#131517] placeholder-[#737577] focus:outline-none focus:border-[#cc62d5] focus:bg-white transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737577] hover:text-[#131517] transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-semibold text-sm transition-all duration-200 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Iniciando sesión...</span>
          </>
        ) : (
          "Iniciar sesión"
        )}
      </button>
    </form>
  );
}

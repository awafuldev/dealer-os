"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe, Save, CheckCircle2, AlertCircle, ExternalLink, Building2, Loader2, Sparkles,
} from "lucide-react";
import { updateSiteSettingsAction } from "@/actions/siteSettingsActions";

interface SiteSettingsViewProps {
  org: {
    name: string;
    rnc: string | null;
    logo: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    email: string | null;
  };
  settings: {
    heroHeadline: string | null;
    heroSubheadline: string | null;
    instagramHandle: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    mapEmbedUrl: string | null;
    visitHours: string | null;
    trustTitle1: string | null;
    trustText1: string | null;
    trustTitle2: string | null;
    trustText2: string | null;
    trustTitle3: string | null;
    trustText3: string | null;
    trustTitle4: string | null;
    trustText4: string | null;
    trustTitle5: string | null;
    trustText5: string | null;
    trustTitle6: string | null;
    trustText6: string | null;
    financingIntro: string | null;
    financingBanks: string | null;
    minDownPaymentPct: number | null;
    maxTermMonths: number | null;
    estimatedRatePct: number | null;
  };
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  textarea = false,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  type?: string;
  textarea?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#131517] mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#131517] placeholder-[#737577] focus:outline-none focus:border-[#cc62d5] focus:bg-white transition-all resize-none"
        />
      ) : (
        <input
          name={name}
          type={type}
          step={type === "number" ? "0.01" : undefined}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className="w-full bg-[#f4f5f6] border border-[#b3b5b7]/40 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-[#131517] placeholder-[#737577] focus:outline-none focus:border-[#cc62d5] focus:bg-white transition-all"
        />
      )}
      {hint && <p className="text-[11px] text-[#737577] mt-1 font-medium">{hint}</p>}
    </div>
  );
}

export function SiteSettingsView({ org, settings }: SiteSettingsViewProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const res = await updateSiteSettingsAction(form);
    setLoading(false);
    setMessage(
      res.success
        ? { type: "success", text: "Configuración guardada correctamente." }
        : { type: "error", text: res.error || "Error al guardar configuración." }
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#cc62d5] uppercase tracking-wider">
            Identidad & Web
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#131517] mt-0.5">
            Configuración del Dealer
          </h1>
          <p className="text-xs sm:text-sm text-[#737577] mt-1">
            Personaliza el nombre comercial, RNC, contacto y las secciones de tu showroom web.
          </p>
        </div>
        <Link
          href="/showroom"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[19px] bg-white border border-[#b3b5b7]/40 hover:bg-[#f4f5f6] text-[#131517] font-semibold text-xs sm:text-sm transition-all shadow-2xs"
        >
          <ExternalLink className="w-4 h-4 text-[#cc62d5]" />
          Ver Showroom Web
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs ${
            message.type === "success"
              ? "bg-[#cc62d5]/10 border border-[#cc62d5]/30 text-[#cc62d5]"
              : "bg-[#e83b47]/10 border border-[#e83b47]/30 text-[#e83b47]"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:opacity-75">
            <span className="sr-only">Cerrar</span>
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identidad del Dealer */}
        <section className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="border-b border-[#f4f5f6] pb-3 mb-2">
            <h2 className="text-base font-bold text-[#131517]">Identidad de la Empresa</h2>
            <p className="text-xs text-[#737577]">Datos oficiales que identifican al negocio.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Nombre Comercial del Dealer *"
              name="orgName"
              defaultValue={org.name}
              placeholder="Ej. AutoPrime RD"
              hint="Aparecerá en el panel, contratos, cotizaciones y catálogo web."
            />
            <Field
              label="RNC de la Empresa"
              name="rnc"
              defaultValue={org.rnc}
              placeholder="131-45678-9"
              hint="Utilizado para la generación de contratos y actos de venta."
            />
          </div>
        </section>

        {/* Contacto Público */}
        <section className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="border-b border-[#f4f5f6] pb-3 mb-2">
            <h2 className="text-base font-bold text-[#131517]">Datos de Contacto Público</h2>
            <p className="text-xs text-[#737577]">Canales de comunicación directa para los clientes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Teléfono de Oficina"
              name="phone"
              defaultValue={org.phone}
              placeholder="809-555-0100"
            />
            <Field
              label="WhatsApp de Ventas *"
              name="whatsapp"
              defaultValue={org.whatsapp}
              placeholder="8295550199"
              hint="Número receptor de los prospectos del showroom."
            />
            <Field
              label="Correo de Contacto"
              name="email"
              defaultValue={org.email}
              placeholder="contacto@tudealer.com"
            />
            <Field
              label="Dirección Física del Patio"
              name="address"
              defaultValue={org.address}
              placeholder="Av. 27 de Febrero No. 100, Santo Domingo"
            />
          </div>
        </section>

        {/* Portada (Hero) del Showroom */}
        <section className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="border-b border-[#f4f5f6] pb-3 mb-2">
            <h2 className="text-base font-bold text-[#131517]">Portada del Catálogo Web</h2>
            <p className="text-xs text-[#737577]">Encabezado y mensaje de bienvenida de tu catálogo.</p>
          </div>
          <Field
            label="Titular Principal"
            name="heroHeadline"
            defaultValue={settings.heroHeadline}
            placeholder="Tu próximo vehículo"
          />
          <Field
            label="Subtítulo Descriptivo"
            name="heroSubheadline"
            defaultValue={settings.heroSubheadline}
            textarea
            placeholder="Seleccionamos cada unidad con los más altos estándares de calidad e inspección mecánica."
          />
        </section>

        {/* Bloques de Confianza */}
        <section className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="border-b border-[#f4f5f6] pb-3 mb-2">
            <h2 className="text-base font-bold text-[#131517]">Sección de Confianza del Dealer</h2>
            <p className="text-xs text-[#737577]">
              Puntos clave sobre tu garantía, inspección y servicio que verán los clientes en la web.
            </p>
          </div>
          {([1, 2, 3, 4, 5, 6] as const).map((n) => {
            const titleKey = `trustTitle${n}` as keyof typeof settings;
            const textKey = `trustText${n}` as keyof typeof settings;
            return (
              <div
                key={n}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#f4f5f6] first:border-t-0 first:pt-0"
              >
                <Field
                  label={`Punto ${n} — Título`}
                  name={titleKey}
                  defaultValue={settings[titleKey] as string | null}
                  placeholder="Ej. Proceso transparente"
                />
                <Field
                  label={`Punto ${n} — Descripción`}
                  name={textKey}
                  defaultValue={settings[textKey] as string | null}
                  placeholder="Ej. Cada vehículo se entrega con su historial y documentación al día."
                />
              </div>
            );
          })}
        </section>

        {/* Condiciones de Financiamiento */}
        <section className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="border-b border-[#f4f5f6] pb-3 mb-2">
            <h2 className="text-base font-bold text-[#131517]">Calculadora y Financiamiento</h2>
            <p className="text-xs text-[#737577]">Parámetros para la calculadora de cuotas del showroom.</p>
          </div>
          <Field
            label="Texto Introductorio"
            name="financingIntro"
            defaultValue={settings.financingIntro}
            textarea
            placeholder="Te asesoramos en el proceso de financiamiento con los principales bancos del país..."
          />
          <Field
            label="Bancos Aliados (separados por coma)"
            name="financingBanks"
            defaultValue={settings.financingBanks}
            placeholder="Banco Popular, BHD, Scotiabank, Banreservas"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="Inicial mínimo (%)"
              name="minDownPaymentPct"
              type="number"
              defaultValue={settings.minDownPaymentPct}
              placeholder="20"
            />
            <Field
              label="Plazo máximo (meses)"
              name="maxTermMonths"
              type="number"
              defaultValue={settings.maxTermMonths}
              placeholder="60"
            />
            <Field
              label="Tasa anual estimada (%)"
              name="estimatedRatePct"
              type="number"
              defaultValue={settings.estimatedRatePct}
              placeholder="14.5"
            />
          </div>
        </section>

        {/* Redes Sociales y Horarios */}
        <section className="bg-white border border-[#b3b5b7]/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="border-b border-[#f4f5f6] pb-3 mb-2">
            <h2 className="text-base font-bold text-[#131517]">Redes Sociales y Horario</h2>
            <p className="text-xs text-[#737577]">Enlaces para visitas y presencia digital.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Usuario de Instagram"
              name="instagramHandle"
              defaultValue={settings.instagramHandle}
              placeholder="@tudealer"
            />
            <Field
              label="URL de Instagram"
              name="instagramUrl"
              defaultValue={settings.instagramUrl}
              placeholder="https://instagram.com/tudealer"
            />
            <Field
              label="URL de Facebook"
              name="facebookUrl"
              defaultValue={settings.facebookUrl}
              placeholder="https://facebook.com/tudealer"
            />
            <Field
              label="Horario de Atención"
              name="visitHours"
              defaultValue={settings.visitHours}
              placeholder="Lunes a sábado, 9:00 a.m. – 6:00 p.m."
            />
          </div>
        </section>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[19px] bg-[#cc62d5] hover:bg-[#ba4bc4] text-white font-bold text-sm transition-all disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando cambios...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

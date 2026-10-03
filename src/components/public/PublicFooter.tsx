import Link from "next/link";
import { AtSign, Link2, Phone, Mail, MapPin, Clock } from "lucide-react";
import type { PublicSiteSettings } from "@/lib/siteSettings";

interface OrgLike {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
}

export function PublicFooter({ org, settings }: { org: OrgLike; settings: PublicSiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#05070B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <h3 className="text-lg font-bold text-white">{org.name}</h3>
          <p className="text-sm text-zinc-400 mt-2 max-w-xs">
            Vehículos seleccionados y un proceso de compra claro, de principio a fin.
          </p>
          {(settings.instagramUrl || settings.instagramHandle) && (
            <a
              href={settings.instagramUrl || `https://instagram.com/${settings.instagramHandle?.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-zinc-300 hover:text-white transition-colors"
            >
              <AtSign className="w-4 h-4 text-[#F5B301]" />
              {settings.instagramHandle || "Instagram"}
            </a>
          )}
          {settings.facebookUrl && (
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-2 text-sm text-zinc-300 hover:text-white transition-colors"
            >
              <Link2 className="w-4 h-4 text-[#F5B301]" />
              Facebook
            </a>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Navegación</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><Link href="/showroom" className="hover:text-white transition-colors">Inicio</Link></li>
            <li><Link href="/showroom#inventario" className="hover:text-white transition-colors">Inventario</Link></li>
            <li><Link href="/showroom#financiamiento" className="hover:text-white transition-colors">Financiamiento</Link></li>
            <li><Link href="/showroom#nosotros" className="hover:text-white transition-colors">Nosotros</Link></li>
            <li><Link href="/showroom#contacto" className="hover:text-white transition-colors">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Contacto</h4>
          <ul className="space-y-2.5 text-sm text-zinc-400">
            {org.phone && (
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#F5B301]" /> {org.phone}</li>
            )}
            {org.email && (
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#F5B301]" /> {org.email}</li>
            )}
            {org.address && (
              <li className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-[#F5B301] mt-0.5" /> <span>{org.address}</span></li>
            )}
            {settings.visitHours && (
              <li className="flex items-start gap-2"><Clock className="w-3.5 h-3.5 text-[#F5B301] mt-0.5" /> <span>{settings.visitHours}</span></li>
            )}
            {!org.phone && !org.email && !org.address && (
              <li className="text-zinc-600">Datos de contacto próximamente.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span>© {year} {org.name}. Todos los derechos reservados.</span>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-zinc-700 hover:text-zinc-400 transition-colors">
              Acceso administrativo
            </Link>

            {/* CETU STUDIOS Credit Badge */}
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/25 transition-all duration-300 group">
              <span className="text-[11px] text-zinc-400 tracking-wider uppercase font-medium">
                Hecho por
              </span>
              <div className="flex items-center gap-1.5">
                <img
                  src="/cetu-studios.png"
                  alt="CETU Studios"
                  className="h-5 w-auto object-contain brightness-125 group-hover:scale-110 transition-transform duration-300"
                />
                <span className="text-white font-bold tracking-wider text-[11px] group-hover:text-[#F5B301] transition-colors">
                  CETU STUDIOS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

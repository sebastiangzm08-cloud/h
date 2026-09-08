import Link from "next/link";
import { ConstellationMark } from "./constellation";
import { site } from "@/config/site";

const columnas = [
  {
    titulo: "Producto",
    links: [
      { href: "/que-automatizamos", label: "Qué automatizamos" },
      { href: "/planes", label: "Planes y precios" },
      { href: "/mis-herramientas", label: "Qué puedo automatizar" },
      { href: "/diagnostico", label: "Diagnóstico gratuito" },
    ],
  },
  {
    titulo: "Agencia",
    links: [
      { href: "/nosotros", label: "Nosotros" },
      { href: "/contacto", label: "Contacto" },
    ],
  },
  {
    titulo: "Legal",
    links: [
      { href: "/legal/privacidad", label: "Privacidad" },
      { href: "/legal/terminos", label: "Términos de servicio" },
      { href: "/legal/sla", label: "Acuerdo de nivel de servicio" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <ConstellationMark className="h-6 w-6 text-ink" />
              <span className="text-[0.95rem] font-semibold tracking-tight">
                {site.nombre}
              </span>
            </Link>
            <p className="mt-4 max-w-[32ch] text-[0.875rem] leading-relaxed text-ink-mute">
              {site.claim}.
            </p>
            <p className="eyebrow mt-6">{site.contacto.ubicacion}</p>
          </div>

          {columnas.map((col) => (
            <div key={col.titulo}>
              <p className="eyebrow mb-4">{col.titulo}</p>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[0.875rem] text-ink-mute transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8125rem] text-ink-faint">
            © {new Date().getFullYear()} {site.nombre}. Todos los derechos
            reservados.
          </p>
          <p className="text-[0.8125rem] text-ink-faint">
            {site.contacto.email} · {site.contacto.whatsappVisible}
          </p>
        </div>
      </div>
    </footer>
  );
}

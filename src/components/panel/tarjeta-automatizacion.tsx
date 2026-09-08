/* ==========================================================================
   El cuadro de una automatización. Es la unidad de navegación del panel:
   el cliente toca el cuadro de lo que compró y entra a usarlo.

   Dos formas:
   - contratada → enlace a su pantalla, con estado y resumen
   - del catálogo → apagada, con su precio y el proceso al que pertenece
   ========================================================================== */
import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { Pill, precioMensualTexto } from "@/components/panel/ui";
import {
  nombrePlan,
  nombreProceso,
  type Asignacion,
  type Automatizacion,
} from "@/lib/panel/tipos";
import { cn } from "@/lib/utils";

/** Cada automatización tiene su ícono. Si falta, cae en el rayo genérico. */
const ICONOS: Record<string, NombreIcono> = {
  "redes-sociales": "imagen",
  "agente-whatsapp": "mensajes",
  "prospeccion-clientes": "actividad",
};

function iconoDe(slug: string): NombreIcono {
  return ICONOS[slug] ?? "automatizaciones";
}

const cajaBase =
  "flex w-full flex-col gap-2.5 rounded-[14px] border p-[15px] text-left transition-[transform,border-color] duration-150";

export function TarjetaContratada({ asignacion }: { asignacion: Asignacion }) {
  const { automatizacion: aut, estado, resumen } = asignacion;
  return (
    <Link
      href={`/panel/automatizaciones/${aut.slug}`}
      className={cn(
        cajaBase,
        "border-line bg-surface-2 hover:-translate-y-0.5 hover:border-line-strong"
      )}
    >
      <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-surface-3 text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
        <Icono nombre={iconoDe(aut.slug)} className="h-4 w-4" />
      </span>
      <h3 className="text-[13.5px] font-semibold text-ink">{aut.nombre}</h3>
      <Pill tono={estado === "activa" ? "ok" : "idle"}>
        {estado === "activa" ? "Activa" : "Pausada"}
      </Pill>
      <p className="mt-auto text-[11.5px] text-ink-faint">{resumen}</p>
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-mute">
        Abrir <Icono nombre="flecha" className="h-3 w-3" />
      </span>
    </Link>
  );
}

export function TarjetaCatalogo({
  automatizacion: aut,
  href = "/panel/catalogo",
}: {
  automatizacion: Automatizacion;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        cajaBase,
        "border-dashed border-line-strong bg-white/6 hover:-translate-y-0.5 hover:border-ink-faint"
      )}
    >
      <span className="grid h-8 w-8 place-items-center rounded-[9px] text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
        <Icono nombre={iconoDe(aut.slug)} className="h-4 w-4" />
      </span>
      <h3 className="text-[13.5px] font-semibold text-ink">{aut.nombre}</h3>
      {/* El plan, no el nivel. "Growth" le dice algo al cliente; "N3" no.
          El nivel se queda en la base como dato interno para cotizar. */}
      <Pill>
        Plan {nombrePlan[aut.planMinimo]} · {precioMensualTexto(aut.precioMensual)}
      </Pill>
      <p className="mt-auto text-[11.5px] text-ink-faint">{aut.descripcion}</p>
      {/* Si se construye a pedido, se dice — y se dice cuánto tarda. Nunca
          dejamos creer que está lista y esperando un clic. */}
      {aut.estado === "a_pedido" ? (
        <span className="inline-flex items-center gap-1.5 text-[11.5px] text-warn">
          <Icono nombre="calendario" className="h-3 w-3" />
          Se construye para vos · {aut.plazo}
        </span>
      ) : null}
      <span className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
        {nombreProceso[aut.proceso]}
      </span>
    </Link>
  );
}

/** El cuadro que invita a sumar. Cierra la fila sin dejar un hueco. */
export function TarjetaSumar() {
  return (
    <Link
      href="/panel/catalogo"
      className={cn(
        cajaBase,
        "border-dashed border-line-strong bg-white/6 hover:-translate-y-0.5 hover:border-ink-faint"
      )}
    >
      <span className="grid h-8 w-8 place-items-center rounded-[9px] text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <h3 className="text-[13.5px] font-semibold text-ink">Sumar una automatización</h3>
      <Pill>Catálogo</Pill>
      <p className="mt-auto text-[11.5px] text-ink-faint">
        Agente de WhatsApp y prospección de clientes.
      </p>
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-mute">
        Ver catálogo <Icono nombre="flecha" className="h-3 w-3" />
      </span>
    </Link>
  );
}

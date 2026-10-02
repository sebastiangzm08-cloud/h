/* ==========================================================================
   Filtros y lista de conversaciones (componentes de servidor).

   Los filtros siguen siendo enlaces con `?f=` (no estado de React): así
   "Esperan a una persona" del Resumen (`?f=espera`) sigue funcionando y la
   vista se puede compartir. Las claves de la URL no cambiaron; solo los
   textos: Todas · IA · Humanos · Pendientes.
   ========================================================================== */
import Link from "next/link";
import { Tag, Vacio } from "@/components/panel/agente-ui";
import { hora, type ConversacionAgente } from "@/lib/panel/agente";
import { etiquetaDia } from "@/lib/panel/conversaciones";
import { cn } from "@/lib/utils";
import { iniciales } from "./textos";

export const FILTROS = [
  { clave: "todas", texto: "Todas" },
  { clave: "agente", texto: "IA" },
  { clave: "humano", texto: "Humanos" },
  { clave: "espera", texto: "Pendientes" },
] as const;

export type Filtro = (typeof FILTROS)[number]["clave"];

export function comoFiltro(valor: string | undefined): Filtro {
  return FILTROS.find((f) => f.clave === valor)?.clave ?? "todas";
}

/** `/panel/agente/conversaciones` con el filtro y la conversación en la URL. */
export function hrefConversaciones(filtro: Filtro, conversacionId?: string) {
  const q = new URLSearchParams();
  if (filtro !== "todas") q.set("f", filtro);
  if (conversacionId) q.set("c", conversacionId);
  const texto = q.toString();
  return `/panel/agente/conversaciones${texto ? `?${texto}` : ""}`;
}

/** Los chips de arriba. En celular, con un chat abierto, no se muestran. */
export function Filtros({
  filtro,
  cuentas,
  ocultoEnMovil,
}: {
  filtro: Filtro;
  cuentas: Record<Filtro, number>;
  ocultoEnMovil: boolean;
}) {
  return (
    <nav
      aria-label="Filtrar conversaciones"
      className={cn("flex-none border-b border-line bg-surface", ocultoEnMovil && "max-md:hidden")}
    >
      <div className="sin-barra flex gap-2 overflow-x-auto overscroll-x-contain px-3 py-2 sm:px-4 md:py-2.5">
        {FILTROS.map((f) => {
          const activo = f.clave === filtro;
          return (
            <Link
              key={f.clave}
              href={hrefConversaciones(f.clave)}
              prefetch={false}
              aria-current={activo ? "true" : undefined}
              className={cn(
                "inline-flex h-11 flex-none items-center gap-1.5 rounded-full border px-3.5 text-[13px] whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] md:h-9",
                activo
                  ? "border-[var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)] font-medium text-[color:var(--panel-acento-texto)]"
                  : "border-line bg-surface-2 text-ink-mute hover:border-line-strong hover:text-ink-soft"
              )}
            >
              {f.texto}
              <span
                className={cn(
                  "rounded-full px-1.5 font-mono text-[11px] tabular-nums",
                  activo ? "bg-[var(--panel-acento-fondo)]" : "bg-surface-3 text-ink-mute",
                  f.clave === "espera" && cuentas.espera > 0 && !activo && "bg-warn/15 text-warn"
                )}
              >
                {cuentas[f.clave]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function EtiquetaEstado({ estado }: { estado: ConversacionAgente["estado"] }) {
  if (estado === "espera")
    return (
      <span className="rounded border border-warn/45 bg-warn/10 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.04em] text-warn uppercase">
        Pendiente
      </span>
    );
  if (estado === "humano")
    return (
      <span className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.04em] text-ink-soft uppercase">
        Humano
      </span>
    );
  return (
    <span className="rounded border border-ok/40 bg-ok/10 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.04em] text-ok uppercase">
      IA
    </span>
  );
}

/** Hora si fue hoy; si no, "Ayer" o la fecha corta. */
function cuandoTexto(iso: string) {
  const dia = etiquetaDia(iso);
  return dia.texto === "Hoy" ? hora(iso) : dia.texto;
}

export function ListaConversaciones({
  lista,
  filtro,
  abiertaId,
  ocultaEnMovil,
  ejemplo,
  hayConversaciones,
}: {
  lista: ConversacionAgente[];
  filtro: Filtro;
  abiertaId: string | null;
  ocultaEnMovil: boolean;
  ejemplo: boolean;
  /** ¿Existe alguna conversación (sin importar el filtro)? Cambia el texto del vacío. */
  hayConversaciones: boolean;
}) {
  return (
    <div
      className={cn(
        "scroll-fino min-h-0 overflow-y-auto overscroll-contain border-line md:border-r",
        ocultaEnMovil && "max-md:hidden"
      )}
    >
      {ejemplo ? (
        <p className="border-b border-dashed border-line-strong px-4 py-2 font-mono text-[11px] text-ink-mute">
          Datos de ejemplo
        </p>
      ) : null}

      {lista.length === 0 ? (
        <Vacio>
          {hayConversaciones
            ? "No hay conversaciones con ese filtro."
            : "Todavía no escribió nadie. Cuando alguien le escriba a tu WhatsApp, la conversación aparece acá."}
        </Vacio>
      ) : (
        <ul>
          {lista.map((x, i) => {
            const activa = abiertaId === x.id;
            return (
              <li key={x.id} className="fila-entra" style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}>
                <Link
                  href={hrefConversaciones(filtro, x.id)}
                  prefetch={false}
                  aria-current={activa ? "true" : undefined}
                  className={cn(
                    "flex min-h-[76px] items-start gap-3 border-b border-line px-4 py-3.5 transition-colors active:bg-surface-3",
                    activa
                      ? /* En celular, sin chat abierto, ninguna fila se resalta: no hay nada abierto. */
                        ocultaEnMovil
                        ? "bg-[var(--panel-acento-fondo)] shadow-[inset_2px_0_0_var(--panel-acento)]"
                        : "hover:bg-surface-2 md:bg-[var(--panel-acento-fondo)] md:shadow-[inset_2px_0_0_var(--panel-acento)]"
                      : "hover:bg-surface-2"
                  )}
                >
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line-strong bg-surface-3 font-mono text-[12px] text-ink-mute">
                    {iniciales(x.nombre)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="truncate text-[14px] font-medium text-ink">{x.nombre}</span>
                      <span className="ml-auto flex-none font-mono text-[10.5px] text-ink-mute">
                        {cuandoTexto(x.ultimoEn)}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-ink-mute">
                      {x.ultimoMensaje || "Sin mensajes"}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-1.5">
                      <EtiquetaEstado estado={x.estado} />
                      {x.etiquetas.slice(0, 1).map((e) => (
                        <Tag key={e}>{e}</Tag>
                      ))}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

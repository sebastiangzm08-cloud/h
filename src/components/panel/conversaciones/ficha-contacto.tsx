/* ==========================================================================
   FICHA DEL CONTACTO (Fase 3, 2026-09-30).

   Decisión de Sebastian: datos del contacto + historial de citas, SIN notas
   (y sin tocar la base). Todo sale de tablas reales:
   - `wa_contactos`: nombre, teléfono, estado, etiquetas, cuándo escribió
     por primera vez;
   - `wa_citas`: su historial de citas;
   - "Qué consultó la IA": SOLO si `wa_mensajes.herramientas` trae datos
     (hoy el workflow no la llena, así que normalmente no aparece).

   Es un componente de servidor: se arma una vez y la página lo muestra en la
   columna de la derecha (pantallas grandes) y dentro de la hoja del
   encabezado (celular y tablet).
   ========================================================================== */
import Link from "next/link";
import { Icono } from "@/components/panel/iconos";
import { EstadoPill, Tag } from "@/components/panel/agente-ui";
import { Eyebrow } from "@/components/panel/ui";
import { cn } from "@/lib/utils";
import type { ContactoAgente, ConversacionAgente } from "@/lib/panel/agente";
import type { CitaContacto, HerramientaUsada } from "@/lib/panel/conversaciones";
import { IconoChat } from "./iconos-chat";
import { fechaTexto, iniciales, precioTexto } from "./textos";

const ESTADO_CONTACTO: Record<
  string,
  { texto: string; tono: "agendado" | "cliente" | "perdido" | "neutro" }
> = {
  nuevo: { texto: "Contacto nuevo", tono: "neutro" },
  pregunto_precio: { texto: "Preguntó precio", tono: "neutro" },
  agendado: { texto: "Cita agendada", tono: "agendado" },
  cliente: { texto: "Cliente", tono: "cliente" },
  perdido: { texto: "No volvió", tono: "perdido" },
};

const ESTADO_CITA: Record<
  CitaContacto["estado"],
  { texto: string; tono: "agendado" | "cliente" | "perdido" | "neutro" }
> = {
  confirmada: { texto: "Confirmada", tono: "cliente" },
  sin_confirmar: { texto: "Sin confirmar", tono: "neutro" },
  cumplida: { texto: "Cumplida", tono: "agendado" },
  cancelada: { texto: "Cancelada", tono: "perdido" },
};

function Cita({ cita }: { cita: CitaContacto }) {
  const estado = ESTADO_CITA[cita.estado];
  const precio = precioTexto(cita.monto);
  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-xl border border-line bg-surface-2 px-3 py-2.5",
        !cita.futura && "opacity-80"
      )}
    >
      <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-lg bg-surface-3 text-ink-mute">
        <Icono nombre="calendario" className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] leading-snug font-medium text-ink">
          {cita.servicio || "Cita"}
        </span>
        <span className="mt-0.5 block font-mono text-[11.5px] leading-snug text-ink-mute">
          {cita.fecha} · {cita.hora}
          {precio ? ` · ${precio}` : ""}
        </span>
        <span className="mt-1.5 block">
          <EstadoPill tono={estado.tono}>{estado.texto}</EstadoPill>
        </span>
      </span>
    </li>
  );
}

export function FichaContacto({
  conversacion,
  contacto,
  citas,
  herramientas,
}: {
  conversacion: ConversacionAgente;
  /** Puede faltar (la lista de contactos trae los 300 más recientes). */
  contacto: ContactoAgente | null;
  citas: CitaContacto[];
  herramientas: HerramientaUsada[];
}) {
  const etiquetas = contacto?.etiquetas ?? conversacion.etiquetas;
  const estado = contacto ? (ESTADO_CONTACTO[contacto.estado] ?? ESTADO_CONTACTO.nuevo) : null;
  const proximas = citas.filter((c) => c.futura);
  const anteriores = citas.filter((c) => !c.futura);

  return (
    <div className="flex flex-col gap-5">
      {/* Quién es */}
      <div className="flex flex-col items-center gap-2.5 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-line-strong bg-surface-3 font-mono text-[15px] text-ink-mute">
          {iniciales(conversacion.nombre)}
        </span>
        <div className="min-w-0 max-w-full">
          <h3 className="truncate text-[15px] font-medium text-ink">{conversacion.nombre}</h3>
          {conversacion.telefono ? (
            <a
              href={`tel:${conversacion.telefono.replace(/[^\d+]/g, "")}`}
              className="mx-auto mt-0.5 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-mono text-[12.5px] text-ink-mute transition-colors hover:text-ink active:bg-surface-2"
            >
              <IconoChat nombre="telefono" className="h-3.5 w-3.5 flex-none" />
              {conversacion.telefono}
            </a>
          ) : null}
        </div>
        {estado ? <EstadoPill tono={estado.tono}>{estado.texto}</EstadoPill> : null}
      </div>

      {/* Datos */}
      <dl className="overflow-hidden rounded-xl border border-line">
        <div className="flex items-center justify-between gap-4 bg-surface-2 px-3.5 py-3">
          <dt className="text-[12.5px] text-ink-mute">Canal</dt>
          <dd className="text-[13px] text-ink">WhatsApp</dd>
        </div>
        {contacto?.creadoEn ? (
          <div className="flex items-center justify-between gap-4 border-t border-line bg-surface-2 px-3.5 py-3">
            <dt className="text-[12.5px] text-ink-mute">Contacto creado</dt>
            <dd className="text-right font-mono text-[12.5px] text-ink">{fechaTexto(contacto.creadoEn)}</dd>
          </div>
        ) : null}
      </dl>

      {etiquetas.length > 0 ? (
        <section aria-label="Etiquetas">
          <Eyebrow className="mb-2.5">Etiquetas</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {etiquetas.map((e) => (
              <Tag key={e}>{e}</Tag>
            ))}
          </div>
        </section>
      ) : null}

      {/* Historial de citas */}
      <section aria-label="Historial de citas">
        <Eyebrow className="mb-2.5">Historial de citas</Eyebrow>
        {citas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line-strong px-3.5 py-4 text-[13px] leading-snug text-ink-mute">
            Todavía no tiene citas agendadas.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {proximas.length > 0 ? (
              <div>
                <p className="mb-1.5 text-[12px] text-ink-mute">Próximas</p>
                <ul className="flex flex-col gap-2">
                  {proximas.slice(0, 5).map((c) => (
                    <Cita key={c.id} cita={c} />
                  ))}
                </ul>
              </div>
            ) : null}
            {anteriores.length > 0 ? (
              <div>
                <p className="mb-1.5 text-[12px] text-ink-mute">Anteriores</p>
                <ul className="flex flex-col gap-2">
                  {anteriores.slice(0, 5).map((c) => (
                    <Cita key={c.id} cita={c} />
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
        <Link
          href="/panel/agente/citas"
          prefetch={false}
          className="mt-2 inline-flex min-h-11 items-center gap-1 text-[13px] text-ink-mute underline-offset-2 hover:text-ink hover:underline"
        >
          Ver toda la agenda
          <Icono nombre="flecha" className="h-3.5 w-3.5" />
        </Link>
      </section>

      {/* Solo si de verdad quedó registrado qué consultó la IA. */}
      {herramientas.length > 0 ? (
        <section aria-label="Qué consultó la IA en este chat">
          <Eyebrow className="mb-2.5">Herramientas en uso</Eyebrow>
          <div className="flex flex-wrap gap-1.5">
            {herramientas.map((h) => (
              <span
                key={h.nombre}
                className="inline-flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2.5 py-1 text-[12px] text-ok"
              >
                {h.nombre}
                <span className="font-mono text-[11px] opacity-75">×{h.veces}</span>
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11.5px] leading-snug text-ink-mute">
            Lo que la IA consultó para contestar en este chat.
          </p>
        </section>
      ) : null}
    </div>
  );
}

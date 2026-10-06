"use client";

/* ==========================================================================
   Agenda, versión demostración.

   Solo aparecen las citas que el agente anotó (o está coordinando) en ESTA
   conversación, con el día y la hora tal cual los escribió la persona: la
   demo no tiene calendario ni disponibilidad real, así que no se calcula ni
   se inventa nada. Sin citas → estado vacío que invita a pedir una.
   ========================================================================== */
import { Icono } from "@/components/panel/iconos";
import { Pildora, ResumenCifras } from "@/components/panel/clientes/piezas";
import { cn } from "@/lib/utils";
import type { CitaFila } from "./estado";
import { BotonPanel, Rotulo, VacioPanel } from "./piezas";

const EJEMPLO_PEDIR_CITA = "Quisiera agendar una cita";

export function VistaAgenda({
  citas,
  onIrAlChat,
}: {
  citas: CitaFila[];
  onIrAlChat: (texto?: string) => void;
}) {
  const confirmadas = citas.filter((c) => c.estado === "confirmada").length;
  const porConfirmar = citas.filter((c) => c.estado === "propuesta").length;

  if (citas.length === 0) {
    return (
      <div className="flex h-full min-h-0 flex-col justify-center overflow-y-auto">
        <VacioPanel
          icono="calendario"
          titulo="Todavía no hay citas"
          accion={
            <BotonPanel onClick={() => onIrAlChat(EJEMPLO_PEDIR_CITA)}>Pedirle una cita al agente</BotonPanel>
          }
        >
          Pídale una cita al agente en el chat y dele un día y una hora, por ejemplo «el jueves a las 2:30 p.m.».
          Cuando la confirme, aparece aquí sola.
        </VacioPanel>
      </div>
    );
  }

  return (
    <div className="scroll-fino flex h-full min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain p-4 [&>*]:shrink-0">
      <div>
        <h2 className="text-[17px] font-medium tracking-tight text-ink">Agenda</h2>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-mute">
          Las citas que anota el agente en la conversación de prueba.
        </p>
      </div>

      <ResumenCifras
        etiqueta="Resumen de la agenda de la demostración"
        className="grid-cols-2"
        cifras={[
          { valor: String(confirmadas), etiqueta: "Citas anotadas" },
          { valor: String(porConfirmar), etiqueta: "Por confirmar", alerta: porConfirmar > 0 },
        ]}
      />

      <ul className="flex flex-col gap-2.5" aria-label="Citas de la demostración">
        {citas.map((c) => {
          const confirmada = c.estado === "confirmada";
          return (
            <li
              key={c.id}
              className={cn(
                "demo-destello rounded-2xl border border-line bg-surface-2 p-4",
                confirmada
                  ? "shadow-[inset_3px_0_0_var(--panel-acento)]"
                  : "shadow-[inset_3px_0_0_var(--color-warn)]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-mono text-[15px] leading-snug font-semibold text-ink [overflow-wrap:anywhere]">
                  {c.horario || "Horario por definir"}
                </p>
                <span key={c.estado} className="demo-pop flex-none">
                  <Pildora tono={confirmada ? "acento" : "warn"}>
                    {confirmada ? "Confirmada" : "Sin confirmar"}
                  </Pildora>
                </span>
              </div>
              <p className="mt-2 text-[14.5px] font-medium text-ink">Usted (prueba)</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-ink-mute">
                {c.servicio || "Servicio por definir"}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[11.5px] leading-snug text-ink-faint">
                <Icono nombre="calendario" className="h-3.5 w-3.5 flex-none" />
                Anotada a las {c.hora} · cita de demostración, no se guarda
              </p>
            </li>
          );
        })}
      </ul>

      <div className="rounded-xl border border-dashed border-line-strong px-4 py-3">
        <Rotulo>En su panel real</Rotulo>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-mute">
          Cada cita se puede reagendar, cancelar o marcar como cumplida, y el agente le avisa al cliente por
          WhatsApp.
        </p>
      </div>

      <div className="flex justify-center pb-1">
        <BotonPanel tono="neutro" onClick={() => onIrAlChat()}>
          Seguir en el chat
        </BotonPanel>
      </div>
    </div>
  );
}

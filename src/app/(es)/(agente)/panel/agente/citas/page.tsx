import Link from "next/link";
import { armarAgenda } from "@/components/panel/agenda/armar";
import { FilaCita } from "@/components/panel/agenda/fila-cita";
import { SemanaProxima } from "@/components/panel/agenda/semana";
import { BotonAgendarCita } from "@/components/panel/agente-cita-form";
import {
  AvisoDatosEjemplo,
  BOTON,
  BOTON_BASE,
  EncabezadoPantalla,
  EstadoVacio,
  PaginaPanel,
  ResumenCifras,
} from "@/components/panel/clientes/piezas";
import { enModoEjemplo, getCitas, getContactos, getConocimiento } from "@/lib/panel/agente";
import { cn } from "@/lib/utils";

/* ==========================================================================
   Agenda (antes "Citas") — Fase 4a del rediseño.

   Responde una pregunta: ¿qué tengo esta semana? Arriba, las cifras y la
   franja de los próximos 7 días; abajo, las citas agrupadas por día. Cada
   día con citas es una sección a la que salta la franja.

   Regla de Sebastian: todo lo que hace el bot se puede hacer también a mano.
   Por eso están "Agendar cita", "Reagendar", "Marcar cumplida" y "Cancelar".
   Los datos son los mismos de siempre (`getCitas`: de ayer en adelante).
   ========================================================================== */
export default async function AgendaPage() {
  const [citas, contactos, conocimiento, ejemplo] = await Promise.all([
    getCitas(),
    getContactos(),
    getConocimiento(),
    enModoEjemplo(),
  ]);

  const servicios = conocimiento
    .filter((c) => c.tipo === "servicio" && c.activo)
    .map((c) => ({ clave: c.clave, monto: c.monto, duracionMin: c.duracionMin }));
  const contactosOpciones = contactos.map((c) => ({ id: c.id, nombre: c.nombre, telefono: c.telefono }));

  const agenda = armarAgenda(citas);

  return (
    <PaginaPanel>
      <EncabezadoPantalla
        titulo="Agenda"
        descripcion="Las citas que agendó tu agente y las que sumás a mano. Si cambiás o cancelás una, el agente le avisa al paciente por WhatsApp."
      >
        {servicios.length > 0 ? (
          <BotonAgendarCita contactos={contactosOpciones} servicios={servicios} className="w-full sm:w-auto" />
        ) : (
          <Link
            href="/panel/agente/que-sabe"
            className={cn(BOTON_BASE, BOTON.secundario, "min-h-11 rounded-xl px-4 text-[13.5px] sm:min-h-10")}
          >
            Cargá tus servicios para agendar a mano
          </Link>
        )}
      </EncabezadoPantalla>

      <AvisoDatosEjemplo visible={ejemplo} />

      {citas.length === 0 ? (
        <EstadoVacio titulo="Todavía no hay citas">
          Las agenda el agente cuando alguien se las pide por WhatsApp. También podés agendar una a mano con el
          botón de arriba.
        </EstadoVacio>
      ) : (
        <>
          <ResumenCifras
            etiqueta="Resumen de la agenda"
            className="grid-cols-3"
            cifras={[
              { valor: String(agenda.citasHoy), etiqueta: "Citas hoy" },
              { valor: String(agenda.proximos7), etiqueta: "Próximos 7 días" },
              {
                valor: String(agenda.sinConfirmar),
                etiqueta: "Sin confirmar",
                alerta: agenda.sinConfirmar > 0,
              },
            ]}
          />

          <SemanaProxima dias={agenda.semana} />

          {agenda.dias.map((dia) => (
            <section
              key={dia.clave}
              id={`dia-${dia.clave}`}
              aria-labelledby={`titulo-${dia.clave}`}
              className="scroll-mt-4"
            >
              <div className="mb-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <h2 id={`titulo-${dia.clave}`} className="text-[16px] font-semibold tracking-tight text-ink">
                  {dia.titulo}
                </h2>
                <span className="text-[12.5px] text-ink-faint">{dia.detalle}</span>
                <span className="ml-auto font-mono text-[11px] text-ink-faint tabular-nums">
                  {dia.citas.length} {dia.citas.length === 1 ? "cita" : "citas"}
                </span>
              </div>

              <ul className="flex flex-col gap-3 md:grid md:grid-cols-2 xl:flex xl:flex-col xl:gap-0 xl:overflow-hidden xl:rounded-2xl xl:border xl:border-line xl:bg-surface-2">
                {dia.citas.map((cita, i) => (
                  <FilaCita key={cita.id} cita={cita} indice={i} />
                ))}
              </ul>
            </section>
          ))}

          <p className="text-[11.5px] leading-snug text-ink-faint">
            Acá aparecen las citas de ayer en adelante.
          </p>
        </>
      )}
    </PaginaPanel>
  );
}

import Link from "next/link";
import { Cabecera, Cuerpo, Bloque, AvisoEjemplo, Vacio } from "@/components/panel/agente-ui";
import { colones } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import {
  enModoEjemplo,
  getCitas,
  getConversaciones,
  getCorrecciones,
  getResumenAgente,
  fechaCorta,
  relativa,
} from "@/lib/panel/agente";
import { getCliente } from "@/lib/panel/datos";

function saludo() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

/** Primer nombre: "Andrea Ramírez" → "Andrea". */
function primerNombre(nombre: string) {
  return nombre.trim().split(/\s+/)[0] ?? "";
}

export default async function ResumenAgentePage() {
  const [resumen, conversaciones, citas, correcciones, cliente, ejemplo] = await Promise.all([
    getResumenAgente(),
    getConversaciones(),
    getCitas(),
    getCorrecciones(),
    getCliente(),
    enModoEjemplo(),
  ]);

  const esperando = conversaciones.filter((c) => c.estado === "espera");
  const pct =
    resumen.conversacionesHoy > 0
      ? Math.round((resumen.resueltasSinVos / resumen.conversacionesHoy) * 100)
      : 0;
  const pico = Math.max(1, ...resumen.porHora.map((p) => p.cantidad));
  const proximas = citas.slice(0, 3);

  const nombre = primerNombre(cliente.personaContacto || cliente.nombreNegocio);

  return (
    <>
      <Cabecera
        eyebrow={`Resumen · ${new Date().toLocaleDateString("es-CR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}`}
        titulo={nombre ? `${saludo()}, ${nombre}.` : `${saludo()}.`}
        descripcion={
          resumen.conversacionesHoy === 0
            ? "Todavía no han entrado conversaciones hoy. En cuanto alguien escriba al número, aparece acá."
            : `Hoy entraron ${resumen.conversacionesHoy} conversaciones. El agente resolvió ${resumen.resueltasSinVos} sin necesitarte${
                resumen.citasHoy > 0 ? ` y agendó ${resumen.citasHoy} citas` : ""
              }.`
        }
      />

      <AvisoEjemplo visible={ejemplo} />

      <Cuerpo className="flex flex-col gap-6">
        {esperando.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-warn/30 bg-warn/[0.07] px-4 py-3">
            <Icono nombre="pendientes" className="h-4 w-4 flex-none text-warn" />
            <p className="min-w-0 flex-1 text-[13px] text-ink-soft">
              <span className="font-medium text-ink">{esperando[0].nombre}</span> está
              esperando a una persona desde {relativa(esperando[0].ultimoEn)}
              {esperando[0].motivoEspera ? ` — ${esperando[0].motivoEspera.toLowerCase()}` : ""}.
              {esperando.length > 1 ? ` Y ${esperando.length - 1} más.` : ""}
            </p>
            <Link
              href={`/panel/agente/conversaciones?c=${esperando[0].id}`}
              className="rounded-lg bg-ink px-3 py-1.5 text-[13px] font-medium whitespace-nowrap text-paper transition-colors hover:bg-ink-soft"
            >
              Atenderla
            </Link>
          </div>
        ) : null}

        <div className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Conversaciones hoy" dato={String(resumen.conversacionesHoy)} />
          <Tile
            label="Resueltas sin vos"
            dato={`${pct}%`}
            nota={`${resumen.resueltasSinVos} de ${resumen.conversacionesHoy}`}
          />
          <Tile label="Citas agendadas" dato={String(resumen.citasHoy)} nota="hoy" />
          <Tile
            label="Esperando a una persona"
            dato={String(resumen.esperando)}
            nota={resumen.esperando === 0 ? "todo al día" : "sin atender"}
          />
        </div>

        <Bloque
          titulo="Conversaciones por hora"
          sub="Hoy, de 7 a.m. a 6 p.m."
          accion={
            <span className="font-mono text-[11px] text-ink-faint tabular-nums">
              {resumen.conversacionesHoy} en total
            </span>
          }
        >
          <div className="flex h-[112px] items-end gap-1.5 px-4 pt-5 pb-2">
            {resumen.porHora.map((p) => (
              <div key={p.hora} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full max-w-[26px] rounded-t-[3px] border border-b-0 border-line-strong bg-surface-3"
                  style={{ height: `${Math.max(3, (p.cantidad / pico) * 100)}%` }}
                  title={`${p.cantidad} conversaciones`}
                />
                <span className="font-mono text-[9px] text-ink-faint">
                  {p.hora === 12 ? "12m" : p.hora > 12 ? `${p.hora - 12}p` : `${p.hora}a`}
                </span>
              </div>
            ))}
          </div>
        </Bloque>

        <div className="grid gap-4 lg:grid-cols-2">
          <Bloque
            titulo="Lo que no supo responder"
            sub="Contestá una vez y no lo vuelve a preguntar"
            accion={
              correcciones.length > 0 ? (
                <Link
                  href="/panel/agente/correcciones"
                  className="text-xs text-ink-mute underline underline-offset-[3px] hover:text-ink"
                >
                  Ver {correcciones.length}
                </Link>
              ) : null
            }
          >
            {correcciones.length === 0 ? (
              <Vacio>El agente respondió todo lo que le preguntaron.</Vacio>
            ) : (
              <ul className="py-1">
                {correcciones.slice(0, 3).map((c) => (
                  <li key={c.id} className="border-line px-4 py-3 [&+li]:border-t">
                    <p className="text-[13px] text-ink-soft">{c.pregunta}</p>
                    <p className="mt-1 font-mono text-[11px] text-ink-faint">
                      {c.deQuien ? `${c.deQuien} · ` : ""}
                      {relativa(c.creadaEn)}
                      {c.veces > 1 ? ` · preguntado ${c.veces} veces` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Bloque>

          <Bloque
            titulo="Próximas citas"
            sub="Agendadas por el agente"
            accion={
              proximas.length > 0 ? (
                <Link
                  href="/panel/agente/citas"
                  className="text-xs text-ink-mute underline underline-offset-[3px] hover:text-ink"
                >
                  Ver agenda
                </Link>
              ) : null
            }
          >
            {proximas.length === 0 ? (
              <Vacio>Todavía no hay citas agendadas.</Vacio>
            ) : (
              <ul className="py-1">
                {proximas.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-start gap-3 border-line px-4 py-3 [&+li]:border-t"
                  >
                    <span className="pt-px font-mono text-xs whitespace-nowrap text-ink">
                      {fechaCorta(c.cuando)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] text-ink-soft">{c.nombre}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
                        {c.servicio}
                        {c.monto ? ` · ${colones(c.monto)}` : " · gratis"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Bloque>
        </div>
      </Cuerpo>
    </>
  );
}

function Tile({ label, dato, nota }: { label: string; dato: string; nota?: string }) {
  return (
    <div className="bg-surface px-4 py-4">
      <p className="font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">{label}</p>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-[27px] leading-none font-medium tracking-[-0.02em] text-ink tabular-nums">
          {dato}
        </span>
        {nota ? <span className="font-mono text-[11px] text-ink-faint">{nota}</span> : null}
      </div>
    </div>
  );
}

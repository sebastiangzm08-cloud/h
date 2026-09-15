import { Cabecera, Cuerpo, Bloque, AvisoEjemplo, Vacio, Tag, EstadoPill } from "@/components/panel/agente-ui";
import {
  FormaRecordatorio,
  BotonCancelarRecordatorio,
} from "@/components/panel/agente-recordatorio-form";
import { FormaAgendarCitaContacto } from "@/components/panel/agente-cita-form";
import { enModoEjemplo, getContactos, getCitas, getConocimiento, getRecordatorios, relativa, fechaCorta } from "@/lib/panel/agente";

const ESTADOS: Record<string, { texto: string; tono: "agendado" | "cliente" | "perdido" | "neutro" }> = {
  nuevo: { texto: "Contacto nuevo", tono: "neutro" },
  pregunto_precio: { texto: "Preguntó precio", tono: "neutro" },
  agendado: { texto: "Cita agendada", tono: "agendado" },
  cliente: { texto: "Cliente", tono: "cliente" },
  perdido: { texto: "No volvió", tono: "perdido" },
};

export default async function ContactosPage() {
  const [contactos, citas, recordatorios, conocimiento, ejemplo] = await Promise.all([
    getContactos(),
    getCitas(),
    getRecordatorios(),
    getConocimiento(),
    enModoEjemplo(),
  ]);

  const servicios = conocimiento
    .filter((c) => c.tipo === "servicio" && c.activo)
    .map((c) => ({ clave: c.clave, monto: c.monto, duracionMin: c.duracionMin }));

  /* La próxima cita de cada quien sale de `citas`, no de una columna en
     `contactos`: si se guardara en los dos lados, algún día no coincidirían. */
  const proxima = new Map<string, string>();
  for (const c of [...citas].reverse()) {
    if (c.estado === "cancelada") continue;
    proxima.set(c.nombre, c.cuando);
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Cabecera + recordatorios: fijos. Nunca crecen sin límite porque no
          hay decenas de recordatorios pendientes a la vez en la práctica —
          lo que sí crece sin límite es la lista de contactos de abajo, y esa
          es la que necesita su propio scroll para no alargar la página. */}
      <div className="scroll-fino flex-none overflow-y-auto">
        <Cabecera
          eyebrow="Operación"
          titulo="Contactos"
          descripcion="Todo el que le ha escrito al negocio, con lo que el agente aprendió de cada conversación. No hay que llenar nada a mano."
        />
        <AvisoEjemplo visible={ejemplo} />

        <Cuerpo className="pb-0">
          <Bloque
            titulo="Próximos recordatorios"
            sub={
              recordatorios.length === 0
                ? "Nada programado"
                : `${recordatorios.length} pendiente${recordatorios.length === 1 ? "" : "s"}`
            }
          >
            {recordatorios.length === 0 ? (
              <Vacio>
                Acá aparecen los que se agendan solos al reservar una cita, y los que programés a mano abajo.
              </Vacio>
            ) : (
              recordatorios.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 border-line px-4 py-2.5 [&+&]:border-t"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-ink-soft">
                      <span className="font-medium text-ink">{r.nombre}</span> · {r.mensaje}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
                      {fechaCorta(r.cuando)}
                      {r.origen === "cita" ? " · de una cita" : ""}
                      {r.repetirCadaHoras ? ` · se repite cada ${r.repetirCadaHoras}h` : ""}
                    </p>
                  </div>
                  <BotonCancelarRecordatorio id={r.id} />
                </div>
              ))
            )}
          </Bloque>
        </Cuerpo>
      </div>

      {/* La tabla: el único que hace scroll. `min-h-0` es lo que le permite
          encogerse dentro del `flex-1` en vez de estirar todo lo de arriba —
          mismo truco que usan Conversaciones y Correo. */}
      <div className="scroll-fino min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6 md:px-8">
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          {contactos.length === 0 ? (
            <Vacio>Todavía nadie le ha escrito al número. El primer contacto se crea solo.</Vacio>
          ) : (
            <div className="scroll-fino overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    {["Contacto", "Teléfono", "Estado", "Última conversación", "Próxima cita", "Etiquetas", ""].map(
                      (h) => (
                        <th
                          key={h}
                          className="sombra-pegada sticky top-0 z-10 border-b border-line bg-surface-2 px-4 py-2.5 text-left font-mono text-[10px] font-normal tracking-[0.1em] whitespace-nowrap text-ink-faint uppercase"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {contactos.map((c, i) => {
                    const e = ESTADOS[c.estado] ?? ESTADOS.nuevo;
                    const cita = proxima.get(c.nombre);
                    return (
                      <tr
                        key={c.id}
                        className="fila-entra border-b border-line transition-colors last:border-b-0 hover:bg-surface-2"
                        style={{ animationDelay: `${Math.min(i, 14) * 20}ms` }}
                      >
                        <td className="px-4 py-3 font-medium text-ink">{c.nombre || "Sin nombre"}</td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-mute tabular-nums">
                          {c.telefono}
                        </td>
                        <td className="px-4 py-3">
                          <EstadoPill tono={e.tono}>{e.texto}</EstadoPill>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-mute">
                          {relativa(c.creadoEn)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-mute">
                          {cita
                            ? new Date(cita).toLocaleDateString("es-CR", {
                                weekday: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {c.etiquetas.slice(0, 2).map((t) => (
                              <Tag key={t}>{t}</Tag>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {servicios.length > 0 ? (
                              <FormaAgendarCitaContacto
                                contactoId={c.id}
                                nombre={c.nombre || c.telefono}
                                servicios={servicios}
                              />
                            ) : null}
                            <FormaRecordatorio contactoId={c.id} nombre={c.nombre || c.telefono} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

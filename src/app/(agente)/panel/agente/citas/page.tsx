import { Cabecera, Cuerpo, AvisoEjemplo, Vacio, EstadoPill } from "@/components/panel/agente-ui";
import { AccionesCita } from "@/components/panel/agente-cita-acciones";
import { BotonAgendarCita } from "@/components/panel/agente-cita-form";
import { colones } from "@/components/panel/ui";
import { enModoEjemplo, getCitas, getContactos, getConocimiento, fechaCorta } from "@/lib/panel/agente";

const ESTADOS = {
  confirmada: { texto: "Confirmada", tono: "agendado" as const },
  sin_confirmar: { texto: "Sin confirmar", tono: "neutro" as const },
  cancelada: { texto: "Cancelada", tono: "perdido" as const },
  cumplida: { texto: "Cumplida", tono: "cliente" as const },
};

export default async function CitasPage() {
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

  return (
    <>
      <Cabecera
        eyebrow="Operación"
        titulo="Citas"
        descripcion="Lo que el agente agendó por su cuenta. Cuando cambiés o cancelés una, él le avisa al paciente por WhatsApp."
      />
      <AvisoEjemplo visible={ejemplo} />

      <Cuerpo>
        {servicios.length > 0 ? (
          <BotonAgendarCita contactos={contactosOpciones} servicios={servicios} />
        ) : null}
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          {citas.length === 0 ? (
            <Vacio>Todavía no hay citas. Las agenda el agente cuando alguien le pide una.</Vacio>
          ) : (
            <div className="scroll-fino overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-[13px]">
                <thead>
                  <tr>
                    {["Cuándo", "Paciente", "Servicio", "Monto", "Estado", "Recordatorio", ""].map((h) => (
                      <th
                        key={h}
                        className="border-b border-line bg-surface-2 px-4 py-2.5 text-left font-mono text-[10px] font-normal tracking-[0.1em] whitespace-nowrap text-ink-faint uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {citas.map((c) => {
                    const e = ESTADOS[c.estado] ?? ESTADOS.sin_confirmar;
                    return (
                      <tr key={c.id} className="border-b border-line last:border-b-0 hover:bg-surface-2">
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-ink tabular-nums">
                          {fechaCorta(c.cuando)}
                        </td>
                        <td className="px-4 py-3 font-medium text-ink">{c.nombre}</td>
                        <td className="px-4 py-3 text-ink-mute">{c.servicio || "—"}</td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-mute tabular-nums">
                          {c.monto ? colones(c.monto) : "Gratis"}
                        </td>
                        <td className="px-4 py-3">
                          <EstadoPill tono={e.tono}>{e.texto}</EstadoPill>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-ink-faint">
                          {c.recordatorioEn ? fechaCorta(c.recordatorioEn) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <AccionesCita citaId={c.id} estado={c.estado} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Cuerpo>
    </>
  );
}

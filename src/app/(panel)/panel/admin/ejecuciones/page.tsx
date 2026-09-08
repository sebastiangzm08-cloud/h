/* ==========================================================================
   Ejecuciones. El log técnico de n8n: qué corrió, cuánto tardó y el error
   si falló. Solo para vos — el cliente ve «Actividad», que es lo mismo pero
   en lenguaje de negocio.

   Lee la tabla `ejecuciones` de verdad (`getEjecucionesAdmin`). Está vacía
   hasta que el Publicador escriba su primera fila; ahí muestra el estado
   vacío.
   ========================================================================== */
import { Caja, Eyebrow, PageHead, Pill } from "@/components/panel/ui";
import { getEjecucionesAdmin } from "@/lib/panel/admin";

function ms(n: number | null) {
  if (n == null) return "—";
  return n < 1000 ? `${n} ms` : `${(n / 1000).toFixed(1)} s`;
}

export default async function EjecucionesAdmin() {
  const ejecuciones = await getEjecucionesAdmin();
  const errores = ejecuciones.filter((e) => e.estado === "error").length;

  return (
    <>
      <PageHead
        titulo="Ejecuciones"
        sub={`${ejecuciones.length} recientes`}
        descripcion={
          errores > 0
            ? `${errores} con error — revisá el log.`
            : "Todo corriendo sin errores."
        }
      />

      <div className="flex flex-col gap-2.5">
        {ejecuciones.map((e) => (
          <Caja key={e.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <Pill tono={e.estado === "error" ? "bad" : "ok"}>
                {e.estado === "error" ? "Error" : "OK"}
              </Pill>
              <span className="font-mono text-[12.5px] text-ink-soft">{e.accion}</span>
              <span className="text-[11.5px] text-ink-faint">{e.cliente}</span>
              <span className="ml-auto flex items-center gap-4 font-mono text-[10.5px] text-ink-faint">
                <span>{ms(e.duracionMs)}</span>
                <span>{e.cuando}</span>
              </span>
            </div>
            {e.log ? (
              <div>
                <Eyebrow>Log</Eyebrow>
                <pre className="mt-1 overflow-x-auto rounded-lg bg-surface-3 p-3 font-mono text-[11.5px] leading-relaxed text-bad">
                  {e.log}
                </pre>
              </div>
            ) : null}
          </Caja>
        ))}
      </div>
    </>
  );
}

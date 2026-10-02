/* ==========================================================================
   Ejecuciones. El log técnico de n8n: qué corrió, cuánto tardó y el error
   si falló. Solo para vos — el cliente ve «Actividad», que es lo mismo pero
   en lenguaje de negocio.

   Lee la tabla `ejecuciones` de verdad (`getEjecucionesAdmin`, las últimas
   40). Está vacía hasta que el Publicador escriba su primera fila; ahí
   muestra el estado vacío. El filtro «Con error» es un enlace (?f=error): la
   pantalla se arma en el servidor.
   ========================================================================== */
import Link from "next/link";
import { Caja, Pill } from "@/components/panel/ui";
import {
  AdminHead,
  Cifras,
  TarjetaCifra,
  Vacio,
  claseChip,
  fechaHora,
} from "@/components/admin/admin-ui";
import { getEjecucionesAdmin } from "@/lib/panel/admin";
import { relativa } from "@/lib/panel/agente-formato";
import { cn } from "@/lib/utils";

function ms(n: number | null) {
  if (n == null) return "—";
  return n < 1000 ? `${n} ms` : `${(n / 1000).toFixed(1)} s`;
}

export default async function EjecucionesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const { f } = await searchParams;
  const soloErrores = f === "error";

  const ejecuciones = await getEjecucionesAdmin();
  const errores = ejecuciones.filter((e) => e.estado === "error");
  const correctas = ejecuciones.length - errores.length;
  const visibles = soloErrores ? errores : ejecuciones;

  /* Duración promedio, solo de las que la registraron. */
  const conDuracion = ejecuciones.filter((e) => e.duracionMs != null);
  const promedio =
    conDuracion.length > 0
      ? Math.round(conDuracion.reduce((s, e) => s + (e.duracionMs ?? 0), 0) / conDuracion.length)
      : null;

  return (
    <>
      <AdminHead
        titulo="Ejecuciones"
        sub={`${ejecuciones.length} recientes`}
        descripcion={
          ejecuciones.length === 0
            ? "El registro técnico de lo que corre en n8n."
            : errores.length > 0
              ? `${errores.length} con error entre las últimas ${ejecuciones.length}: revisá el log.`
              : "Todo corriendo sin errores."
        }
      />

      {ejecuciones.length === 0 ? (
        <Vacio icono="ejecuciones" titulo="Todavía no hay ejecuciones registradas">
          Cuando n8n corra su primera tarea y la registre, la ves acá con su duración y, si falla, el log del
          error.
        </Vacio>
      ) : (
        <>
          <Cifras columnas={4} etiqueta="Resumen de ejecuciones">
            <TarjetaCifra icono="ejecuciones" etiqueta="Recientes" valor={ejecuciones.length} pie="Las últimas 40 como máximo" />
            <TarjetaCifra icono="actividad" etiqueta="Correctas" valor={correctas} pie="Terminaron bien" tono={correctas > 0 ? "ok" : "normal"} />
            <TarjetaCifra
              icono="pendientes"
              etiqueta="Con error"
              valor={errores.length}
              pie={errores.length > 0 ? "Revisá el log" : "Ninguna falló"}
              tono={errores.length > 0 ? "bad" : "normal"}
            />
            <TarjetaCifra
              icono="reporte"
              etiqueta="Duración promedio"
              valor={promedio == null ? "—" : ms(promedio)}
              pie={promedio == null ? "Ninguna registró duración" : `De ${conDuracion.length} con duración`}
            />
          </Cifras>

          <nav aria-label="Filtrar ejecuciones" className="flex flex-wrap gap-2">
            <Link href="/panel/admin/ejecuciones" prefetch={false} aria-current={!soloErrores ? "true" : undefined} className={claseChip(!soloErrores)}>
              Todas
              <span className="font-mono text-[10.5px] opacity-70 tabular-nums">{ejecuciones.length}</span>
            </Link>
            <Link href="/panel/admin/ejecuciones?f=error" prefetch={false} aria-current={soloErrores ? "true" : undefined} className={claseChip(soloErrores)}>
              Con error
              <span className="font-mono text-[10.5px] opacity-70 tabular-nums">{errores.length}</span>
            </Link>
          </nav>

          {visibles.length === 0 ? (
            <Vacio icono="ejecuciones" titulo="Ninguna con error">
              Entre las últimas {ejecuciones.length} ejecuciones no hay fallos. Todo salió bien.
            </Vacio>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {visibles.map((e) => (
                <li key={e.id}>
                  <Caja className="flex flex-col gap-3 p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
                      <div className="col-start-2 row-start-1 justify-self-end sm:col-start-1 sm:justify-self-start">
                        <Pill tono={e.estado === "error" ? "bad" : "ok"}>{e.estado === "error" ? "Error" : "OK"}</Pill>
                      </div>
                      <div className="col-start-1 row-start-1 min-w-0 sm:col-start-2">
                        <p className="truncate font-mono text-[12.5px] text-ink">{e.accion}</p>
                        <p className="truncate text-[11.5px] text-ink-faint">{e.cliente}</p>
                      </div>
                      <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-0.5 font-mono text-[11px] text-ink-faint sm:contents">
                        <p className="sm:text-right">
                          <span className="sm:hidden">Duró </span>
                          {ms(e.duracionMs)}
                        </p>
                        <time
                          dateTime={e.cuandoIso}
                          title={relativa(e.cuandoIso)}
                          className="whitespace-nowrap sm:text-right"
                        >
                          {fechaHora(e.cuandoIso)}
                        </time>
                      </div>
                    </div>
                    {e.log ? (
                      <details className="group" open={e.estado === "error"}>
                        <summary
                          className={cn(
                            "flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-[12px] select-none",
                            e.estado === "error" ? "text-bad" : "text-ink-mute"
                          )}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="h-3 w-3 transition-transform group-open:rotate-90"
                          >
                            <path d="m9 6 6 6-6 6" />
                          </svg>
                          Ver el log
                        </summary>
                        <pre
                          className={cn(
                            "scroll-fino mt-1 max-h-72 overflow-auto rounded-lg bg-surface-3 p-3 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]",
                            e.estado === "error" ? "text-bad" : "text-ink-soft"
                          )}
                        >
                          {e.log}
                        </pre>
                      </details>
                    ) : null}
                  </Caja>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

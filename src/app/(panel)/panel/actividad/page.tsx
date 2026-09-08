/* ==========================================================================
   Actividad: la bitácora de todo lo que hizo el sistema, de todas las
   automatizaciones juntas. En el Inicio van los últimos movimientos; acá
   está el registro completo.
   ========================================================================== */
import { Caja, Eyebrow, PageHead, Pill } from "@/components/panel/ui";
import { getActividad } from "@/lib/panel/datos";
import type { ResultadoActividad } from "@/lib/panel/tipos";

const TONO: Record<ResultadoActividad, "ok" | "warn" | "bad" | "idle"> = {
  ok: "ok",
  atencion: "warn",
  aviso: "warn",
  error: "bad",
};

const ETIQUETA: Record<ResultadoActividad, string> = {
  ok: "Hecho",
  atencion: "Atención",
  aviso: "Aviso",
  error: "Error",
};

export default async function ActividadPage() {
  const filas = await getActividad(100);

  return (
    <>
      <PageHead
        titulo="Actividad"
        sub={`${filas.length} movimientos`}
        descripcion="Todo lo que el sistema hizo por vos, de todas tus automatizaciones."
      />

      {filas.length === 0 ? (
        <Caja className="text-center">
          <p className="py-6 text-[13px] text-ink-faint">
            Todavía no hay movimientos.
          </p>
        </Caja>
      ) : (
        <Caja>
          <div className="mb-3">
            <Eyebrow>Registro</Eyebrow>
          </div>
          <ul className="flex flex-col">
            {filas.map((a, i) => (
              <li
                key={a.id}
                className={
                  i === filas.length - 1
                    ? "flex items-start gap-3 py-3"
                    : "flex items-start gap-3 border-b border-line py-3"
                }
              >
                <time className="w-[92px] flex-none pt-0.5 font-mono text-[10.5px] text-ink-faint">
                  {a.cuando}
                </time>
                <span
                  className="mt-1.5 h-[7px] w-[7px] flex-none rounded-full bg-ink-soft ring-[3px] ring-white/6"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] text-ink-soft">
                    <span className="font-medium">{a.automatizacion}</span> —{" "}
                    {a.descripcion}
                  </p>
                </div>
                {a.resultado !== "ok" ? (
                  <Pill tono={TONO[a.resultado]}>{ETIQUETA[a.resultado]}</Pill>
                ) : null}
              </li>
            ))}
          </ul>
        </Caja>
      )}
    </>
  );
}

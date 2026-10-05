/* ==========================================================================
   Actividad: la bitácora de todo lo que hizo el sistema, de todas las
   automatizaciones juntas. En el Inicio van los últimos movimientos; acá
   está el registro completo.
   ========================================================================== */
import { EstadoVacio, Seccion } from "@/components/panel/configuracion/seccion";
import { PageHead, Pill } from "@/components/panel/ui";
import { getActividad } from "@/lib/panel/datos";
import type { ResultadoActividad } from "@/lib/panel/tipos";
import { cn } from "@/lib/utils";

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

/** El punto de la línea: gris si salió bien, del color del problema si no. */
const PUNTO: Record<ResultadoActividad, string> = {
  ok: "bg-ink-faint",
  atencion: "bg-warn",
  aviso: "bg-warn",
  error: "bg-bad",
};

export default async function ActividadPage() {
  const filas = await getActividad(100);

  return (
    <>
      <PageHead
        titulo="Actividad"
        sub={filas.length >= 100 ? "Últimos 100 movimientos" : `${filas.length} movimientos`}
        descripcion="Todo lo que el sistema hizo por vos, de todas tus automatizaciones."
      />

      {filas.length === 0 ? (
        <EstadoVacio icono="actividad" titulo="Todavía no hay movimientos">
          Cuando tus automatizaciones empiecen a trabajar, cada cosa que hagan queda anotada acá.
        </EstadoVacio>
      ) : (
        <Seccion
          id="registro"
          eyebrow="Registro"
          titulo="Lo último que pasó"
          descripcion={filas.length >= 100 ? "Los 100 más recientes, del más nuevo al más viejo." : "Del más nuevo al más viejo."}
          sinRelleno
        >
          <ol className="divide-y divide-line border-t border-line">
            {filas.map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-3 px-4 py-3 sm:gap-4 sm:px-[18px]"
              >
                <span
                  aria-hidden="true"
                  className={cn("mt-[7px] h-[7px] w-[7px] flex-none rounded-full ring-[3px] ring-ink/10", PUNTO[a.resultado])}
                />
                {/* Celular: la hora arriba y el texto debajo. En pantalla ancha,
                    hora a la izquierda en su columna. */}
                <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-4">
                  <time className="block flex-none font-mono text-[10.5px] text-ink-mute sm:w-[110px]">{a.cuando}</time>
                  <p className="mt-0.5 min-w-0 text-[12.5px] leading-snug break-words text-ink-soft sm:mt-0 sm:flex-1">
                    <span className="font-medium text-ink">{a.automatizacion}</span> — {a.descripcion}
                  </p>
                </div>
                {a.resultado !== "ok" ? (
                  <span className="flex-none pt-px">
                    <Pill tono={TONO[a.resultado]}>{ETIQUETA[a.resultado]}</Pill>
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </Seccion>
      )}
    </>
  );
}

/* ==========================================================================
   Las cuatro cifras de arriba de "Resultados". Cada una es un enlace a su
   sección (ancla en la misma página) — en celular ahorra mucho scroll.
   ========================================================================== */
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { colones } from "@/components/panel/ui";
import type { Embudo, Oportunidades, Ventas } from "@/lib/panel/resultados-calculo";
import { entero } from "./comunes";

/** ₡1,24 M: en celular una cifra de millones en 24 px no cabe en media pantalla. */
function colonesCompactos(n: number) {
  return `₡${(n / 1_000_000).toLocaleString("es-CR", { maximumFractionDigits: 2 })} M`;
}

function Tarjeta({
  href,
  icono,
  etiqueta,
  valor,
  valorCelular,
  pie,
}: {
  href: string;
  icono: NombreIcono;
  etiqueta: string;
  valor: string;
  /** Versión corta solo para pantallas angostas. */
  valorCelular?: string;
  pie: string;
}) {
  return (
    <a
      href={href}
      className="group flex min-w-0 flex-col gap-2.5 rounded-2xl border border-line bg-surface-2 p-3.5 transition-colors duration-150 hover:border-line-strong hover:bg-surface-3/60 active:scale-[0.99] sm:gap-3 sm:p-4"
    >
      <span className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 flex-none place-items-center rounded-xl bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)] sm:h-9 sm:w-9">
          <Icono nombre={icono} className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 text-[12.5px] leading-tight text-ink-mute">{etiqueta}</span>
      </span>
      <span className="text-[24px] leading-none font-semibold tracking-[-0.03em] break-words text-ink tabular-nums sm:text-[26px]">
        {valorCelular ? (
          <>
            <span className="sm:hidden" aria-label={valor}>
              {valorCelular}
            </span>
            <span className="hidden sm:inline">{valor}</span>
          </>
        ) : (
          valor
        )}
      </span>
      <span className="text-[11.5px] leading-snug text-ink-mute">{pie}</span>
    </a>
  );
}

export function ResumenResultados({
  embudo,
  ventas,
  oportunidades,
  rango,
}: {
  embudo: Embudo | null;
  ventas: Ventas | null;
  oportunidades: Oportunidades | null;
  rango: 7 | 30;
}) {
  return (
    <nav aria-label="Resumen de resultados" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Tarjeta
        href="#embudo"
        icono="reporte"
        etiqueta={`Escribieron · ${rango} días`}
        valor={embudo ? entero(embudo.escribio) : "—"}
        pie={
          embudo
            ? `${entero(embudo.agendo)} ${embudo.agendo === 1 ? "agendó" : "agendaron"} cita`
            : "No se pudo leer"
        }
      />
      <Tarjeta
        href="#ventas"
        icono="costos"
        etiqueta={ventas ? `Ventas de ${ventas.mes}` : "Ventas del mes"}
        valor={ventas ? colones(ventas.total) : "—"}
        valorCelular={ventas && ventas.total >= 1_000_000 ? colonesCompactos(ventas.total) : undefined}
        pie={
          ventas
            ? `${entero(ventas.cumplidas)} ${ventas.cumplidas === 1 ? "cita cumplida" : "citas cumplidas"}`
            : "No se pudo leer"
        }
      />
      <Tarjeta
        href="#oportunidades"
        icono="pendientes"
        etiqueta="Oportunidades"
        valor={oportunidades ? entero(oportunidades.total) : "—"}
        pie={oportunidades ? "Preguntaron el precio, sin cita" : "No se pudo leer"}
      />
      <Tarjeta
        href="#recuperacion"
        icono="mensajes"
        etiqueta="Para recuperar"
        valor={oportunidades ? entero(oportunidades.recuperables) : "—"}
        pie={oportunidades ? "Más de 24 h sin respuesta" : "No se pudo leer"}
      />
    </nav>
  );
}

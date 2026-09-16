"use client";

/* ==========================================================================
   Onboarding del Agente de WhatsApp — lo llena el CLIENTE, no el admin.

   7 preguntas cortas (acordadas con Sebastián para no agobiar a una clínica
   o veterinaria) en 3 pantallas, con UN solo guardado al final
   (`guardarOnboardingAgente`). Mismo patrón visual que "Alta guiada", pero
   acá los 3 pasos viven en el MISMO <form>: los pasos que no se están
   viendo se ocultan con una clase (`hidden`, es decir `display:none`), no
   se desmontan — así el navegador igual manda sus valores al enviar el
   último paso, sin tener que levantar el estado de cada campo a mano.

   La marca de "ya lo completó" vive en `asignaciones.config.onboardingCompleto`
   (ver `agente-config.ts`), separada a propósito de `clientes.onboarding_completo`
   (el de Redes) — un cliente con las dos automatizaciones no tacha una al
   terminar la otra.
   ========================================================================== */
import { useEffect, useState } from "react";
import Link from "next/link";
import { CampoToken } from "@/components/panel/campo-token";
import { CampoMonto } from "@/components/panel/campo-monto";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { DIAS_HORARIO } from "@/lib/panel/agente-config";
import { cn } from "@/lib/utils";

type Paso = 1 | 2 | 3 | "listo";

const campo =
  "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-ink " +
  "placeholder:text-ink-faint transition-colors focus:border-line-strong " +
  "focus:bg-surface-3 focus:outline-none";
const campoChico =
  "h-9 rounded-lg border border-line bg-surface-2 px-2.5 text-[12.5px] text-ink " +
  "transition-colors focus:border-line-strong focus:bg-surface-3 focus:outline-none";
const boton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[13.5px] font-medium text-paper " +
  "transition-all duration-200 ease-out hover:bg-ink-soft active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50";
const botonSecundario =
  "inline-flex h-11 items-center justify-center rounded-full border border-line-strong px-5 text-[13px] text-ink-soft " +
  "transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-50";

const PASOS = [
  { n: 1, texto: "Tu negocio" },
  { n: 2, texto: "Servicios" },
  { n: 3, texto: "Horario y contacto" },
] as const;

function Progreso({ paso }: { paso: Paso }) {
  if (paso === "listo") return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2.5">
      {PASOS.map((p, i) => (
        <div key={p.n} className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-7 w-7 flex-none items-center justify-center rounded-full text-[12px] font-medium",
              p.n < paso ? "bg-ok text-paper" : p.n === paso ? "bg-ink text-paper" : "bg-surface-3 text-ink-faint"
            )}
          >
            {p.n < paso ? "✓" : p.n}
          </div>
          <span className={cn("text-[12px]", p.n === paso ? "font-medium text-ink" : "text-ink-faint")}>
            {p.texto}
          </span>
          {i < PASOS.length - 1 ? <div className="h-px w-8 bg-line-strong" /> : null}
        </div>
      ))}
    </div>
  );
}

export function AgenteOnboardingWizard({
  horarioActual,
}: {
  horarioActual: Record<string, [string, string][]>;
}) {
  const [paso, setPaso] = useState<Paso>(1);
  const [descripcion, setDescripcion] = useState("");
  const [filas, setFilas] = useState<number[]>([0, 1, 2]);
  const [estado, ejecutar, pendiente] = useAccionAgente("guardarOnboardingAgente");

  function agregarFila() {
    setFilas((f) => (f.length >= 5 ? f : [...f, (f[f.length - 1] ?? -1) + 1]));
  }
  function quitarFila(id: number) {
    setFilas((f) => (f.length <= 1 ? f : f.filter((x) => x !== id)));
  }

  function enviar(form: FormData) {
    ejecutar(form);
  }

  useEffect(() => {
    if (!estado?.ok) return;
    setPaso("listo");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  if (paso === "listo") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2.5 text-ok">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-ok text-paper text-[12px]">
            ✓
          </div>
          <span className="text-[14px] font-medium">Listo. El agente ya tiene lo esencial.</span>
        </div>
        <p className="max-w-[52ch] text-[13px] text-ink-mute">
          Podés seguir afinando todo esto cuando quieras: los servicios y precios se editan desde{" "}
          <Link href="/panel/agente/que-sabe" className="text-ink underline underline-offset-2">
            Qué sabe
          </Link>
          , y el tono, el horario y la agenda desde{" "}
          <Link href="/panel/agente/como-responde" className="text-ink underline underline-offset-2">
            Cómo responde
          </Link>
          .
        </p>
        <Link href="/panel/agente" className={cn(boton, "self-start")}>
          Ir al Resumen
        </Link>
      </div>
    );
  }

  return (
    <form action={enviar} className="flex flex-col gap-6">
      <CampoToken />
      <Progreso paso={paso} />

      {/* ------------------------------------------------------------ Paso 1 */}
      <fieldset className={cn("flex flex-col gap-5", paso !== 1 && "hidden")} disabled={pendiente}>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">
            ¿A qué se dedica el negocio, en una línea? <span className="text-ink-faint">*</span>
          </span>
          <input
            name="descripcion"
            required
            maxLength={200}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Ej.: Clínica veterinaria de pequeñas especies en Heredia"
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11.5px] font-medium text-ink-mute">¿Cómo le habla a la gente?</span>
          <div className="flex gap-3">
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3 has-[:checked]:border-line-strong has-[:checked]:bg-surface-3">
              <input type="radio" name="trato" value="usted" defaultChecked className="h-3.5 w-3.5 accent-ink" />
              <span className="text-[13px] text-ink-soft">De usted</span>
            </label>
            <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3 has-[:checked]:border-line-strong has-[:checked]:bg-surface-3">
              <input type="radio" name="trato" value="vos" className="h-3.5 w-3.5 accent-ink" />
              <span className="text-[13px] text-ink-soft">De vos</span>
            </label>
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">
            ¿Algo que el agente NUNCA debe prometer? <span className="text-ink-faint">(opcional)</span>
          </span>
          <textarea
            name="queNuncaPrometer"
            rows={3}
            maxLength={500}
            placeholder="Ej.: No dar diagnósticos ni recetar medicamentos por chat, siempre pedir que traigan a la mascota."
            className={cn(campo, "resize-none")}
          />
        </label>

        <div className="flex justify-end">
          <button type="button" disabled={!descripcion.trim()} onClick={() => setPaso(2)} className={boton}>
            Siguiente →
          </button>
        </div>
      </fieldset>

      {/* ------------------------------------------------------------ Paso 2 */}
      <fieldset className={cn("flex flex-col gap-4", paso !== 2 && "hidden")} disabled={pendiente}>
        <p className="text-[12.5px] text-ink-faint">
          Los 3 a 5 servicios más pedidos alcanzan — no hace falta el catálogo completo, eso lo vas completando
          después desde &quot;Qué sabe&quot;.
        </p>

        <div className="flex flex-col gap-3">
          {filas.map((id) => (
            <div key={id} className="grid grid-cols-[1fr_140px] items-end gap-2.5 sm:grid-cols-[1fr_160px_auto]">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-ink-mute">Servicio</span>
                <input name="servicioNombre" placeholder="Ej.: Consulta general" className={campo} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-medium text-ink-mute">Precio (₡)</span>
                <CampoMonto name="servicioPrecio" placeholder="15.000" className={campo} />
              </label>
              <button
                type="button"
                onClick={() => quitarFila(id)}
                disabled={filas.length <= 1}
                className="hidden h-[42px] items-center justify-center rounded-lg border border-line-strong px-3 text-[12px] text-ink-faint transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-30 sm:flex"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        {filas.length < 5 ? (
          <button
            type="button"
            onClick={agregarFila}
            className="self-start rounded-lg border border-dashed border-line-strong px-3.5 py-2 text-[12.5px] text-ink-soft transition-colors hover:bg-surface-2"
          >
            + Agregar otro servicio
          </button>
        ) : null}

        <div className="flex justify-between">
          <button type="button" onClick={() => setPaso(1)} className={botonSecundario}>
            ← Atrás
          </button>
          <button type="button" onClick={() => setPaso(3)} className={boton}>
            Siguiente →
          </button>
        </div>
      </fieldset>

      {/* ------------------------------------------------------------ Paso 3 */}
      <fieldset className={cn("flex flex-col gap-5", paso !== 3 && "hidden")} disabled={pendiente}>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Horario de atención</span>
          <div className="flex flex-col gap-1.5">
            {DIAS_HORARIO.map(({ clave, texto }) => {
              const bloque = horarioActual[clave]?.[0];
              const cerradoPorDefecto = !bloque && (clave === "sab" || clave === "dom");
              return (
                <div key={clave} className="flex items-center gap-2">
                  <span className="w-20 flex-none text-[12px] text-ink-soft">{texto}</span>
                  <input
                    type="time"
                    name={`ini_${clave}`}
                    defaultValue={bloque ? bloque[0] : cerradoPorDefecto ? "" : "08:00"}
                    disabled={cerradoPorDefecto}
                    className={cn(campoChico, "max-w-[110px] disabled:opacity-40")}
                  />
                  <span className="text-ink-faint">–</span>
                  <input
                    type="time"
                    name={`fin_${clave}`}
                    defaultValue={bloque ? bloque[1] : cerradoPorDefecto ? "" : "17:00"}
                    disabled={cerradoPorDefecto}
                    className={cn(campoChico, "max-w-[110px] disabled:opacity-40")}
                  />
                  <input type="hidden" name={`cerrado_${clave}`} value={cerradoPorDefecto ? "on" : ""} />
                </div>
              );
            })}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">
            Dirección <span className="text-ink-faint">(opcional)</span>
          </span>
          <input name="direccion" placeholder="Ej.: 200m sur del parque, San Rafael de Heredia" className={campo} />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">
            Formas de pago <span className="text-ink-faint">(opcional)</span>
          </span>
          <input name="formasPago" placeholder="Ej.: SINPE Móvil, efectivo, tarjeta" className={campo} />
        </label>

        {estado && !estado.ok ? (
          <p role="alert" className="rounded-lg bg-bad/10 px-3.5 py-3 text-[12.5px] text-bad">
            {estado.error}
          </p>
        ) : null}

        <div className="flex justify-between">
          <button type="button" disabled={pendiente} onClick={() => setPaso(2)} className={botonSecundario}>
            ← Atrás
          </button>
          <button type="submit" disabled={pendiente} className={boton}>
            {pendiente ? "Guardando…" : "Guardar y terminar"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

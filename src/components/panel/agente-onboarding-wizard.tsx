"use client";

/* ==========================================================================
   Onboarding del Agente de WhatsApp — lo llena el CLIENTE, no el admin.

   7 preguntas cortas (acordadas con Sebastián para no agobiar a una clínica
   o veterinaria) en 3 pantallas, con UN solo guardado al final
   (`guardarOnboardingAgente`). Los 3 pasos viven en el MISMO <form>: los pasos
   que no se están viendo se ocultan con una clase (`hidden`, es decir
   `display:none`), no se desmontan, así el navegador igual manda sus valores al
   enviar el último paso sin tener que levantar el estado de cada campo.

   La marca de "ya lo completó" vive en `asignaciones.config.onboardingCompleto`
   (ver `agente-config.ts`), separada a propósito de `clientes.onboarding_completo`
   (el de Redes) — un cliente con las dos automatizaciones no tacha una al
   terminar la otra.

   Cambios de la Fase 4b: ahora se puede quitar un servicio en el celular, el
   horario se puede abrir también el sábado y el domingo, Enter ya no salta
   directo al guardado (avanza de paso) y, si el guardado falla, lo escrito se
   conserva.
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CampoToken } from "@/components/panel/campo-token";
import { CampoMonto } from "@/components/panel/campo-monto";
import { Campo, MensajeEstado, Segmentado } from "@/components/panel/configuracion/controles";
import { EditorHorario } from "@/components/panel/configuracion/editor-horario";
import { BTN_PRIMARIO, BTN_SECUNDARIO, CAMPO } from "@/components/panel/configuracion/estilos";
import { IconoBasura, IconoCheck, IconoMas, Spinner } from "@/components/panel/configuracion/iconos-extra";
import { useAccionPanel } from "@/components/panel/configuracion/usar-accion";
import { cn } from "@/lib/utils";

type Paso = 1 | 2 | 3 | "listo";

const PASOS = [
  { n: 1, texto: "Tu negocio" },
  { n: 2, texto: "Servicios" },
  { n: 3, texto: "Horario y contacto" },
] as const;

const MAX_SERVICIOS = 5;

function Progreso({ paso }: { paso: Paso }) {
  if (paso === "listo") return null;
  return (
    <ol aria-label="Progreso" className="flex items-center gap-2">
      {PASOS.map((p, i) => {
        const hecho = p.n < paso;
        const actual = p.n === paso;
        return (
          <li key={p.n} className={cn("flex items-center gap-2", i < PASOS.length - 1 && "flex-1")}>
            <span
              aria-current={actual ? "step" : undefined}
              className={cn(
                "grid h-8 w-8 flex-none place-items-center rounded-full text-[12px] font-medium transition-colors",
                hecho && "bg-ok text-paper",
                actual && "bg-[var(--panel-acento)] text-white",
                !hecho && !actual && "bg-surface-3 text-ink-mute"
              )}
            >
              {hecho ? <IconoCheck className="h-4 w-4" /> : p.n}
              <span className="sr-only">
                {hecho ? " (hecho)" : actual ? " (paso actual)" : ""} {p.texto}
              </span>
            </span>
            {/* En celular solo se nombra el paso actual: tres nombres no caben. */}
            <span
              aria-hidden="true"
              className={cn(
                "text-[12px] whitespace-nowrap",
                actual ? "font-medium text-ink" : "hidden text-ink-mute sm:inline"
              )}
            >
              {p.texto}
            </span>
            {i < PASOS.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn("h-px min-w-3 flex-1 transition-colors", hecho ? "bg-ok/60" : "bg-line-strong")}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function TituloPaso({ n, titulo, children }: { n: number; titulo: string; children?: React.ReactNode }) {
  return (
    <div>
      <h2
        id={`paso-${n}-titulo`}
        tabIndex={-1}
        className="text-[15px] font-semibold tracking-tight text-ink outline-none"
      >
        {titulo}
      </h2>
      {children ? <p className="mt-1 text-[12.5px] leading-snug text-ink-mute">{children}</p> : null}
    </div>
  );
}

export function AgenteOnboardingWizard({
  horarioActual,
  completo,
}: {
  horarioActual: Record<string, [string, string][]>;
  /** Ya lo llenó antes: no se deja repetir (duplicaría los servicios). */
  completo: boolean;
}) {
  /* Se congela al montar: el servidor marca "completo" al guardar y, si algo
     fallara después, el refresh no debe mandar a la persona a "Ya completaste"
     perdiendo el error y lo escrito. */
  const [yaEstaba] = useState(completo);
  const [paso, setPaso] = useState<Paso>(1);
  const [descripcion, setDescripcion] = useState("");
  const [filas, setFilas] = useState<number[]>([0, 1, 2]);
  const [errorPaso, setErrorPaso] = useState<string | null>(null);
  const [estado, ejecutar, pendiente] = useAccionPanel("guardarOnboardingAgente", (r) => {
    if (r.ok) setPaso("listo");
  });
  const raiz = useRef<HTMLFormElement>(null);
  const primeraVez = useRef(true);

  /* Cada vez que cambia el paso, la pantalla vuelve al principio del
     formulario y el foco va al título del paso nuevo: en el celular el botón
     "Siguiente" queda abajo y, sin esto, el paso 2 empezaría a media altura. */
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    if (paso === "listo") return;
    raiz.current?.scrollIntoView({ block: "start" });
    document.getElementById(`paso-${paso}-titulo`)?.focus({ preventScroll: true });
  }, [paso]);

  function agregarFila() {
    setFilas((f) => (f.length >= MAX_SERVICIOS ? f : [...f, (f[f.length - 1] ?? -1) + 1]));
  }
  function quitarFila(id: number) {
    setFilas((f) => (f.length <= 1 ? f : f.filter((x) => x !== id)));
  }

  function irAlPaso2() {
    if (!descripcion.trim()) {
      setErrorPaso("Contanos a qué se dedica el negocio para poder seguir.");
      raiz.current?.querySelector<HTMLInputElement>('input[name="descripcion"]')?.focus();
      return;
    }
    setErrorPaso(null);
    setPaso(2);
  }

  function siguiente() {
    if (paso === 1) irAlPaso2();
    else if (paso === 2) setPaso(3);
  }

  /* Enter dentro de un campo de los pasos 1 y 2 avanza de paso. Sin esto, el
     navegador lo toma como "enviar" y guardaba todo a medias. */
  function alTeclear(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key !== "Enter" || paso === 3) return;
    if ((e.target as HTMLElement).tagName !== "INPUT") return;
    e.preventDefault();
    siguiente();
  }

  /* `onSubmit` y no `action`: con `action`, React 19 vacía el formulario al
     enviarlo y, si el guardado fallaba, se perdía todo lo escrito. */
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (paso !== 3) {
      siguiente();
      return;
    }
    ejecutar(new FormData(e.currentTarget));
  }

  /* Ya estaba completo al entrar: se explica dónde editar cada cosa. Si lo
     acaba de terminar acá, gana la pantalla de "Listo" de abajo — por eso
     el wizard se queda montado en vez de que la página lo cambie por otro
     bloque al refrescar. */
  if (yaEstaba && paso !== "listo") {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Ya completaste esto</h2>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-mute">
            Para cambiar algo, andá directo a la pantalla que lo edita.
          </p>
        </div>
        <p className="max-w-[56ch] text-[13px] leading-relaxed text-ink-mute">
          Los servicios, el horario y el tono ya no se editan desde acá: este formulario es solo para la primera vez,
          así no se duplica nada.
        </p>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <Link href="/panel/agente/que-sabe" className={BTN_SECUNDARIO}>
            Editar servicios (Conocimiento)
          </Link>
          <Link href="/panel/agente/como-responde" className={BTN_SECUNDARIO}>
            Editar tono y horario (Configuración)
          </Link>
        </div>
      </div>
    );
  }

  if (paso === "listo") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-ok text-paper">
            <IconoCheck className="h-5 w-5" />
          </span>
          <p role="status" className="text-[15px] font-semibold tracking-tight text-ink">
            Listo. El agente ya tiene lo esencial.
          </p>
        </div>
        <p className="max-w-[52ch] text-[13px] leading-relaxed text-ink-mute">
          Podés seguir afinando todo esto cuando quieras: los servicios y precios se editan desde{" "}
          <Link href="/panel/agente/que-sabe" className="text-ink underline underline-offset-2">
            Conocimiento
          </Link>
          , y el tono, el horario y la agenda desde{" "}
          <Link href="/panel/agente/como-responde" className="text-ink underline underline-offset-2">
            Configuración
          </Link>
          .
        </p>
        <Link href="/panel/agente" className={cn(BTN_PRIMARIO, "self-start")}>
          Ir al Resumen
        </Link>
      </div>
    );
  }

  return (
    <form ref={raiz} onSubmit={enviar} onKeyDown={alTeclear} className="flex scroll-mt-4 flex-col gap-6">
      <CampoToken />
      <Progreso paso={paso} />

      {/* ------------------------------------------------------------ Paso 1 */}
      <fieldset className={cn("flex min-w-0 flex-col gap-5", paso !== 1 && "hidden")} disabled={pendiente}>
        <TituloPaso n={1} titulo="Tu negocio">
          Con esto el agente sabe quién es y cómo hablarle a la gente.
        </TituloPaso>

        <Campo
          etiqueta={
            <>
              ¿A qué se dedica el negocio, en una línea? <span className="text-ink-mute">*</span>
            </>
          }
        >
          <input
            name="descripcion"
            required
            maxLength={200}
            value={descripcion}
            onChange={(e) => {
              setDescripcion(e.target.value);
              if (errorPaso) setErrorPaso(null);
            }}
            autoComplete="off"
            placeholder="Ej.: Clínica veterinaria de pequeñas especies en Heredia"
            className={CAMPO}
          />
        </Campo>

        <Segmentado
          nombre="trato"
          etiqueta="¿Cómo le habla a la gente?"
          valor="usted"
          opciones={[
            { valor: "usted", texto: "De usted" },
            { valor: "vos", texto: "De vos" },
          ]}
        />

        <Campo
          etiqueta={
            <>
              ¿Algo que el agente NUNCA debe prometer? <span className="text-ink-mute">(opcional)</span>
            </>
          }
        >
          <textarea
            name="queNuncaPrometer"
            rows={3}
            maxLength={500}
            autoComplete="off"
            placeholder="Ej.: No dar diagnósticos ni recetar medicamentos por chat, siempre pedir que traigan a la mascota."
            className={cn(CAMPO, "resize-none")}
          />
        </Campo>

        {errorPaso ? <MensajeEstado ok={false}>{errorPaso}</MensajeEstado> : null}

        <div className="flex justify-end">
          <button type="button" onClick={siguiente} className={cn(BTN_PRIMARIO, "w-full sm:w-auto")}>
            Siguiente
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </fieldset>

      {/* ------------------------------------------------------------ Paso 2 */}
      <fieldset className={cn("flex min-w-0 flex-col gap-4", paso !== 2 && "hidden")} disabled={pendiente}>
        <TituloPaso n={2} titulo="Tus servicios">
          Los 3 a 5 servicios más pedidos alcanzan — no hace falta el catálogo completo, eso lo vas completando
          después desde Conocimiento.
        </TituloPaso>

        <ul className="flex flex-col gap-3">
          {filas.map((id, i) => (
            <li
              key={id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2.5 gap-y-3 rounded-xl border border-line bg-surface p-3 sm:grid-cols-[minmax(0,1fr)_170px_auto] sm:p-3.5"
            >
              <Campo etiqueta={`Servicio ${i + 1}`} className="col-span-2 sm:col-span-1">
                <input name="servicioNombre" autoComplete="off" placeholder="Ej.: Consulta general" className={CAMPO} />
              </Campo>
              <Campo etiqueta="Precio (₡)">
                <CampoMonto name="servicioPrecio" placeholder="Ej.: 15.000" className={CAMPO} />
              </Campo>
              <button
                type="button"
                onClick={() => quitarFila(id)}
                disabled={filas.length <= 1}
                aria-label={`Quitar el servicio ${i + 1}`}
                className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-line-strong text-ink-mute transition-colors hover:bg-bad/10 hover:text-bad focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-30"
              >
                <IconoBasura className="h-[18px] w-[18px]" />
              </button>
            </li>
          ))}
        </ul>

        {filas.length < MAX_SERVICIOS ? (
          <button
            type="button"
            onClick={agregarFila}
            className={cn(BTN_SECUNDARIO, "w-full border-dashed sm:w-auto sm:self-start")}
          >
            <IconoMas className="h-4 w-4" />
            Agregar otro servicio
          </button>
        ) : (
          <p className="text-[12px] text-ink-mute">Llegaste a {MAX_SERVICIOS}: el resto lo cargás desde Conocimiento.</p>
        )}

        <div className="flex justify-between gap-3">
          <button type="button" onClick={() => setPaso(1)} className={BTN_SECUNDARIO}>
            <span aria-hidden="true">←</span>
            Atrás
          </button>
          <button type="button" onClick={() => setPaso(3)} className={BTN_PRIMARIO}>
            Siguiente
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </fieldset>

      {/* ------------------------------------------------------------ Paso 3 */}
      <fieldset className={cn("flex min-w-0 flex-col gap-5", paso !== 3 && "hidden")} disabled={pendiente}>
        <TituloPaso n={3} titulo="Horario y contacto">
          El agente solo ofrece citas dentro de este horario.
        </TituloPaso>

        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-ink-mute">Horario de atención</span>
          <EditorHorario
            horario={horarioActual}
            cerradoPorDefecto={(clave) => clave === "sab" || clave === "dom"}
          />
        </div>

        <Campo
          etiqueta={
            <>
              Dirección <span className="text-ink-mute">(opcional)</span>
            </>
          }
        >
          <input
            name="direccion"
            autoComplete="off"
            placeholder="Ej.: 200 m sur del parque, San Rafael de Heredia"
            className={CAMPO}
          />
        </Campo>

        <Campo
          etiqueta={
            <>
              Formas de pago <span className="text-ink-mute">(opcional)</span>
            </>
          }
        >
          <input name="formasPago" autoComplete="off" placeholder="Ej.: SINPE Móvil, efectivo, tarjeta" className={CAMPO} />
        </Campo>

        {estado && !estado.ok ? <MensajeEstado ok={false}>{estado.error}</MensajeEstado> : null}

        <div className="flex justify-between gap-3">
          <button type="button" disabled={pendiente} onClick={() => setPaso(2)} className={BTN_SECUNDARIO}>
            <span aria-hidden="true">←</span>
            Atrás
          </button>
          <button type="submit" disabled={pendiente} className={BTN_PRIMARIO}>
            {pendiente ? (
              <>
                <Spinner className="h-4 w-4" />
                Guardando…
              </>
            ) : (
              "Guardar y terminar"
            )}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

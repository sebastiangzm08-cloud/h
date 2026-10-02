"use client";

/* ==========================================================================
   Perfil de WhatsApp del negocio — lo que la gente ve al abrir el chat:
   foto, "info", descripción, dirección y sitio. Se guarda directo en Meta
   (no hay copia en Supabase), por eso el formulario arranca con lo que
   `getPerfilWhatsapp` trajo EN VIVO.

   Dos formularios aparte porque son dos acciones distintas con dos pedidos a
   Meta: la foto (se sube primero y después se asigna) y los datos de texto.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { Campo, MensajeEstado, Selector } from "@/components/panel/configuracion/controles";
import { BTN_PRIMARIO, BTN_SECUNDARIO, CAMPO } from "@/components/panel/configuracion/estilos";
import { Spinner } from "@/components/panel/configuracion/iconos-extra";
import { useAccionPanel, useAvisoTemporal } from "@/components/panel/configuracion/usar-accion";
import { VERTICALES_WHATSAPP, type PerfilWhatsapp } from "@/lib/panel/agente-formato";
import { cn } from "@/lib/utils";

const MAX_INFO = 139;

export function FormaPerfilWhatsapp({ perfil }: { perfil: PerfilWhatsapp }) {
  if (perfil.estado === "sin_conectar") return null;
  if (perfil.estado === "error") {
    return <MensajeEstado ok={false}>No se pudo leer el perfil de WhatsApp: {perfil.detalle}</MensajeEstado>;
  }

  return (
    <div className="flex flex-col gap-5">
      <FormaFoto fotoActual={perfil.fotoUrl} />
      <div className="h-px bg-line" aria-hidden="true" />
      <FormaDatos perfil={perfil} />
    </div>
  );
}

/* -------------------------------------------------------------------------
   Datos de texto
   ------------------------------------------------------------------------- */

function FormaDatos({ perfil }: { perfil: Extract<PerfilWhatsapp, { estado: "ok" }> }) {
  const [estado, guardar, guardando] = useAccionPanel("guardarPerfilWhatsapp");
  const aviso = useAvisoTemporal(estado);
  const [info, setInfo] = useState(perfil.about);

  /* `onSubmit` y no `action`: con `action`, React 19 vacía el formulario al
     enviarlo y, si Meta rechazaba algo, se perdía todo lo escrito. */
  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    guardar(new FormData(e.currentTarget));
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3.5">
      <CampoToken />

      <Campo
        etiqueta="Info"
        ayuda={
          <span className="flex items-baseline justify-between gap-3">
            <span>Lo primero que ve la gente.</span>
            <span className="font-mono tabular-nums">
              {info.length}/{MAX_INFO}
            </span>
          </span>
        }
      >
        <input
          name="about"
          maxLength={MAX_INFO}
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          autoComplete="off"
          placeholder="Ej.: Clínica Dental Aurora"
          className={CAMPO}
        />
      </Campo>

      <Campo etiqueta="Descripción del negocio">
        <textarea
          name="descripcion"
          rows={3}
          maxLength={512}
          defaultValue={perfil.descripcion}
          autoComplete="off"
          placeholder="Ej.: Atención dental general, de lunes a sábado."
          className={cn(CAMPO, "resize-none")}
        />
      </Campo>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Campo etiqueta="Dirección">
          <input name="direccion" maxLength={256} defaultValue={perfil.direccion} autoComplete="off" className={CAMPO} />
        </Campo>
        <Campo etiqueta="Categoría del negocio">
          <Selector name="vertical" defaultValue={perfil.vertical} autoComplete="off">
            {VERTICALES_WHATSAPP.map((v) => (
              <option key={v.valor} value={v.valor}>
                {v.texto}
              </option>
            ))}
          </Selector>
        </Campo>
        <Campo etiqueta="Correo">
          <input
            name="correo"
            type="email"
            maxLength={128}
            defaultValue={perfil.correo}
            autoComplete="off"
            inputMode="email"
            className={CAMPO}
          />
        </Campo>
        <Campo etiqueta="Sitio web">
          <input
            name="sitio"
            type="url"
            maxLength={256}
            defaultValue={perfil.sitio}
            autoComplete="off"
            inputMode="url"
            placeholder="https://"
            className={CAMPO}
          />
        </Campo>
      </div>

      {estado && !estado.ok ? <MensajeEstado ok={false}>{estado.error}</MensajeEstado> : null}
      {aviso ? <MensajeEstado ok>{aviso}</MensajeEstado> : null}

      <div>
        <button type="submit" disabled={guardando} className={cn(BTN_PRIMARIO, "w-full sm:w-auto")}>
          {guardando ? (
            <>
              <Spinner className="h-4 w-4" />
              Guardando en WhatsApp…
            </>
          ) : (
            "Guardar perfil"
          )}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------
   Foto
   ------------------------------------------------------------------------- */

function FormaFoto({ fotoActual }: { fotoActual: string }) {
  const [estado, subir, subiendo] = useAccionPanel("subirFotoWhatsapp");
  const aviso = useAvisoTemporal(estado);
  const [previa, setPrevia] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);

  function elegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (previa) URL.revokeObjectURL(previa);
    setPrevia(archivo ? URL.createObjectURL(archivo) : null);
    setNombreArchivo(archivo?.name ?? null);
  }

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    subir(new FormData(e.currentTarget));
  }

  const foto = previa || fotoActual;

  return (
    <form onSubmit={enviar} className="flex flex-col gap-3">
      <CampoToken />

      <div className="flex items-center gap-3.5">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element -- la foto viene de Meta (URL temporal) o de una vista previa local
          <img
            src={foto}
            alt="Foto de perfil de WhatsApp"
            className="h-16 w-16 flex-none rounded-full border border-line-strong bg-surface-3 object-cover"
          />
        ) : (
          <span
            aria-label="Sin foto de perfil todavía"
            role="img"
            className="grid h-16 w-16 flex-none place-items-center rounded-full border border-dashed border-line-strong bg-surface-3 text-[11px] text-ink-mute"
          >
            Sin foto
          </span>
        )}

        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-[13px] font-medium text-ink-soft">Foto de perfil</p>
          <div className="flex flex-wrap items-center gap-2">
            <label
              className={cn(
                BTN_SECUNDARIO,
                "cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2"
              )}
            >
              {foto ? "Elegir otra" : "Elegir foto"}
              <input
                type="file"
                name="foto"
                accept="image/png,image/jpeg"
                onChange={elegir}
                className="sr-only"
              />
            </label>
            {nombreArchivo ? (
              <button type="submit" disabled={subiendo} className={BTN_PRIMARIO}>
                {subiendo ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Subiendo…
                  </>
                ) : (
                  "Cambiar foto"
                )}
              </button>
            ) : null}
          </div>
          <p className="truncate text-[11.5px] text-ink-mute">{nombreArchivo ?? "JPG o PNG, cuadrada se ve mejor."}</p>
        </div>
      </div>

      {estado && !estado.ok ? <MensajeEstado ok={false}>{estado.error}</MensajeEstado> : null}
      {aviso ? <MensajeEstado ok>{aviso}</MensajeEstado> : null}
    </form>
  );
}

"use client";

/* ==========================================================================
   Formulario de alta de cliente.

   Llama al Server Action `crearCuentaCliente`, que crea la cuenta de acceso,
   la ficha del negocio y el perfil — las tres de una, y deshace si algo
   falla. La contraseña se genera acá con un botón, o la escribís vos.
   ========================================================================== */
import { useActionState, useState } from "react";
import { crearCuentaCliente, type ResultadoAccion } from "@/lib/panel/admin-acciones";
import { cn } from "@/lib/utils";

const campo =
  "h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[14px] text-ink " +
  "placeholder:text-ink-faint transition-colors focus:border-line-strong " +
  "focus:bg-surface-3 focus:outline-none";

function claveAlAzar() {
  // Legible, sin caracteres que se confunden. Suficiente para un primer acceso.
  const abc = "abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ2345679";
  let s = "";
  for (let i = 0; i < 12; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

function Campo({
  label,
  name,
  requerido,
  tipo = "text",
  placeholder,
}: {
  label: string;
  name: string;
  requerido?: boolean;
  tipo?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-medium text-ink-mute">
        {label} {requerido ? <span className="text-ink-faint">*</span> : null}
      </span>
      <input
        name={name}
        type={tipo}
        required={requerido}
        placeholder={placeholder}
        className={campo}
      />
    </label>
  );
}

export function FormAlta() {
  const [estado, accion, pendiente] = useActionState<ResultadoAccion | null, FormData>(
    crearCuentaCliente,
    null
  );
  const [clave, setClave] = useState("");

  return (
    <form action={accion} className="flex flex-col gap-6">
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={pendiente}>
        <Campo label="Nombre del negocio" name="nombreNegocio" requerido placeholder="Farmasi · Johana" />
        <Campo label="Rubro" name="rubro" placeholder="Suplementos y cuidado personal" />
        <Campo label="Persona de contacto" name="personaContacto" placeholder="Johana Rodríguez" />
        <Campo label="WhatsApp" name="whatsapp" placeholder="+506 6079 1641" />
        <Campo label="Correo de acceso" name="correo" requerido tipo="email" placeholder="johana@sunegocio.com" />
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">Plan</span>
          <select name="plan" defaultValue="Básico" className={cn(campo, "appearance-none")}>
            <option>Básico</option>
            <option>Growth</option>
            <option>Scale</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">
            Automatización
          </span>
          <select
            name="automatizacion"
            defaultValue="redes-sociales"
            className={cn(campo, "appearance-none")}
          >
            <option value="">— asignar después —</option>
            <option value="redes-sociales">Redes sociales</option>
            <option value="agente-whatsapp">Agente de WhatsApp</option>
            <option value="prospeccion-clientes">Prospección e inteligencia</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-medium text-ink-mute">
            Precio mensual <span className="text-ink-faint">(₡, opcional)</span>
          </span>
          <input
            name="precioAsignacion"
            type="number"
            min={0}
            step={1000}
            placeholder="Deja vacío = precio de lista"
            className={campo}
          />
          <span className="text-[11px] text-ink-faint">
            Para precio de fundador o promos. Vacío usa el del catálogo.
          </span>
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-[11.5px] font-medium text-ink-mute">
            Contraseña de primer acceso <span className="text-ink-faint">*</span>
          </span>
          <div className="flex gap-2">
            <input
              name="clave"
              type="text"
              required
              minLength={8}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Al menos 8 caracteres"
              className={campo}
            />
            <button
              type="button"
              onClick={() => setClave(claveAlAzar())}
              className="h-11 flex-none rounded-xl border border-line-strong px-4 text-[12.5px] text-ink transition-colors hover:bg-surface-2"
            >
              Generar
            </button>
          </div>
          <span className="text-[11px] text-ink-faint">
            Se la pasás vos por WhatsApp. No queda guardada en ningún lado — el
            cliente la cambia desde Ajustes.
          </span>
        </label>
      </fieldset>

      {estado && !estado.ok ? (
        <p role="alert" className="rounded-lg bg-bad/10 px-3.5 py-3 text-[12.5px] text-bad">
          {estado.error}
        </p>
      ) : null}
      {estado && estado.ok ? (
        <p role="status" className="rounded-lg bg-ok/10 px-3.5 py-3 text-[12.5px] leading-relaxed whitespace-pre-line text-ok">
          {estado.mensaje}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-ink px-6 text-[13.5px] font-medium text-paper",
          "transition-all duration-200 ease-out hover:bg-ink-soft active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {pendiente ? "Creando…" : "Crear cuenta del cliente"}
      </button>
    </form>
  );
}

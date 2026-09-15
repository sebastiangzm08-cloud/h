"use client";

/* ==========================================================================
   Perfil de WhatsApp del negocio — lo que la gente ve al abrir el chat:
   foto, "info", descripción, dirección y sitio. Se guarda directo en Meta
   (no hay copia en Supabase), por eso el formulario arranca con lo que
   `getPerfilWhatsapp` trajo EN VIVO.
   ========================================================================== */
import { useState } from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { VERTICALES_WHATSAPP, type PerfilWhatsapp } from "@/lib/panel/agente-formato";
import { cn } from "@/lib/utils";

const campo =
  "w-full rounded-lg border border-line-strong bg-surface-2 px-3 py-2 text-[13px] text-ink " +
  "placeholder:text-ink-faint outline-none transition-colors focus:border-ink-faint";

export function FormaPerfilWhatsapp({ perfil }: { perfil: PerfilWhatsapp }) {
  const [estado, guardar, guardando] = useAccionAgente("guardarPerfilWhatsapp");

  if (perfil.estado === "sin_conectar") return null;
  if (perfil.estado === "error") {
    return (
      <p className="text-[12.5px] text-bad">
        No se pudo leer el perfil de WhatsApp: {perfil.detalle}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FormaFoto fotoActual={perfil.fotoUrl} />

      <form action={guardar} className="flex flex-col gap-3">
        <CampoToken />

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] text-ink-faint">
            "Info" (lo primero que ve la gente, máximo ~139 caracteres)
          </span>
          <input autoComplete="off"
            name="about"
            maxLength={139}
            defaultValue={perfil.about}
            placeholder="Clínica Dental Aurora"
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] text-ink-faint">Descripción del negocio</span>
          <textarea autoComplete="off"
            name="descripcion"
            rows={2}
            defaultValue={perfil.descripcion}
            placeholder="Atención dental general, de lunes a sábado."
            className={cn(campo, "resize-none")}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-ink-faint">Dirección</span>
            <input autoComplete="off" name="direccion" defaultValue={perfil.direccion} className={campo} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-ink-faint">Categoría del negocio</span>
            <select autoComplete="off" name="vertical" defaultValue={perfil.vertical} className={campo}>
              {VERTICALES_WHATSAPP.map((v) => (
                <option key={v.valor} value={v.valor}>
                  {v.texto}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-ink-faint">Correo</span>
            <input autoComplete="off" name="correo" type="email" defaultValue={perfil.correo} className={campo} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] text-ink-faint">Sitio web</span>
            <input autoComplete="off" name="sitio" type="url" defaultValue={perfil.sitio} className={campo} />
          </label>
        </div>

        {estado && !estado.ok ? <p className="text-[12px] text-bad">{estado.error}</p> : null}
        {estado && estado.ok ? <p className="text-[12px] text-ok">{estado.mensaje}</p> : null}

        <button
          type="submit"
          disabled={guardando}
          className="self-start rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:pointer-events-none disabled:opacity-40"
        >
          {guardando ? "Guardando…" : "Guardar perfil"}
        </button>
      </form>
    </div>
  );
}

function FormaFoto({ fotoActual }: { fotoActual: string }) {
  const [estado, subir, subiendo] = useAccionAgente("subirFotoWhatsapp");
  const [previa, setPrevia] = useState<string | null>(null);

  return (
    <form action={subir} className="flex items-center gap-3">
      <CampoToken />
      <img
        src={previa || fotoActual || undefined}
        alt="Foto de perfil de WhatsApp"
        className="h-14 w-14 flex-none rounded-full border border-line-strong bg-surface-2 object-cover"
      />
      <div className="flex flex-col gap-1.5">
        <input autoComplete="off"
          type="file"
          name="foto"
          accept="image/png,image/jpeg"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPrevia(f ? URL.createObjectURL(f) : null);
          }}
          className="text-[12px] text-ink-mute file:mr-2 file:rounded-md file:border file:border-line-strong file:bg-surface-2 file:px-2 file:py-1 file:text-[11.5px] file:text-ink"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={subiendo}
            className="rounded-md border border-line-strong px-2.5 py-1 text-[11.5px] text-ink transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
          >
            {subiendo ? "Subiendo…" : "Cambiar foto"}
          </button>
          {estado && !estado.ok ? <span className="text-[11.5px] text-bad">{estado.error}</span> : null}
          {estado && estado.ok ? <span className="text-[11.5px] text-ok">Listo.</span> : null}
        </div>
      </div>
    </form>
  );
}

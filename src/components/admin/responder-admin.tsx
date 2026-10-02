"use client";

/* ==========================================================================
   Caja de respuesta del admin a una consulta de un cliente.

   Misma acción que antes (`responderConsultaAdmin`, un POST normal a
   `/api/admin/…`): solo cambia la presentación. Dos mejoras que importan:
   - el texto se borra SOLO cuando la respuesta salió; antes se borraba al
     enviar, y si fallaba se perdía lo que se había escrito;
   - el campo usa 16 px en celular (con menos, iOS hace zoom al enfocarlo).

   El `ResponderConsulta` de `components/panel` sigue siendo el del cliente
   (Soporte); no se toca para no mover esa pantalla.
   ========================================================================== */
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAdmin } from "@/components/panel/usar-accion-admin";
import { useEnvio } from "@/components/admin/usar-envio";
import { BTN_PRIMARIO, CAMPO_AREA, ETIQUETA, MensajeAccion } from "@/components/admin/admin-ui";

export function ResponderAdmin({ mensajeId }: { mensajeId: string }) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("responderConsultaAdmin");
  /* Limpia la caja solo si la respuesta salió; si falla, el texto se queda. */
  const envio = useEnvio(estado, ejecutar);

  return (
    <form {...envio} className="flex flex-col gap-3">
      <CampoToken />
      <input type="hidden" name="mensajeId" value={mensajeId} />
      <label className="flex flex-col gap-1.5">
        <span className={ETIQUETA}>Tu respuesta</span>
        <textarea
          name="texto"
          required
          rows={4}
          autoComplete="off"
          placeholder="Escribí tu respuesta…"
          readOnly={pendiente}
          className={CAMPO_AREA}
        />
      </label>

      <MensajeAccion estado={estado} />

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pendiente} className={BTN_PRIMARIO}>
          {pendiente ? "Enviando…" : "Enviar respuesta"}
        </button>
        <span className="text-[11.5px] text-ink-faint">
          El cliente la ve en su pantalla de Soporte.
        </span>
      </div>
    </form>
  );
}

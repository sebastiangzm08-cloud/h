"use client";

/* ==========================================================================
   Formulario "¿cómo está tu negocio?".

   Sus respuestas arman el prompt exacto que usa Gemini para escribir los
   textos de cada publicación. Entre mejor lo llene el cliente, mejor
   escribe la IA — por eso cada campo explica para qué sirve.

   Fase 4b: mismos campos, mismos nombres y la misma acción del servidor. Lo
   que cambia es que el envío va por `onSubmit` (con `action`, React 19 vacía
   el formulario al enviarlo y, si el guardado fallaba, se perdían los textos
   largos que la persona acababa de escribir), cada pregunta tiene su etiqueta
   asociada al campo y el botón de guardar queda a mano en el celular.
   ========================================================================== */
import { startTransition, useActionState } from "react";
import { BarraGuardar, Campo, MensajeEstado, Selector } from "@/components/panel/configuracion/controles";
import { BTN_PRIMARIO, CAMPO } from "@/components/panel/configuracion/estilos";
import { Spinner } from "@/components/panel/configuracion/iconos-extra";
import { useAvisoTemporal } from "@/components/panel/configuracion/usar-accion";
import {
  guardarPerfilNegocio,
  type ResultadoPerfil,
} from "@/lib/panel/perfil-acciones";
import type { PerfilNegocio } from "@/lib/panel/tipos";
import { cn } from "@/lib/utils";

function Pregunta({
  n,
  id,
  titulo,
  ayuda,
  children,
}: {
  n: number;
  /** Id del campo: ata la pregunta a su campo para el lector de pantalla y el toque. */
  id: string;
  titulo: string;
  ayuda: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-line py-4 first:pt-0 last:border-0">
      <div>
        <label htmlFor={id} className="text-[13.5px] font-medium text-ink">
          {n}. {titulo}
        </label>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-mute">{ayuda}</p>
      </div>
      {children}
    </div>
  );
}

export function FormularioNegocio({
  inicial,
  compacto = false,
}: {
  inicial: PerfilNegocio;
  /** true en el modal de bienvenida; false en la pantalla completa. */
  compacto?: boolean;
}) {
  const [estado, accion, pendiente] = useActionState<
    ResultadoPerfil | null,
    FormData
  >(guardarPerfilNegocio, null);
  const aviso = useAvisoTemporal(estado);

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    startTransition(() => {
      accion(datos);
    });
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-1">
      <fieldset disabled={pendiente} className="flex min-w-0 flex-col">
        <Pregunta
          n={1}
          id="negocio-queVendes"
          titulo="¿Qué vendés?"
          ayuda="Tus productos o servicios principales, en 2 o 3 líneas."
        >
          <textarea
            id="negocio-queVendes"
            name="queVendes"
            maxLength={1200}
            required
            rows={compacto ? 2 : 3}
            defaultValue={inicial.queVendes}
            autoComplete="off"
            placeholder="Ej.: cremas y suplementos de cuidado personal, por catálogo, con entrega en todo el país"
            className={cn(CAMPO, "resize-y")}
          />
        </Pregunta>

        <Pregunta
          n={2}
          id="negocio-quienCompra"
          titulo="¿Quién te compra?"
          ayuda="Tu cliente típico: edad aproximada, qué le importa, cómo habla."
        >
          <textarea
            id="negocio-quienCompra"
            name="quienCompra"
            maxLength={1200}
            rows={2}
            defaultValue={inicial.quienCompra}
            autoComplete="off"
            placeholder="Ej.: mujeres de 25 a 45, les importa verse y sentirse bien, compran por recomendación"
            className={cn(CAMPO, "resize-y")}
          />
        </Pregunta>

        <Pregunta
          n={3}
          id="negocio-queTeDiferencia"
          titulo="¿Qué te hace diferente?"
          ayuda="Por qué te eligen a vos y no a otro que vende lo mismo."
        >
          <textarea
            id="negocio-queTeDiferencia"
            name="queTeDiferencia"
            maxLength={1200}
            rows={2}
            defaultValue={inicial.queTeDiferencia}
            autoComplete="off"
            placeholder="Ej.: atención personalizada por WhatsApp, asesoría gratis, envíos en el día en el GAM"
            className={cn(CAMPO, "resize-y")}
          />
        </Pregunta>

        <Pregunta
          n={4}
          id="negocio-voz"
          titulo="Tu voz"
          ayuda="Cómo querés sonar en las publicaciones."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo etiqueta="Estilo">
              <Selector id="negocio-voz" name="voz" defaultValue={inicial.voz} autoComplete="off">
                <option value="cercano">Cercano y amable</option>
                <option value="divertido">Divertido y relajado</option>
                <option value="experto">Experto y confiable</option>
                <option value="formal">Formal y serio</option>
              </Selector>
            </Campo>
            <Campo etiqueta="Trato">
              <Selector name="trato" defaultValue={inicial.trato} autoComplete="off">
                <option value="vos">Tratar de vos</option>
                <option value="usted">Tratar de usted</option>
              </Selector>
            </Campo>
          </div>
        </Pregunta>

        <Pregunta
          n={5}
          id="negocio-queNuncaDecir"
          titulo="¿Qué NUNCA decir?"
          ayuda="Temas, promesas o palabras que la IA tiene prohibido usar."
        >
          <textarea
            id="negocio-queNuncaDecir"
            name="queNuncaDecir"
            maxLength={1200}
            rows={2}
            defaultValue={inicial.queNuncaDecir}
            autoComplete="off"
            placeholder="Ej.: no prometer resultados médicos, no hablar de precios en el post, no usar la palabra 'barato'"
            className={cn(CAMPO, "resize-y")}
          />
        </Pregunta>

        <Pregunta
          n={6}
          id="negocio-promosActivas"
          titulo="Ofertas o promos activas"
          ayuda="Lo que estás empujando ahora. Lo podés cambiar cuando quieras."
        >
          <textarea
            id="negocio-promosActivas"
            name="promosActivas"
            maxLength={1200}
            rows={2}
            defaultValue={inicial.promosActivas}
            autoComplete="off"
            placeholder="Ej.: 20% de descuento en la segunda unidad durante setiembre"
            className={cn(CAMPO, "resize-y")}
          />
        </Pregunta>

        <Pregunta
          n={7}
          id="negocio-ejemplosTexto"
          titulo="Textos que te representan — lo más importante"
          ayuda="Pegá 3 a 5 publicaciones reales, tal cual las escribís vos (o de marcas que admirás). La IA copia el arranque, el ritmo y las muletillas, no el contenido. Sin esto, los textos salen planos."
        >
          {/* El ejemplo va en un bloque VISIBLE, no en el placeholder: un
              placeholder de 4 líneas se lee gris y apagado, como si el
              campo estuviera roto, y desaparece apenas alguien empieza a
              escribir — acá queda a la vista todo el tiempo, como
              referencia real. */}
          <div className="rounded-xl border border-line bg-surface px-3.5 py-3">
            <p className="font-mono text-[10.5px] font-medium tracking-wide text-ink-mute uppercase">Ejemplo</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft italic">
              &ldquo;Amiga, se me acabó el colágeno y recién me di cuenta 🙈 Este mes lo repongo con 20%
              en la segunda. ¿Te sumás al pedido?&rdquo;
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft italic">
              &ldquo;Llegaron las cremas nuevas y ya volaron la mitad. Escribime y te aparto la tuya.&rdquo;
            </p>
          </div>
          <textarea
            id="negocio-ejemplosTexto"
            name="ejemplosTexto"
            maxLength={2000}
            rows={compacto ? 4 : 7}
            defaultValue={inicial.ejemplosTexto}
            autoComplete="off"
            placeholder="Pegá 3 a 5 textos completos, uno debajo del otro."
            className={cn(CAMPO, "resize-y")}
          />
        </Pregunta>

        <Pregunta
          n={8}
          id="negocio-links"
          titulo="Tus links"
          ayuda="Tu página web y tus redes actuales, una por línea."
        >
          <textarea
            id="negocio-links"
            name="links"
            maxLength={500}
            rows={2}
            defaultValue={inicial.links}
            autoComplete="off"
            placeholder="instagram.com/tunegocio&#10;tunegocio.com"
            className={cn(CAMPO, "resize-y")}
          />
        </Pregunta>
      </fieldset>

      <div className="mt-3">
        <BarraGuardar>
          {estado && !estado.ok ? (
            <MensajeEstado ok={false} className="sm:mr-auto sm:flex-1">
              {estado.error}
            </MensajeEstado>
          ) : null}
          {aviso ? (
            <MensajeEstado ok className="sm:mr-auto sm:flex-1">
              {aviso}
            </MensajeEstado>
          ) : null}
          <button type="submit" disabled={pendiente} className={cn(BTN_PRIMARIO, "w-full sm:w-auto")}>
            {pendiente ? (
              <>
                <Spinner className="h-4 w-4" />
                Guardando…
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </BarraGuardar>
      </div>
    </form>
  );
}

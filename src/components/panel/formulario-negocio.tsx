"use client";

/* ==========================================================================
   Formulario "¿cómo está tu negocio?".

   Sus respuestas arman el prompt exacto que usa Gemini para escribir los
   textos de cada publicación. Entre mejor lo llene el cliente, mejor
   escribe la IA — por eso cada campo explica para qué sirve.
   ========================================================================== */
import { useActionState } from "react";
import {
  guardarPerfilNegocio,
  type ResultadoPerfil,
} from "@/lib/panel/perfil-acciones";
import type { PerfilNegocio } from "@/lib/panel/tipos";
import { cn } from "@/lib/utils";

const campo =
  "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-ink " +
  "placeholder:text-ink-faint transition-colors focus:border-line-strong " +
  "focus:bg-surface-3 focus:outline-none";

function Pregunta({
  n,
  titulo,
  ayuda,
  children,
}: {
  n: number;
  titulo: string;
  ayuda: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-line py-4 first:pt-0 last:border-0">
      <div>
        <span className="text-[13.5px] font-medium text-ink">
          {n}. {titulo}
        </span>
        <p className="mt-0.5 text-[11.5px] text-ink-faint">{ayuda}</p>
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

  return (
    <form action={accion} className="flex flex-col gap-1">
      <fieldset disabled={pendiente} className="flex flex-col">
        <Pregunta
          n={1}
          titulo="¿Qué vendés?"
          ayuda="Tus productos o servicios principales, en 2 o 3 líneas."
        >
          <textarea
            name="queVendes"
            required
            rows={compacto ? 2 : 3}
            defaultValue={inicial.queVendes}
            placeholder="Ej.: colágeno, cremas y suplementos Farmasi, por catálogo, con entrega en todo el país"
            className={cn(campo, "resize-none")}
          />
        </Pregunta>

        <Pregunta
          n={2}
          titulo="¿Quién te compra?"
          ayuda="Tu cliente típico: edad aproximada, qué le importa, cómo habla."
        >
          <textarea
            name="quienCompra"
            rows={2}
            defaultValue={inicial.quienCompra}
            placeholder="Ej.: mujeres de 25 a 45, les importa verse y sentirse bien, compran por recomendación"
            className={cn(campo, "resize-none")}
          />
        </Pregunta>

        <Pregunta
          n={3}
          titulo="¿Qué te hace diferente?"
          ayuda="Por qué te eligen a vos y no a otro que vende lo mismo."
        >
          <textarea
            name="queTeDiferencia"
            rows={2}
            defaultValue={inicial.queTeDiferencia}
            placeholder="Ej.: atención personalizada por WhatsApp, asesoría gratis, envíos en el día en el GAM"
            className={cn(campo, "resize-none")}
          />
        </Pregunta>

        <Pregunta
          n={4}
          titulo="Tu voz"
          ayuda="Cómo querés sonar en las publicaciones."
        >
          <div className="flex flex-wrap gap-3">
            <select name="voz" defaultValue={inicial.voz} className={cn(campo, "max-w-[200px] appearance-none")}>
              <option value="cercano">Cercano y amable</option>
              <option value="divertido">Divertido y relajado</option>
              <option value="experto">Experto y confiable</option>
              <option value="formal">Formal y serio</option>
            </select>
            <select name="trato" defaultValue={inicial.trato} className={cn(campo, "max-w-[160px] appearance-none")}>
              <option value="vos">Tratar de vos</option>
              <option value="usted">Tratar de usted</option>
            </select>
          </div>
        </Pregunta>

        <Pregunta
          n={5}
          titulo="¿Qué NUNCA decir?"
          ayuda="Temas, promesas o palabras que la IA tiene prohibido usar."
        >
          <textarea
            name="queNuncaDecir"
            rows={2}
            defaultValue={inicial.queNuncaDecir}
            placeholder="Ej.: no prometer resultados médicos, no hablar de precios en el post, no usar la palabra 'barato'"
            className={cn(campo, "resize-none")}
          />
        </Pregunta>

        <Pregunta
          n={6}
          titulo="Ofertas o promos activas"
          ayuda="Lo que estás empujando ahora. Lo podés cambiar cuando quieras."
        >
          <textarea
            name="promosActivas"
            rows={2}
            defaultValue={inicial.promosActivas}
            placeholder="Ej.: 20% de descuento en la segunda unidad durante setiembre"
            className={cn(campo, "resize-none")}
          />
        </Pregunta>

        <Pregunta
          n={7}
          titulo="Textos que te representan — lo más importante"
          ayuda="Pegá 3 a 5 publicaciones reales, tal cual las escribís vos (o de marcas que admirás). La IA copia el arranque, el ritmo y las muletillas, no el contenido. Sin esto, los textos salen planos."
        >
          <textarea
            name="ejemplosTexto"
            rows={compacto ? 4 : 7}
            defaultValue={inicial.ejemplosTexto}
            placeholder={
              "Pegá 3-5 textos completos, uno debajo del otro. Ejemplo:\n\n" +
              "“Amiga, se me acabó el colágeno y recién me di cuenta 🙈 Este mes lo repongo con 20% en la segunda. ¿Te sumás al pedido?”\n\n" +
              "“Llegaron las cremas nuevas y ya volaron la mitad. Escribime y te aparto la tuya.”"
            }
            className={cn(campo, "resize-none")}
          />
        </Pregunta>

        <Pregunta
          n={8}
          titulo="Tus links"
          ayuda="Tu página web y tus redes actuales, una por línea."
        >
          <textarea
            name="links"
            rows={2}
            defaultValue={inicial.links}
            placeholder="instagram.com/tunegocio&#10;tunegocio.com"
            className={cn(campo, "resize-none")}
          />
        </Pregunta>
      </fieldset>

      {estado && !estado.ok ? (
        <p role="alert" className="mt-3 rounded-lg bg-bad/10 px-3.5 py-3 text-[12.5px] text-bad">
          {estado.error}
        </p>
      ) : null}
      {estado && estado.ok ? (
        <p role="status" className="mt-3 rounded-lg bg-ok/10 px-3.5 py-3 text-[12.5px] text-ok">
          {estado.mensaje}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className={cn(
          "mt-4 inline-flex h-11 items-center justify-center gap-2 self-start rounded-full bg-ink px-6 text-[13.5px] font-medium text-paper",
          "transition-all duration-200 ease-out hover:bg-ink-soft active:scale-[0.98]",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {pendiente ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

/* ==========================================================================
   El perfil del negocio: el formulario "¿cómo está tu negocio?".

   Aparece con un aviso al entrar hasta que se llena una vez; después se
   puede volver acá a ajustarlo cuando cambie algo del negocio.
   ========================================================================== */
import { Caja, CajaHead, PageHead } from "@/components/panel/ui";
import { FormularioNegocio } from "@/components/panel/formulario-negocio";
import { getAsignacion, getCliente, getPerfilNegocio } from "@/lib/panel/datos";

export default async function PerfilNegocioPage() {
  const [cliente, perfil, redes] = await Promise.all([
    getCliente(),
    getPerfilNegocio(),
    getAsignacion("redes-sociales"),
  ]);

  /* Este formulario es para que la IA escriba POSTS — solo lo usa Redes
     sociales. Un cliente sin esa automatización (ej. solo Agente de
     WhatsApp, que arma su propio "cerebro" en Qué sabe / Cómo responde)
     no tiene por qué ver preguntas sobre publicaciones. El link del
     sidebar ya lo esconde (ver `shell.tsx`); esto es la red de seguridad
     si alguien entra por la URL directa. */
  if (!redes) {
    return (
      <>
        <PageHead titulo="Tu negocio" descripcion="Este formulario es para Redes sociales." />
        <Caja className="max-w-2xl">
          <p className="text-[13px] leading-relaxed text-ink-mute">
            Ninguna de tus automatizaciones actuales usa este formulario todavía —
            es lo que le da contexto a la IA para escribir publicaciones, y hoy no
            tenés Redes sociales asignado. Si tu Agente de WhatsApp necesita algo
            de tu negocio, se configura en{" "}
            <a href="/panel/agente/que-sabe" className="text-ink underline underline-offset-2">
              Qué sabe
            </a>
            , dentro de su propio entorno.
          </p>
        </Caja>
      </>
    );
  }

  return (
    <>
      <PageHead
        titulo="Tu negocio"
        descripcion="Contanos cómo es tu negocio. Con esto la IA escribe los textos de tus publicaciones como si te conociera."
      />

      <Caja className="max-w-2xl border-ink-faint/40 bg-white/[0.02]">
        <p className="text-[13px] font-medium text-ink">
          La calidad de tus publicaciones sale de acá.
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-mute">
          La IA solo sabe lo que le contás en este formulario. Cuanto más y
          mejor lo llenes —sobre todo los textos de ejemplo—, más natural y
          tuyo va a sonar cada post. Si queda a medias, los textos salen
          genéricos.
          {!cliente.onboardingCompleto
            ? " Podés guardar e ir ajustándolo con calma."
            : ""}
        </p>
      </Caja>

      <Caja className="max-w-2xl">
        <CajaHead eyebrow="Formulario" titulo="¿Cómo está tu negocio?" />
        <FormularioNegocio inicial={perfil} />
      </Caja>
    </>
  );
}

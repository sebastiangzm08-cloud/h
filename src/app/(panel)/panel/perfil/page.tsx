/* ==========================================================================
   El perfil del negocio: el formulario "¿cómo está tu negocio?".

   Aparece con un aviso al entrar hasta que se llena una vez; después se
   puede volver acá a ajustarlo cuando cambie algo del negocio.
   ========================================================================== */
import { Caja, CajaHead, PageHead } from "@/components/panel/ui";
import { FormularioNegocio } from "@/components/panel/formulario-negocio";
import { getCliente, getPerfilNegocio } from "@/lib/panel/datos";

export default async function PerfilNegocioPage() {
  const [cliente, perfil] = await Promise.all([
    getCliente(),
    getPerfilNegocio(),
  ]);

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

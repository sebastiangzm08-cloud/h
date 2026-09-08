/* ==========================================================================
   Automatizaciones del cliente.

   Es la sección desde donde se usa TODO. Cada cuadro contratado lleva a su
   pantalla propia, donde adentro está lo suyo: configurarla y usarla (subir
   fotos para redes, ver conversaciones para WhatsApp). No hay una sección
   "Contenido" ni nada de redes en la barra — no todos contratan redes.

   Abajo, lo que el cliente puede sumar: lo publicado que aún no tiene y lo
   que se construye a pedido con su plazo.
   ========================================================================== */
import {
  TarjetaCatalogo,
  TarjetaContratada,
} from "@/components/panel/tarjeta-automatizacion";
import { Eyebrow, PageHead } from "@/components/panel/ui";
import { getAsignaciones, getCatalogoDisponible } from "@/lib/panel/datos";

export default async function AutomatizacionesPage() {
  const [asignaciones, disponibles] = await Promise.all([
    getAsignaciones(),
    getCatalogoDisponible(),
  ]);

  return (
    <>
      <PageHead
        titulo="Automatizaciones"
        sub={`${asignaciones.length} contratadas`}
        descripcion="Entrá a cada una para configurarla y usarla. Todo lo suyo vive adentro de su cuadro."
      />

      <section>
        <div className="mb-3">
          <Eyebrow>Contratadas</Eyebrow>
        </div>
        {asignaciones.length > 0 ? (
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {asignaciones.map((a) => (
              <TarjetaContratada key={a.id} asignacion={a} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-line-strong bg-white/[0.03] px-5 py-8 text-center text-[13px] text-ink-faint">
            Todavía no tenés ninguna. Mirá el catálogo de abajo.
          </p>
        )}
      </section>

      {disponibles.length > 0 ? (
        <section>
          <div className="mb-3">
            <Eyebrow>Para sumar</Eyebrow>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {disponibles.map((a) => (
              <TarjetaCatalogo
                key={a.id}
                automatizacion={a}
                href={`/panel/automatizaciones/${a.slug}`}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

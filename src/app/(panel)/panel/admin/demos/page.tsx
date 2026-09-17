/* ==========================================================================
   Demos de venta — simulador de WhatsApp personalizado por prospecto.
   Ver demos-venta.sql para el porqué de la tabla separada (no son clientes:
   sin cobro, sin asignación, sin foto/logo a propósito).
   ========================================================================== */
import { Caja, CajaHead, Nota, PageHead } from "@/components/panel/ui";
import { FilaDemo, FormaCrearDemo } from "@/components/panel/demo-admin";
import { getDemosAdmin } from "@/lib/panel/admin";

export default async function DemosAdminPage() {
  const demos = await getDemosAdmin();

  return (
    <>
      <PageHead
        titulo="Demos de venta"
        sub={`${demos.length} en total`}
        descripcion="Un link por prospecto con un chat que responde como WhatsApp de verdad, usando los precios y horario reales de SU negocio."
      />

      <Caja className="max-w-2xl">
        <CajaHead eyebrow="Nueva demo" titulo="Datos del prospecto" />
        <FormaCrearDemo />
      </Caja>

      <Nota className="max-w-2xl">
        Sin foto ni logo a propósito: el avatar es solo la inicial. Cargá
        precios y horario REALES del prospecto — el bot nunca inventa lo que
        no le des, así que una demo con datos flojos responde flojo.
      </Nota>

      {demos.length > 0 ? (
        <Caja plano className="max-w-2xl">
          <CajaHead eyebrow="Existentes" titulo="Demos creadas" className="px-1.5 pt-1.5" />
          <div className="px-1.5 pb-1.5">
            {demos.map((d) => (
              <FilaDemo key={d.id} demo={d} />
            ))}
          </div>
        </Caja>
      ) : null}
    </>
  );
}

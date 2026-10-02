/* ==========================================================================
   Demos de venta — simulador de WhatsApp personalizado por prospecto.
   Ver demos-venta.sql para el porqué de la tabla separada (no son clientes:
   sin cobro, sin asignación, sin foto/logo a propósito).
   ========================================================================== */
import { Caja, CajaHead } from "@/components/panel/ui";
import { FilaDemo, FormaCrearDemo } from "@/components/panel/demo-admin";
import { AdminHead, Aviso, Cifras, TarjetaCifra, Vacio } from "@/components/admin/admin-ui";
import { getDemosAdmin } from "@/lib/panel/admin";

export default async function DemosAdminPage() {
  const demos = await getDemosAdmin();
  const activas = demos.filter((d) => d.activo).length;
  const usados = demos.reduce((s, d) => s + d.mensajesUsados, 0);
  const tope = demos.reduce((s, d) => s + d.mensajesTope, 0);

  return (
    <>
      <AdminHead
        titulo="Demos de venta"
        sub={`${demos.length} en total`}
        descripcion="Un link por prospecto con un chat que responde como WhatsApp de verdad, usando los precios y horario reales de SU negocio."
      />

      {demos.length > 0 ? (
        <Cifras columnas={3} etiqueta="Resumen de demos">
          <TarjetaCifra icono="demo" etiqueta="Demos activas" valor={activas} pie={`${demos.length - activas} en pausa`} />
          <TarjetaCifra
            icono="mensajes"
            etiqueta="Mensajes usados"
            valor={usados.toLocaleString("es-CR")}
            pie={`De ${tope.toLocaleString("es-CR")} entre todas`}
          />
          <TarjetaCifra
            icono="catalogo"
            etiqueta="Demos creadas"
            valor={demos.length}
            pie="Cada una con su propio link"
          />
        </Cifras>
      ) : null}

      <div className="grid items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-[18px]">
          <Caja>
            <CajaHead eyebrow="Nueva demo" titulo="Datos del prospecto" />
            <FormaCrearDemo />
          </Caja>

          <Aviso titulo="Cargá datos reales">
            Sin foto ni logo a propósito: el avatar es solo la inicial. Cargá precios y horario REALES del
            prospecto: el bot nunca inventa lo que no le des, así que una demo con datos flojos responde
            flojo.
          </Aviso>
        </div>

        <Caja className="min-w-0">
          <CajaHead eyebrow="Existentes" titulo="Demos creadas" />
          {demos.length === 0 ? (
            <Vacio icono="demo" titulo="Todavía no hay demos" plano>
              Cuando crees la primera, acá ves su link, cuántos mensajes lleva y la podés pausar o eliminar.
            </Vacio>
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {demos.map((d) => (
                <FilaDemo key={d.id} demo={d} />
              ))}
            </div>
          )}
        </Caja>
      </div>
    </>
  );
}

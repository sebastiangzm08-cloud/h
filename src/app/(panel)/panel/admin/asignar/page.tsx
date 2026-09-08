/* ==========================================================================
   Asignar automatización. El otro botón que reemplaza trabajo manual: con
   el catálogo maestro, el cliente 2 al 5 se dan de alta en minutos.
   ========================================================================== */
import { Caja, CajaHead, Nota, PageHead } from "@/components/panel/ui";
import { getCatalogoBase } from "@/lib/panel/datos";
import { getClientesParaSelector } from "@/lib/panel/admin";
import { nombrePlan } from "@/lib/panel/tipos";
import { FormAsignar } from "./form-asignar";

export default async function AsignarPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const [{ cliente }, clientes, catalogo] = await Promise.all([
    searchParams,
    getClientesParaSelector(),
    getCatalogoBase(),
  ]);

  const automatizaciones = catalogo.map((a) => ({
    slug: a.slug,
    nombre: a.nombre,
    plan: nombrePlan[a.planMinimo],
    precio: a.precioMensual,
  }));

  return (
    <>
      <PageHead
        titulo="Asignar automatización"
        descripcion="Le suma una automatización a un cliente y queda visible en su panel al toque."
      />

      <Caja className="max-w-lg">
        <CajaHead eyebrow="Nueva asignación" titulo="Cliente y automatización" />
        <FormAsignar
          clientes={clientes}
          automatizaciones={automatizaciones}
          clienteInicial={cliente}
        />
      </Caja>

      <Nota className="max-w-lg">
        La configuración fina (tono, horarios, límites) se llena después con el
        formulario de cada automatización, que alimenta su nodo de n8n.
      </Nota>
    </>
  );
}

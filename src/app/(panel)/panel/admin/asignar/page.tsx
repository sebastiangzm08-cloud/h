/* ==========================================================================
   Asignar automatización. El otro botón que reemplaza trabajo manual: con
   el catálogo maestro, el cliente 2 al 5 se dan de alta en minutos.

   El formulario y la lista de lo que se puede asignar salen del catálogo real;
   al elegir una, el precio se prellena con el de lista.
   ========================================================================== */
import Link from "next/link";
import { Caja, CajaHead, Eyebrow, Pill, precioMensualTexto } from "@/components/panel/ui";
import { AdminHead, BTN_PRIMARIO, Vacio } from "@/components/admin/admin-ui";
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
      <AdminHead
        titulo="Asignar automatización"
        descripcion="Le suma una automatización a un cliente y queda visible en su panel al toque."
      />

      {clientes.length === 0 ? (
        <Vacio
          icono="clientes"
          titulo="Todavía no hay clientes"
          accion={
            <Link href="/panel/admin/alta" prefetch={false} className={BTN_PRIMARIO}>
              Dar de alta el primero
            </Link>
          }
        >
          Para asignar una automatización primero necesitás un cliente.
        </Vacio>
      ) : (
        <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
          <Caja>
            <CajaHead eyebrow="Nueva asignación" titulo="Cliente y automatización" />
            <FormAsignar
              clientes={clientes}
              automatizaciones={automatizaciones}
              clienteInicial={cliente}
            />
          </Caja>

          <Caja className="bg-surface">
            <Eyebrow>Lo que podés asignar</Eyebrow>
            <ul className="mt-3 flex flex-col">
              {catalogo.map((a, i) => (
                <li key={a.slug} className={i > 0 ? "border-t border-line py-3" : "pb-3"}>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="text-[13px] font-medium text-ink">{a.nombre}</span>
                    <span className="font-mono text-[12px] text-ink-soft">{precioMensualTexto(a.precioMensual)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-faint">{a.descripcion}</p>
                  <div className="mt-1.5">
                    <Pill tono="idle">Plan {nombrePlan[a.planMinimo]}</Pill>
                  </div>
                </li>
              ))}
            </ul>
            <p className="border-t border-line pt-3.5 text-[12px] leading-snug text-ink-faint">
              La configuración fina (tono, horarios, límites) se llena después con el formulario de cada
              automatización, que alimenta su nodo de n8n.
            </p>
          </Caja>
        </div>
      )}
    </>
  );
}

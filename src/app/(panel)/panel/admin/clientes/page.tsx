/* ==========================================================================
   Clientes. La lista real, de la base. El admin las ve todas (RLS se lo
   permite); un cliente nunca llega acá (lo frena admin/layout.tsx).

   El fetch es acá; la búsqueda y el filtro por estado los maneja
   <ListaClientes> en el navegador (son pocas filas).
   ========================================================================== */
import Link from "next/link";
import { Caja, PageHead, colones } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import { getClientesAdmin } from "@/lib/panel/admin";
import { ListaClientes } from "./lista-clientes";

export default async function ClientesAdmin() {
  const clientes = await getClientesAdmin();
  const ingreso = clientes.reduce((s, c) => s + c.ingresoMensual, 0);

  return (
    <>
      <PageHead
        titulo="Clientes"
        sub={`${clientes.length} en total`}
        descripcion={`${colones(ingreso)}/mes en automatizaciones activas.`}
      >
        <Link
          href="/panel/admin/alta"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-medium text-paper transition-colors hover:bg-ink-soft"
        >
          <Icono nombre="alta" className="h-3.5 w-3.5" />
          Dar de alta
        </Link>
      </PageHead>

      {clientes.length === 0 ? (
        <Caja className="text-center">
          <p className="py-8 text-[13px] text-ink-faint">
            Todavía no hay clientes.{" "}
            <Link
              href="/panel/admin/alta"
              className="text-ink-mute underline underline-offset-2 hover:text-ink"
            >
              Dá de alta el primero
            </Link>
            .
          </p>
        </Caja>
      ) : (
        <ListaClientes clientes={clientes} />
      )}
    </>
  );
}

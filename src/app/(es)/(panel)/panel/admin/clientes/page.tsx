/* ==========================================================================
   Clientes. La lista real, de la base. El admin las ve todas (RLS se lo
   permite); un cliente nunca llega acá (lo frena admin/layout.tsx).

   Arriba, las cifras que salen de esa misma lista (nada inventado). El
   fetch es acá; la búsqueda y el filtro por estado los maneja
   <ListaClientes> en el navegador (son pocas filas).
   ========================================================================== */
import Link from "next/link";
import { Icono } from "@/components/panel/iconos";
import { colones } from "@/components/panel/ui";
import {
  AdminHead,
  BTN_PRIMARIO,
  Cifras,
  TarjetaCifra,
  Vacio,
} from "@/components/admin/admin-ui";
import { getClientesAdmin } from "@/lib/panel/admin";
import { ListaClientes } from "./lista-clientes";

export default async function ClientesAdmin() {
  const clientes = await getClientesAdmin();
  /* Solo los activos pagan; los de prueba no suman. */
  const ingreso = clientes
    .filter((c) => c.estado === "activo")
    .reduce((s, c) => s + c.ingresoMensual, 0);
  const activos = clientes.filter((c) => c.estado === "activo").length;
  const pruebas = clientes.filter((c) => c.estado === "prueba").length;
  const morosos = clientes.filter((c) => c.estado === "moroso").length;
  const suspendidos = clientes.filter((c) => c.estado === "pausado").length;
  const sinServicio = morosos + suspendidos;

  const alta = (
    <Link href="/panel/admin/alta" prefetch={false} className={BTN_PRIMARIO}>
      <Icono nombre="alta" className="h-4 w-4" />
      Dar de alta
    </Link>
  );

  return (
    <>
      <AdminHead
        titulo="Clientes"
        sub={`${clientes.length} en total`}
        descripcion="Quién tiene qué contratado, cómo va su puesta en marcha y cuánto aporta cada uno."
      >
        {alta}
      </AdminHead>

      {clientes.length === 0 ? (
        <Vacio icono="clientes" titulo="Todavía no hay clientes" accion={alta}>
          Dá de alta el primero: se crea la cuenta de acceso, la ficha del negocio y, si querés, ya le
          asignás su automatización.
        </Vacio>
      ) : (
        <>
          <Cifras columnas={4} etiqueta="Resumen de clientes">
            <TarjetaCifra
              icono="clientes"
              etiqueta="Clientes activos"
              valor={activos}
              pie="Con el servicio corriendo"
            />
            <TarjetaCifra
              icono="catalogo"
              etiqueta="En prueba"
              valor={pruebas}
              pie="Sin cobro automático todavía"
            />
            <TarjetaCifra
              icono="costos"
              etiqueta="Ingreso mensual"
              valor={colones(ingreso)}
              pie="De clientes activos (sin los de prueba)"
              href="/panel/admin/costos"
            />
            <TarjetaCifra
              icono="facturacion"
              etiqueta="Sin servicio"
              valor={sinServicio}
              pie={sinServicio > 0 ? `${morosos} morosos · ${suspendidos} suspendidos` : "Ninguno moroso ni suspendido"}
              tono={morosos > 0 ? "bad" : "normal"}
              href={sinServicio > 0 ? "/panel/admin/pagos" : undefined}
            />
          </Cifras>

          <ListaClientes clientes={clientes} />
        </>
      )}
    </>
  );
}

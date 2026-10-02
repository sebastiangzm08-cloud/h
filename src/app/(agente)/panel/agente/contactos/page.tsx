import { armarClientes } from "@/components/panel/clientes/armar";
import { ListaClientes } from "@/components/panel/clientes/lista-clientes";
import {
  AvisoDatosEjemplo,
  EncabezadoPantalla,
  PaginaPanel,
  ResumenCifras,
} from "@/components/panel/clientes/piezas";
import { RecordatoriosProximos } from "@/components/panel/clientes/recordatorios";
import {
  enModoEjemplo,
  getCitas,
  getConocimiento,
  getContactos,
  getConversaciones,
  getRecordatorios,
} from "@/lib/panel/agente";

/* ==========================================================================
   Clientes (antes "Contactos") — Fase 4a del rediseño.

   Todos los que le escribieron al negocio, con lo que el agente aprendió de
   cada conversación. En celular son tarjetas; en escritorio ancho, una tabla.
   Buscar y filtrar por estado se hace en el navegador (la lista ya viene
   completa, hasta 300).

   Regla de Sebastian: todo lo que hace el bot se puede hacer también a mano
   — por eso cada cliente tiene "Agendar cita" y "Recordatorio".
   ========================================================================== */
export default async function ClientesPage() {
  const [contactos, citas, conversaciones, recordatorios, conocimiento, ejemplo] = await Promise.all([
    getContactos(),
    getCitas(),
    getConversaciones(),
    getRecordatorios(),
    getConocimiento(),
    enModoEjemplo(),
  ]);

  const servicios = conocimiento
    .filter((c) => c.tipo === "servicio" && c.activo)
    .map((c) => ({ clave: c.clave, monto: c.monto, duracionMin: c.duracionMin }));

  const { filas, nuevosSemana, conCitaProxima, esperando } = armarClientes(contactos, citas, conversaciones);

  return (
    <PaginaPanel>
      <EncabezadoPantalla
        titulo="Clientes"
        descripcion="Todas las personas que le escribieron a tu negocio. Se crean solas cuando alguien escribe: no hay que llenar nada a mano."
      />

      <AvisoDatosEjemplo visible={ejemplo} />

      <ResumenCifras
        etiqueta="Resumen de clientes"
        className="grid-cols-2 sm:grid-cols-4"
        cifras={[
          { valor: contactos.length.toLocaleString("es-CR"), etiqueta: "Clientes" },
          { valor: nuevosSemana.toLocaleString("es-CR"), etiqueta: "Nuevos esta semana" },
          { valor: conCitaProxima.toLocaleString("es-CR"), etiqueta: "Con cita próxima" },
          {
            valor: esperando.toLocaleString("es-CR"),
            etiqueta: "Esperan a una persona",
            href: "/panel/agente/conversaciones?f=espera",
            alerta: esperando > 0,
          },
        ]}
      />

      <RecordatoriosProximos recordatorios={recordatorios} />

      <ListaClientes filas={filas} servicios={servicios} />

      {contactos.length >= 300 ? (
        <p className="text-[11.5px] leading-snug text-ink-faint">
          Se muestran los 300 clientes más recientes.
        </p>
      ) : null}
    </PaginaPanel>
  );
}

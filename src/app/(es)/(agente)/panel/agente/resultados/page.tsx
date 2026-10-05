import type { Metadata } from "next";
import { Cabecera, Cuerpo } from "@/components/panel/agente-ui";
import { EmbudoClientes } from "@/components/panel/resultados/embudo";
import { OportunidadesLista } from "@/components/panel/resultados/oportunidades";
import { RecuperacionClientes, type Recuperable } from "@/components/panel/resultados/recuperacion";
import { ResumenResultados } from "@/components/panel/resultados/resumen";
import { VentasDelMes } from "@/components/panel/resultados/ventas";
import { relativa } from "@/lib/panel/agente-formato";
import { getResultados, type Rango } from "@/lib/panel/resultados";

export const metadata: Metadata = { title: "Resultados · Hoshizora" };

/* ==========================================================================
   Resultados — "¿cuánto me está dejando mi agente y dónde se me escapa gente?"

   Cuatro secciones, todas de datos reales y sin tocar la base (ver
   `lib/panel/resultados.ts`):
   1. Dónde se pierden clientes (embudo de 7 o 30 días, `?rango=`).
   2. Ventas del mes (citas cumplidas × monto).
   3. Oportunidades (preguntaron el precio y no tienen cita en 60 días).
   4. Recuperación, versión 1 SIN envío automático: mensaje listo para copiar
      o abrir en el WhatsApp de la persona.

   Sin `redirect()` acá: el portón de sesión y de "tiene el Agente" lo hace el
   layout de `(agente)`.
   ========================================================================== */
export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string }>;
}) {
  const { rango: rangoParam } = await searchParams;
  const rango: Rango = rangoParam === "7" ? 7 : 30;

  const { embudo, ventas, oportunidades } = await getResultados(rango);

  /* La antigüedad se escribe acá, en el servidor: el cliente de Recuperación
     no depende del reloj del navegador al hidratar. */
  const recuperables: Recuperable[] | null = oportunidades
    ? oportunidades.recuperablesLista.map((o) => ({
          contactoId: o.contactoId,
          conversacionId: o.conversacionId,
          nombre: o.nombre,
          telefono: o.telefono,
          antiguedad: relativa(o.ultimoEn),
          servicio: o.servicio,
          estado: o.estado,
          mensaje: o.mensaje,
        }))
    : null;

  return (
    <>
      <Cabecera
        eyebrow="Resultados"
        titulo="Lo que tu agente te deja"
        descripcion="Dónde se pierden clientes, cuánto vendiste, a quién le falta una cita y cómo volver a escribirle. Casi todo sale solo de tus conversaciones y citas; para «Asistieron» y las ventas hace falta que marqués las citas como «Cumplida» en Agenda."
      />

      <Cuerpo className="flex flex-col gap-5">
        <ResumenResultados embudo={embudo} ventas={ventas} oportunidades={oportunidades} rango={rango} />

        <div className="grid items-start gap-5 xl:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-5">
            <div id="embudo" className="scroll-mt-4">
              <EmbudoClientes embudo={embudo} rango={rango} />
            </div>
            <div id="ventas" className="scroll-mt-4">
              <VentasDelMes ventas={ventas} />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <div id="oportunidades" className="scroll-mt-4">
              <OportunidadesLista datos={oportunidades} />
            </div>
            <div id="recuperacion" className="scroll-mt-4">
              <RecuperacionClientes
                contactos={recuperables}
                recientes={oportunidades?.recientes ?? 0}
                total={oportunidades?.recuperables ?? 0}
              />
            </div>
          </div>
        </div>
      </Cuerpo>
    </>
  );
}

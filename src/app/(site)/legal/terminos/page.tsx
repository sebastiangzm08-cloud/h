import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Términos de servicio — ${site.nombre}`,
};

export default function TerminosPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Términos de servicio"
      actualizado="26 de agosto de 2026"
      secciones={[
        {
          titulo: "Alcance del servicio",
          parrafos: [
            "La agencia diseña, implementa y mantiene automatizaciones de procesos de negocio sobre las herramientas que el cliente ya utiliza. El alcance de cada proyecto queda definido por escrito antes de comenzar, junto con el precio y el plazo.",
          ],
        },
        {
          titulo: "Continuidad del servicio",
          parrafos: [
            "Las automatizaciones desarrolladas para un cliente corren mientras el plan mensual esté al día. La mensualidad no es un cobro aparte del derecho a usarlas: es lo que sostiene el monitoreo, el mantenimiento, los cambios y la ejecución de los flujos. Si el cliente cancela el plan o la mora pasa el aviso de suspensión, el servicio se da de baja junto con las automatizaciones activas de ese plan.",
            "Como alternativa a perder el acceso, el cliente puede comprar la automatización de forma independiente por un pago único equivalente a aproximadamente seis meses de la mensualidad correspondiente, para operarla en infraestructura propia sin mantenimiento de la agencia.",
          ],
        },
        {
          titulo: "Pagos y mora",
          parrafos: [
            `Las mensualidades se cobran por SINPE Móvil o transferencia bancaria, según el monto, y se confirman manualmente contra el comprobante enviado por el cliente. El aviso de vencimiento sale ${site.cobro.avisoPrevioDias} días antes; el primer recordatorio de mora, a los ${site.cobro.primerRecordatorioDias} días de vencido; y a los ${site.cobro.avisoSuspensionDias} días de mora sin pago, el servicio se suspende y las automatizaciones activas se dan de baja.`,
            `El precio del plan es el mismo siempre — no sube con el tiempo.`,
            site.pago.ivaIncluido
              ? "Los precios publicados no llevan cargo de impuesto al valor agregado: el prestador del servicio aún no está registrado formalmente como contribuyente ante Tributación, por lo que no corresponde cobrarlo."
              : "Los precios publicados no incluyen el impuesto al valor agregado; se cobra aparte según corresponda.",
          ],
        },
        {
          titulo: "Cancelación",
          parrafos: [
            "El cliente puede cancelar el plan mensual en cualquier momento, con el aviso previo que se defina en el contrato particular. Al cancelar, las automatizaciones activas bajo ese plan dejan de ejecutarse. No se cobra costo de instalación ni puesta en marcha. Los proyectos del catálogo, al ser un pago único por trabajo ya entregado, no son reembolsables.",
          ],
        },
        {
          titulo: "Límites de responsabilidad",
          parrafos: [
            "La agencia no se hace responsable por interrupciones originadas en cambios de las plataformas de terceros conectadas, ni por el uso que el cliente haga de los datos generados por las automatizaciones.",
          ],
        },
      ]}
    />
  );
}

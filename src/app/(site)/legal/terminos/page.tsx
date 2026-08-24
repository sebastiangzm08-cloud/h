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
      actualizado="borrador, sin publicar"
      secciones={[
        {
          titulo: "Alcance del servicio",
          parrafos: [
            "El estudio diseña, implementa y mantiene automatizaciones de procesos de negocio sobre las herramientas que el cliente ya utiliza. El alcance de cada proyecto queda definido por escrito antes de comenzar, junto con el precio y el plazo.",
          ],
        },
        {
          titulo: "Propiedad de las automatizaciones",
          parrafos: [
            "Las automatizaciones desarrolladas para un cliente le pertenecen. Si el cliente decide dejar de trabajar con el estudio, se le entregan exportadas y documentadas. La mensualidad cubre el monitoreo, el mantenimiento y los cambios, no el derecho de uso.",
          ],
        },
        {
          titulo: "Pagos y mora",
          parrafos: [
            `Las mensualidades se cobran por SINPE Móvil o transferencia bancaria, según el monto, y se confirman manualmente contra el comprobante enviado por el cliente. Definir aquí, antes de publicar: días de gracia tras el vencimiento, y a los cuántos días de mora se suspende el servicio.`,
            `Los precios publicados ${site.pago.ivaIncluido ? "incluyen" : "no incluyen"} el impuesto al valor agregado.`,
          ],
        },
        {
          titulo: "Cancelación",
          parrafos: [
            "El cliente puede cancelar el plan mensual en cualquier momento, con el aviso previo que se defina en el contrato particular. La puesta en marcha, al ser un pago único por el trabajo ya realizado, no es reembolsable salvo lo indicado en la garantía de las primeras horas.",
          ],
        },
        {
          titulo: "Límites de responsabilidad",
          parrafos: [
            "El estudio no se hace responsable por interrupciones originadas en cambios de las plataformas de terceros conectadas, ni por el uso que el cliente haga de los datos generados por las automatizaciones.",
          ],
        },
      ]}
    />
  );
}

import type { Metadata } from "next";
import { paginaMeta } from "@/lib/seo/pagina-meta";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/config/site";

export const metadata: Metadata = paginaMeta({
  titulo: `Acuerdo de nivel de servicio — ${site.nombre}`,
  descripcion:
    "Los tiempos de corrección, el monitoreo, los descuentos por caída y las condiciones de soporte que Hoshizora se compromete a cumplir con el Agente IA.",
  ruta: "/legal/sla",
});

export default function SlaPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Acuerdo de nivel de servicio"
      actualizado="20 de octubre de 2026"
      secciones={[
        {
          titulo: "Monitoreo",
          parrafos: [
            "El Agente IA se monitorea de forma continua. Si algo falla, nos llega una alerta interna en el momento, y el estado de la conexión con tu WhatsApp se ve siempre en tu panel.",
          ],
        },
        {
          titulo: "Horario hábil y canales",
          parrafos: [
            "En este acuerdo, \"hora hábil\" es de lunes a viernes, de 9 a. m. a 5 p. m., sin contar los feriados de Costa Rica.",
            `Para el día a día, el canal es WhatsApp (${site.contacto.whatsappVisible}). Para lo formal (cancelaciones, reclamos o cambios de contrato), el correo ${site.contacto.email}. Una caída total fuera del horario hábil se atiende en cuanto sea posible.`,
          ],
        },
        {
          titulo: "Corrección de errores del agente",
          parrafos: [
            "Si el agente contesta algo equivocado o entiende mal una pregunta común, lo corregimos dentro de 24 horas hábiles desde que nos lo reportás, sin costo.",
            "Si el error viene de información que cargaste o aprobaste vos, te ayudamos a corregirla igual, pero no cuenta como incumplimiento.",
          ],
        },
        {
          titulo: "Descuento por caída",
          parrafos: [
            "Si el servicio pasa más de 24 horas caído, sumadas en el mismo mes, por un error nuestro que está en nuestras manos resolver, te descontamos la parte proporcional en el siguiente cobro.",
          ],
        },
        {
          titulo: "Ventanas de mantenimiento",
          parrafos: [
            "Los cambios de infraestructura que puedan afectar la disponibilidad se avisan con al menos 48 horas de anticipación, salvo emergencias de seguridad.",
          ],
        },
        {
          titulo: "Qué cubre y qué no",
          parrafos: [
            "Cubre: fallas del agente o de nuestra configuración, y los ajustes necesarios cuando un servicio conectado cambia su forma de funcionar.",
            "No cubre: caídas de WhatsApp (Meta), Google o del proveedor de inteligencia artificial; cambios de precios o reglas de Meta; errores en la información que cargó o aprobó el negocio; bloqueos del número por mal uso; ni pausas porque el pago a Meta o la mensualidad están atrasados. Ese tiempo no cuenta para el descuento por caída.",
            "El agente no da diagnósticos, recetas ni indicaciones clínicas: todo lo médico es responsabilidad del negocio.",
            "Los trabajos fuera del plan se cotizan antes, a ₡15 000 por hora, y se pagan por adelantado.",
          ],
        },
      ]}
    />
  );
}

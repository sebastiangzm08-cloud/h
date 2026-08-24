import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Acuerdo de nivel de servicio — ${site.nombre}`,
};

export default function SlaPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Acuerdo de nivel de servicio"
      actualizado="borrador, sin publicar"
      secciones={[
        {
          titulo: "Monitoreo",
          parrafos: [
            "Toda automatización activa se monitorea de forma continua. Ante una falla, se genera una alerta interna y, según el plan, una notificación al cliente antes de que lo note en su operación.",
          ],
        },
        {
          titulo: "Tiempos de respuesta",
          parrafos: [
            "Starter: respuesta por correo dentro de 72 horas hábiles. Growth: respuesta por correo dentro de 24 horas hábiles. Scale: respuesta por WhatsApp dentro del horario laboral (8 horas hábiles).",
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
            "Cubre: fallas del flujo, cambios en las interfaces de terceros conectados, errores de configuración propios. No cubre: caídas de las plataformas de terceros fuera de nuestro control, ni cambios solicitados fuera del alcance contratado (se cotizan aparte, salvo horas incluidas en el plan).",
          ],
        },
      ]}
    />
  );
}

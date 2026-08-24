import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacidad — ${site.nombre}`,
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Política de privacidad"
      actualizado="borrador, sin publicar"
      secciones={[
        {
          titulo: "Qué datos recogemos",
          parrafos: [
            "Datos de contacto que nos das directamente (nombre, correo, teléfono, empresa), datos de las herramientas que conectamos para operar tus automatizaciones, y resúmenes de las ejecuciones de cada flujo para poder mostrarte métricas y diagnosticar fallos.",
            "No almacenamos el contenido completo de tus comunicaciones ni de tus documentos salvo lo estrictamente necesario para que el flujo funcione, y solo durante el tiempo necesario.",
          ],
        },
        {
          titulo: "Dónde se alojan",
          parrafos: [
            `Los datos del sitio y del portal se alojan en proveedores de infraestructura en la nube (subencargados: hosting web, base de datos y correo transaccional). El motor de automatización corre en un servidor propio del estudio.`,
          ],
        },
        {
          titulo: "Con quién los compartimos",
          parrafos: [
            "Con los proveedores necesarios para operar el servicio (hosting, base de datos, correo, facturación electrónica) y únicamente en la medida necesaria. Nunca vendemos datos a terceros.",
          ],
        },
        {
          titulo: "Tus credenciales",
          parrafos: [
            "Los accesos a tus herramientas se gestionan mediante un gestor de contraseñas compartido, con acceso limitado por carpeta. Nunca se guardan en la base de datos del portal ni se solicitan por WhatsApp o correo.",
          ],
        },
        {
          titulo: "Tus derechos",
          parrafos: [
            "Podés solicitar acceso, corrección o eliminación de tus datos personales escribiendo a nuestro correo de contacto. Respondemos dentro de los plazos que marca la normativa de protección de datos de Costa Rica.",
          ],
        },
      ]}
    />
  );
}

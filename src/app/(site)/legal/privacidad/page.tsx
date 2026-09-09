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
      actualizado="8 de septiembre de 2026"
      secciones={[
        {
          titulo: "Responsable del tratamiento",
          parrafos: [
            `El responsable del tratamiento de los datos personales es Sebastián Zúñiga Mora, persona física, con domicilio en ${site.contacto.ubicacion}. Podés contactarlo para cualquier tema de privacidad al correo ${site.contacto.email}.`,
          ],
        },
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
            `Los datos del sitio se alojan en proveedores de infraestructura en la nube (subencargados: hosting web, base de datos y correo transaccional). El motor de automatización corre en un servidor propio de la agencia.`,
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
            "Los accesos a tus herramientas se gestionan mediante un gestor de contraseñas compartido, con acceso limitado por carpeta. Nunca se guardan en una base de datos nuestra ni se solicitan por WhatsApp o correo.",
          ],
        },
        {
          titulo: "Cookies",
          parrafos: [
            "Este sitio solo usa cookies estrictamente necesarias: la que mantiene tu sesión iniciada dentro del panel de cliente. No usamos cookies de publicidad, de redes sociales ni de análisis de terceros, así que no hace falta un aviso de consentimiento. Si en el futuro sumamos herramientas de medición, se pedirá tu consentimiento antes de activarlas.",
          ],
        },
        {
          titulo: "Tus derechos",
          parrafos: [
            "Podés solicitar acceso, corrección o eliminación de tus datos personales escribiendo a nuestro correo de contacto. Respondemos dentro de los plazos que marca la Ley 8968 de Protección de la Persona frente al tratamiento de sus datos personales de Costa Rica. Si considerás que tu solicitud no se resolvió como corresponde, podés acudir a la Agencia de Protección de Datos de los Habitantes (PRODHAB).",
          ],
        },
      ]}
    />
  );
}

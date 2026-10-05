/* ==========================================================================
   Ajustes de la cuenta de acceso.

   Es la CUENTA (correo, contraseña), no el negocio: los datos del negocio
   viven en su propia pantalla. Cambiar la contraseña funciona de verdad
   acá mismo, sin correo.
   ========================================================================== */
import Link from "next/link";
import { BTN_SECUNDARIO } from "@/components/panel/configuracion/estilos";
import { FilaDato, Filas, Seccion } from "@/components/panel/configuracion/seccion";
import { PageHead } from "@/components/panel/ui";
import { getCorreoSesion, getPerfil } from "@/lib/panel/datos";
import { CambiarClave } from "./cambiar-clave";

export default async function AjustesPage() {
  const [perfil, correo] = await Promise.all([getPerfil(), getCorreoSesion()]);

  return (
    <>
      <PageHead
        titulo="Ajustes"
        descripcion="Tu cuenta de acceso. Los datos de tu negocio están en su propia pantalla."
      />

      <div className="grid gap-[18px] lg:grid-cols-2 lg:items-start">
        <Seccion eyebrow="Cuenta" titulo="Quién sos acá" descripcion="Con estos datos entrás al panel.">
          <Filas>
            <FilaDato k="Nombre">{perfil.nombre}</FilaDato>
            {/* `break-all`: un correo largo no tiene dónde cortar y, sin esto,
                empujaba la caja más allá del ancho del celular. */}
            <FilaDato k="Correo de acceso" mono>
              <span className="break-all">{correo || "—"}</span>
            </FilaDato>
            <FilaDato k="Rol">{perfil.rol === "admin" ? "Administración" : "Cliente"}</FilaDato>
          </Filas>
          <p className="mt-3.5 text-[11.5px] leading-snug text-ink-mute">
            El nombre y el correo se cambian desde{" "}
            <Link href="/panel/soporte" className="underline underline-offset-2 hover:text-ink-mute">
              Soporte
            </Link>
            .
          </p>
        </Seccion>

        <Seccion
          eyebrow="Seguridad"
          titulo="Contraseña"
          descripcion="Se cambia acá mismo, sin correo de por medio."
        >
          <CambiarClave />
        </Seccion>
      </div>

      <Seccion
        eyebrow="Sesión"
        titulo="Cerrar sesión"
        descripcion="Cerrar sesión la cierra en todos tus dispositivos, no solo en este."
      >
        {/* `<form method="post">`, no un `<Link>`: `/panel/salir` sólo acepta
            POST, así que un enlace (GET) daba 405 y no cerraba nada. */}
        <form action="/panel/salir" method="post">
          <button type="submit" className={BTN_SECUNDARIO}>
            Cerrar sesión
          </button>
        </form>
      </Seccion>
    </>
  );
}

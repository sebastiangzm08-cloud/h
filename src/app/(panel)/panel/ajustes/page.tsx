/* ==========================================================================
   Ajustes de la cuenta de acceso.

   Es la CUENTA (correo, contraseña), no el negocio: los datos del negocio
   viven en su propia pantalla. Cambiar la contraseña funciona de verdad
   acá mismo, sin correo.
   ========================================================================== */
import Link from "next/link";
import { Caja, CajaHead, PageHead } from "@/components/panel/ui";
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

      <div className="grid gap-[18px] lg:grid-cols-2">
        <Caja>
          <CajaHead eyebrow="Cuenta" titulo="Quién sos acá" />
          <dl className="text-[13px]">
            <div className="flex justify-between gap-3 border-b border-line py-2.5">
              <dt className="text-ink-mute">Nombre</dt>
              <dd className="text-right text-ink-soft">{perfil.nombre}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-line py-2.5">
              <dt className="text-ink-mute">Correo de acceso</dt>
              <dd className="text-right font-mono text-ink-soft">{correo || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3 py-2.5">
              <dt className="text-ink-mute">Rol</dt>
              <dd className="text-right text-ink-soft">
                {perfil.rol === "admin" ? "Administración" : "Cliente"}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-[11.5px] text-ink-faint">
            El nombre y el correo se cambian desde{" "}
            <Link
              href="/panel/soporte"
              className="underline underline-offset-2 hover:text-ink-mute"
            >
              Soporte
            </Link>
            .
          </p>
        </Caja>

        <Caja>
          <CajaHead eyebrow="Seguridad" titulo="Contraseña" />
          <CambiarClave />
        </Caja>
      </div>

      <Caja>
        <CajaHead eyebrow="Sesión" titulo="Cerrar en este dispositivo" />
        <p className="text-[13px] text-ink-faint">
          Cierra tu sesión acá. En otros dispositivos seguís dentro.
        </p>
        <Link
          href="/panel/salir"
          className="mt-3.5 inline-flex h-10 items-center justify-center rounded-full border border-line-strong px-5 text-[13px] text-ink transition-colors hover:bg-surface-2"
        >
          Cerrar sesión
        </Link>
      </Caja>
    </>
  );
}

/* ==========================================================================
   Alta de cliente. El botón que reemplaza al comando: crea la cuenta, la
   ficha del negocio y el perfil de una sola vez.
   ========================================================================== */
import { Caja, CajaHead, Nota, PageHead } from "@/components/panel/ui";
import { AltaGuiada } from "./alta-guiada";

export default function AltaCliente() {
  return (
    <>
      <PageHead
        titulo="Alta de cliente"
        descripcion="Cuenta → WhatsApp → agenda, uno detrás del otro. Cada paso se puede saltar y completar después desde la ficha del cliente."
      />

      <Caja className="max-w-2xl">
        <CajaHead eyebrow="Nuevo cliente" titulo="Alta guiada" />
        <AltaGuiada />
      </Caja>

      <Nota className="max-w-2xl">
        Al crear la cuenta te devuelve el link, correo y contraseña listos para
        pasarle. La contraseña no queda guardada. Para sumarle otra
        automatización más adelante, «Asignar automatización».
      </Nota>
    </>
  );
}

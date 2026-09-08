/* ==========================================================================
   Alta de cliente. El botón que reemplaza al comando: crea la cuenta, la
   ficha del negocio y el perfil de una sola vez.
   ========================================================================== */
import { Caja, CajaHead, Nota, PageHead } from "@/components/panel/ui";
import { FormAlta } from "./form-alta";

export default function AltaCliente() {
  return (
    <>
      <PageHead
        titulo="Alta de cliente"
        descripcion="Crea la cuenta, la ficha y —si la elegís acá— la primera automatización, todo de una."
      />

      <Caja className="max-w-2xl">
        <CajaHead eyebrow="Nuevo cliente" titulo="Datos de la cuenta" />
        <FormAlta />
      </Caja>

      <Nota className="max-w-2xl">
        Al crear la cuenta te devuelve el link, correo y contraseña listos para
        pasarle. La contraseña no queda guardada. Para sumarle otra
        automatización más adelante, «Asignar automatización».
      </Nota>
    </>
  );
}

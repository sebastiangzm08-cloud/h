/* ==========================================================================
   Alta de cliente. El botón que reemplaza al comando: crea la cuenta, la
   ficha del negocio y el perfil de una sola vez, y deja las automatizaciones
   y el WhatsApp encaminados en el mismo recorrido.

   Las automatizaciones del selector salen del catálogo real (`getCatalogoBase`),
   no de una lista escrita a mano, y de ahí también el precio de lista.
   ========================================================================== */
import { Caja, CajaHead, Eyebrow } from "@/components/panel/ui";
import { AdminHead } from "@/components/admin/admin-ui";
import { getCatalogoBase } from "@/lib/panel/datos";
import { AltaGuiada } from "./alta-guiada";

const LO_QUE_PASA = [
  "Se crea la cuenta de acceso, ya confirmada: el cliente entra con su correo y la contraseña que le pongás.",
  "Se crea la ficha del negocio en estado «En prueba» y su perfil en el panel.",
  "Si elegís una automatización, queda asignada y activa al toque.",
  "Te devuelve el link, el correo y la contraseña listos para copiar y pasárselos. La contraseña no queda guardada.",
];

export default async function AltaCliente() {
  const catalogo = await getCatalogoBase();
  const automatizaciones = catalogo.map((a) => ({
    slug: a.slug,
    nombre: a.nombre,
    precio: a.precioMensual,
  }));

  return (
    <>
      <AdminHead
        titulo="Alta de cliente"
        descripcion="Cuenta → WhatsApp → agenda, uno detrás del otro. Cada paso se puede saltar y completar después desde la ficha del cliente."
      />

      <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,680px)_minmax(0,1fr)]">
        <Caja>
          <CajaHead eyebrow="Nuevo cliente" titulo="Alta guiada" />
          <AltaGuiada automatizaciones={automatizaciones} />
        </Caja>

        <Caja className="bg-surface">
          <Eyebrow>Qué pasa al dar de alta</Eyebrow>
          <ol className="mt-3.5 flex flex-col gap-3.5">
            {LO_QUE_PASA.map((texto, i) => (
              <li key={texto} className="flex gap-3 text-[12.5px] leading-snug text-ink-mute">
                <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-surface-3 font-mono text-[10.5px] text-ink-soft">
                  {i + 1}
                </span>
                <span>{texto}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-line pt-3.5 text-[12px] leading-snug text-ink-faint">
            Para sumarle otra automatización más adelante, usá «Asignar automatización».
          </p>
        </Caja>
      </div>
    </>
  );
}

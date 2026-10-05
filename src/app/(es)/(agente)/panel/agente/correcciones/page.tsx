import Link from "next/link";
import { Cabecera, Cuerpo, AvisoEjemplo } from "@/components/panel/agente-ui";
import { FormaEnsenar } from "@/components/panel/agente-ensenar";
import { BTN_SECUNDARIO } from "@/components/panel/configuracion/estilos";
import { EstadoVacio, Seccion } from "@/components/panel/configuracion/seccion";
import { Chip } from "@/components/panel/ui";
import { enModoEjemplo, getCorrecciones, relativa } from "@/lib/panel/agente";

/* ==========================================================================
   El bucle que hace que el producto mejore solo.

   Cuando el agente no sabe algo, la pregunta cae acá en vez de perderse en
   una conversación. El dueño la contesta UNA vez y pasa a `wa_conocimiento`.
   Es, además, el mejor argumento de retención que tiene el producto: cada mes
   el agente sabe más, y el dueño lo ve.
   ========================================================================== */
export default async function CorreccionesPage() {
  const [correcciones, ejemplo] = await Promise.all([getCorrecciones(), enModoEjemplo()]);
  const n = correcciones.length;

  return (
    <>
      <Cabecera
        eyebrow="El agente"
        titulo="Correcciones"
        descripcion="Cada vez que el agente no supo algo, la pregunta queda acá. Contestala una vez y pasa a ser parte de lo que sabe — no lo vuelve a preguntar."
      />
      <AvisoEjemplo visible={ejemplo} />

      <Cuerpo>
        <Seccion
          id="pendientes"
          eyebrow="Para enseñarle"
          titulo={
            <>
              Pendientes de enseñarle
              <span className="ml-2 font-mono text-[11px] font-normal text-ink-mute tabular-nums">{n}</span>
            </>
          }
          descripcion={
            n === 1 ? "1 pregunta sin respuesta." : `${n} preguntas sin respuesta.`
          }
          sinRelleno
        >
          {n === 0 ? (
            <div className="px-4 sm:px-[18px]">
              <EstadoVacio
                icono="mensajes"
                titulo="Nada pendiente"
                accion={
                  <Link href="/panel/agente/conversaciones" className={BTN_SECUNDARIO}>
                    Ver conversaciones
                  </Link>
                }
              >
                No hay preguntas sin respuesta por ahora. Cuando el agente no sepa algo, la pregunta aparece acá para que se la enseñes.
              </EstadoVacio>
            </div>
          ) : (
            <ul className="divide-y divide-line border-t border-line">
              {correcciones.map((c) => (
                <li key={c.id} className="px-4 py-4 sm:px-[18px]">
                  <p className="text-[14px] leading-snug font-medium break-words text-ink">{c.pregunta}</p>
                  <p className="mt-1.5 mb-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[12px] text-ink-mute">
                    {c.deQuien ? <span>{c.deQuien}</span> : null}
                    <span className="font-mono text-[11px]">{relativa(c.creadaEn)}</span>
                    {c.veces > 1 ? <Chip>Preguntada {c.veces} veces</Chip> : null}
                  </p>
                  <FormaEnsenar correccionId={c.id} pregunta={c.pregunta} />
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      </Cuerpo>
    </>
  );
}

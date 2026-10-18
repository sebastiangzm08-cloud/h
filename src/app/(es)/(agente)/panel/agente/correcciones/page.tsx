import Link from "next/link";
import { Cabecera, Cuerpo, AvisoEjemplo } from "@/components/panel/agente-ui";
import { FormaEnsenar } from "@/components/panel/agente-ensenar";
import { BTN_SECUNDARIO } from "@/components/panel/configuracion/estilos";
import { EstadoVacio, Seccion } from "@/components/panel/configuracion/seccion";
import { Chip } from "@/components/panel/ui";
import { enModoEjemplo, getAprendido, getCorrecciones, relativa } from "@/lib/panel/agente";

/* ==========================================================================
   El bucle que hace que el producto mejore solo.

   Cuando el agente no sabe algo, la pregunta cae acá en vez de perderse en
   una conversación. El dueño la contesta UNA vez y pasa a `wa_conocimiento`.
   Es, además, el mejor argumento de retención que tiene el producto: cada mes
   el agente sabe más, y el dueño lo ve.
   ========================================================================== */
export default async function CorreccionesPage() {
  const [correcciones, aprendido, ejemplo] = await Promise.all([getCorrecciones(), getAprendido(), enModoEjemplo()]);
  const n = correcciones.length;

  return (
    <>
      <Cabecera
        eyebrow="El agente"
        titulo="Correcciones"
        descripcion="Cada vez que el agente no supo algo, la pregunta queda acá. Contestala una vez y pasa a ser parte de lo que sabe — no lo vuelve a preguntar."
      />
      <AvisoEjemplo visible={ejemplo} />

      <Cuerpo className="flex flex-col gap-[18px]">
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

        {/* Lo que ya aprendió: la prueba visible de que el agente mejora cada
            mes. Cada respuesta quedó como un dato en Conocimiento (ahí se
            edita o se apaga) y el agente la usa en cada conversación. */}
        <Seccion
          id="aprendido"
          eyebrow="Ya lo sabe"
          titulo={
            <>
              Lo que ya aprendió
              <span className="ml-2 font-mono text-[11px] font-normal text-ink-mute tabular-nums">{aprendido.length}</span>
            </>
          }
          descripcion="Lo que le enseñaste. Lo usa en cada conversación, aunque se lo pregunten con otras palabras."
          accion={
            aprendido.length ? (
              <Link href="/panel/agente/que-sabe#datos" className={BTN_SECUNDARIO}>
                Editar en Conocimiento
              </Link>
            ) : null
          }
          sinRelleno
        >
          {aprendido.length === 0 ? (
            <p className="border-t border-line px-4 py-4 text-[13px] leading-snug text-ink-mute sm:px-[18px]">
              Todavía no le enseñaste nada. Cuando contestés una pregunta de arriba, aparece acá.
            </p>
          ) : (
            <ul className="scroll-fino max-h-[32rem] divide-y divide-line overflow-y-auto overscroll-contain border-t border-line">
              {aprendido.map((a) => (
                <li key={a.id} className="px-4 py-4 sm:px-[18px]">
                  <p className="flex items-start gap-2 text-[14px] leading-snug font-medium break-words text-ink">
                    <span aria-hidden="true" className="mt-0.5 text-ok">
                      ✓
                    </span>
                    {a.pregunta}
                  </p>
                  <p className="mt-1.5 pl-5 text-[13px] leading-relaxed break-words whitespace-pre-line text-ink-soft">
                    {a.respuesta}
                  </p>
                  <p className="mt-2 pl-5 font-mono text-[11px] text-ink-mute">Aprendido {relativa(a.respondidaEn)}</p>
                </li>
              ))}
            </ul>
          )}
        </Seccion>
      </Cuerpo>
    </>
  );
}

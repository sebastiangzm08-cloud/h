import { Cabecera, Cuerpo, Bloque, AvisoEjemplo, Vacio } from "@/components/panel/agente-ui";
import { FormaEnsenar } from "@/components/panel/agente-ensenar";
import { enModoEjemplo, getCorrecciones, relativa } from "@/lib/panel/agente";

/* ==========================================================================
   El bucle que hace que el producto mejore solo.

   Cuando el agente no sabe algo, la pregunta cae acá en vez de perderse en
   una conversación. El dueño la contesta UNA vez y pasa a `wa_conocimiento`.
   Es, además, el mejor argumento de retención que tiene el producto: cada mes
   el agente sabe más, y el dueño lo ve.

   Guardar todavía no está enganchado (necesita el server action + n8n). El
   formulario se dibuja desactivado y lo dice.
   ========================================================================== */
export default async function CorreccionesPage() {
  const [correcciones, ejemplo] = await Promise.all([getCorrecciones(), enModoEjemplo()]);

  return (
    <>
      <Cabecera
        eyebrow="El agente"
        titulo="Correcciones"
        descripcion="Cada vez que el agente no supo algo, la pregunta queda acá. Contestala una vez y pasa a ser parte de lo que sabe — no lo vuelve a preguntar."
      />
      <AvisoEjemplo visible={ejemplo} />

      <Cuerpo>
        <Bloque
          titulo="Pendientes de enseñarle"
          sub={
            correcciones.length === 1
              ? "1 pregunta sin respuesta"
              : `${correcciones.length} preguntas sin respuesta`
          }
        >
          {correcciones.length === 0 ? (
            <Vacio>
              Nada pendiente: el agente supo responder todo lo que le preguntaron.
            </Vacio>
          ) : (
            correcciones.map((c) => (
              <div key={c.id} className="border-line p-4 [&+div]:border-t">
                <p className="text-sm text-ink">{c.pregunta}</p>
                <p className="mt-1.5 mb-3 font-mono text-xs text-ink-faint">
                  {c.deQuien ? `${c.deQuien} · ` : ""}
                  {relativa(c.creadaEn)}
                  {c.veces > 1 ? ` · preguntado ${c.veces} veces` : ""}
                </p>
                <FormaEnsenar correccionId={c.id} />
              </div>
            ))
          )}
        </Bloque>
      </Cuerpo>
    </>
  );
}

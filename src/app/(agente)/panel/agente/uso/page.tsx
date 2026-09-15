import { Cabecera, Cuerpo, Bloque, Fila } from "@/components/panel/agente-ui";
import { Medidor, colones, precioMensualTexto } from "@/components/panel/ui";
import { getAsignacion, getCliente } from "@/lib/panel/datos";
import { getContactos, getConversaciones, getCitas, getMensajesAgenteMes } from "@/lib/panel/agente";

/* Topes por defecto mientras la asignación no traiga los suyos. Van acá y no
   en la base para poder ajustarlos sin migración mientras se calibra el
   producto con los primeros clientes.

   OJO con `mensajesMes`: el mismo valor 4000 vive TAMBIÉN como respaldo en
   el nodo "🔢 ¿Cuántos van?" de `agente-whatsapp-BUILDER.mjs` — si se
   cambia acá, cambiarlo allá también para que el panel y la alerta por
   correo hablen del mismo número. */
const TOPES = {
  conversacionesMes: 600,
  audiosMes: 300,
  mensajesMes: 4000,
};

export default async function UsoPage() {
  const [asignacion, cliente, conversaciones, contactos, citas, mensajesMes] = await Promise.all([
    getAsignacion("agente-whatsapp"),
    getCliente(),
    getConversaciones(),
    getContactos(),
    getCitas(),
    getMensajesAgenteMes(),
  ]);

  const topeConv = asignacion?.limites?.conversacionesMes ?? TOPES.conversacionesMes;
  const topeAudio = asignacion?.limites?.audiosMes ?? TOPES.audiosMes;
  const topeMensajes = asignacion?.limites?.mensajesMes ?? TOPES.mensajesMes;

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const delMes = conversaciones.filter((c) => new Date(c.ultimoEn) >= inicioMes).length;

  return (
    <>
      <Cabecera
        eyebrow="Ajustes"
        titulo="Uso y límites"
        descripcion="Lo que llevás consumido este mes. Si te quedás corto, se amplía sin cambiar de plan — avisanos y listo."
      />

      <Cuerpo className="flex flex-col gap-4">
        <div className="grid gap-5 rounded-xl border border-line bg-surface px-4 py-5 sm:grid-cols-2 lg:grid-cols-3">
          <Medidor etiqueta="Conversaciones del mes" usado={delMes} tope={topeConv} formato="miles" />
          <Medidor etiqueta="Notas de voz transcritas" usado={0} tope={topeAudio} formato="miles" />
          <Medidor etiqueta="Respuestas del agente" usado={mensajesMes} tope={topeMensajes} formato="miles" />
        </div>
        <p className="text-[11.5px] text-ink-faint">
          "Respuestas del agente" es lo que de verdad mueve el costo de IA —
          una sola conversación puede tener varias.
        </p>

        <Bloque titulo="Sin tope" sub="No se cobran aparte ni se limitan">
          <Fila k="Contactos guardados" v={String(contactos.length)} />
          <Fila k="Citas agendadas" v={String(citas.length)} />
        </Bloque>

        <Bloque titulo="Tu plan" sub={`${cliente.plan} · incluye el Agente de WhatsApp`}>
          <Fila
            k="Mensualidad de esta automatización"
            v={precioMensualTexto(asignacion?.precioMensual ?? null)}
          />
          <Fila
            k="Próximo cobro"
            v={cliente.proximoCobro || "—"}
          />
          <Fila k="Mensajes de WhatsApp (Meta)" v="Se cobran a tu cuenta de Meta" />
        </Bloque>

        <p className="rounded-xl border border-dashed border-line-strong bg-surface px-4 py-3 text-[12.5px] text-ink-faint">
          El consumo de notas de voz empieza a contarse cuando el número esté conectado y
          el agente reciba el primer audio. La mensualidad que ves es{" "}
          {asignacion ? colones(asignacion.precioMensual) : "la de tu plan"}.
        </p>
      </Cuerpo>
    </>
  );
}

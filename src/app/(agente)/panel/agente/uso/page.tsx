import Link from "next/link";
import { Cabecera, Cuerpo } from "@/components/panel/agente-ui";
import { FilaDato, Filas, Seccion } from "@/components/panel/configuracion/seccion";
import { Medidor, precioMensualTexto } from "@/components/panel/ui";
import { getAsignacion, getCliente } from "@/lib/panel/datos";
import {
  enModoEjemplo,
  getCitas,
  getContactos,
  getConversaciones,
  getMensajesAgenteMes,
} from "@/lib/panel/agente";
import { supabaseServidor } from "@/lib/supabase/servidor";

type UsoMes = {
  conversaciones: number | null;
  audios: number | null;
  contactos: number | null;
  citas: number | null;
};

/**
 * Cuentas EXACTAS (cabecera `count`, sin traer filas). Antes las cifras
 * salían de contar las listas de pantalla: conversaciones abiertas con tope de
 * 80, contactos con tope de 300 y citas con tope de 100, y las notas de voz
 * eran un 0 fijo. Si una cuenta falla, queda en `null` y la pantalla muestra
 * "—" en vez de un cero que parece real.
 */
async function leerUso(clienteId: string, ejemplo: boolean): Promise<UsoMes> {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  if (ejemplo) {
    /* Sin las tablas del agente todavía: se cuenta sobre los datos de ejemplo
       que ya muestra el resto de las pantallas. */
    const [conversaciones, contactos, citas] = await Promise.all([
      getConversaciones(),
      getContactos(),
      getCitas(),
    ]);
    return {
      conversaciones: conversaciones.filter((c) => new Date(c.ultimoEn) >= inicioMes).length,
      audios: 0,
      contactos: contactos.length,
      citas: citas.length,
    };
  }

  const sb = await supabaseServidor();
  const desde = inicioMes.toISOString();
  const [conv, audios, contactos, citas] = await Promise.all([
    sb
      .from("wa_conversaciones")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", clienteId)
      .gte("ultimo_en", desde),
    sb
      .from("wa_mensajes")
      .select("id", { count: "exact", head: true })
      .eq("cliente_id", clienteId)
      .eq("autor", "contacto")
      .eq("tipo", "audio")
      .gte("creado_en", desde),
    sb.from("wa_contactos").select("id", { count: "exact", head: true }).eq("cliente_id", clienteId),
    sb.from("wa_citas").select("id", { count: "exact", head: true }).eq("cliente_id", clienteId),
  ]);

  const cuenta = (r: { count: number | null; error: unknown }) => (r.error ? null : (r.count ?? 0));
  return {
    conversaciones: cuenta(conv),
    audios: cuenta(audios),
    contactos: cuenta(contactos),
    citas: cuenta(citas),
  };
}

const numero = (n: number) => n.toLocaleString("es-CR");

function MedidorUso({
  etiqueta,
  usado,
  tope,
}: {
  etiqueta: string;
  usado: number | null;
  /** Solo el límite real de la asignación; sin él no se inventa uno. */
  tope: number | null;
}) {
  if (usado === null) {
    return (
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-ink-mute">{etiqueta}</span>
          <span className="font-mono text-xs text-ink-mute">— / {tope === null ? "—" : numero(tope)}</span>
        </div>
        <p className="mt-1.5 text-[11.5px] text-ink-mute">No se pudo leer ahora. Probá de nuevo en un momento.</p>
      </div>
    );
  }
  if (tope === null) {
    return (
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-ink-mute">{etiqueta}</span>
          <span className="font-mono text-xs text-ink-soft tabular-nums">{numero(usado)}</span>
        </div>
        <p className="mt-1.5 text-[11.5px] text-ink-mute">Sin tope definido para tu plan.</p>
      </div>
    );
  }
  return <Medidor etiqueta={etiqueta} usado={usado} tope={tope} formato="miles" />;
}

export default async function UsoPage() {
  const [asignacion, cliente, ejemplo, mensajesMes] = await Promise.all([
    getAsignacion("agente-whatsapp"),
    getCliente(),
    enModoEjemplo(),
    getMensajesAgenteMes(),
  ]);
  const uso = await leerUso(cliente.id, ejemplo);

  const topeConv = asignacion?.limites?.conversacionesMes ?? null;
  const topeAudio = asignacion?.limites?.audiosMes ?? null;
  const topeMensajes = asignacion?.limites?.mensajesMes ?? null;

  return (
    <>
      <Cabecera
        eyebrow="El agente"
        titulo="Uso y límites"
        descripcion="Lo que llevás consumido este mes. Si te quedás corto, se amplía sin cambiar de plan — avisanos y listo."
      />

      <Cuerpo className="flex flex-col gap-[18px]">
        <Seccion
          id="consumo"
          eyebrow="Este mes"
          titulo="Consumo del mes"
          descripcion="Se cuenta desde el día 1 de cada mes. Las barras se ponen ámbar al llegar al 80 % del límite."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <MedidorUso etiqueta="Conversaciones del mes" usado={uso.conversaciones} tope={topeConv} />
            <MedidorUso etiqueta="Notas de voz recibidas" usado={uso.audios} tope={topeAudio} />
            <MedidorUso etiqueta="Respuestas del agente" usado={mensajesMes} tope={topeMensajes} />
          </div>
          <p className="mt-4 text-[11.5px] leading-snug text-ink-mute">
            &ldquo;Respuestas del agente&rdquo; es lo que de verdad mueve el costo de IA: una sola conversación puede
            tener varias.
          </p>
        </Seccion>

        <div className="grid items-start gap-[18px] lg:grid-cols-2">
          <Seccion
            id="sin-tope"
            eyebrow="Sin límite"
            titulo="Sin tope"
            descripcion="No se cobran aparte ni se limitan."
          >
            <Filas>
              <FilaDato k="Contactos guardados" mono>
                {uso.contactos === null ? "—" : numero(uso.contactos)}
              </FilaDato>
              <FilaDato k="Citas agendadas, en total" mono>
                {uso.citas === null ? "—" : numero(uso.citas)}
              </FilaDato>
            </Filas>
          </Seccion>

          <Seccion
            id="plan"
            eyebrow="Plan"
            titulo="Tu plan"
            descripcion={`${cliente.plan} · incluye el Agente de WhatsApp`}
            accion={
              <Link
                href="/panel/facturacion"
                className="inline-flex min-h-11 items-center px-1 text-[12.5px] font-medium text-[color:var(--panel-acento-texto)] hover:opacity-80"
              >
                Ver facturación
              </Link>
            }
          >
            <Filas>
              <FilaDato k="Mensualidad de esta automatización" mono>
                {precioMensualTexto(asignacion?.precioMensual ?? null)}
              </FilaDato>
              <FilaDato k="Próximo cobro" mono>
                {cliente.proximoCobro || "—"}
              </FilaDato>
              <FilaDato k="Mensajes de WhatsApp (Meta)">
                Meta cobra cada mensaje de WhatsApp según su tarifa; te confirmamos cómo se factura.
              </FilaDato>
            </Filas>
          </Seccion>
        </div>
      </Cuerpo>
    </>
  );
}

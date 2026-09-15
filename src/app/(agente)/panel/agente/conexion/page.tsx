import Link from "next/link";
import { Cabecera, Cuerpo, Bloque, Fila, EstadoPill } from "@/components/panel/agente-ui";
import { FormaPerfilWhatsapp } from "@/components/panel/agente-perfil-whatsapp";
import { getAsignacion, getCliente, getConexiones } from "@/lib/panel/datos";
import { getPerfilWhatsapp, getSaludConexion } from "@/lib/panel/agente";

export default async function ConexionPage() {
  const [cliente, conexiones, asignacion, salud, perfilWhatsapp] = await Promise.all([
    getCliente(),
    getConexiones(),
    getAsignacion("agente-whatsapp"),
    getSaludConexion(),
    getPerfilWhatsapp(),
  ]);

  const wa = conexiones.find((c) => c.servicio === "whatsapp");
  const conectada = wa?.estado === "conectada";

  return (
    <>
      <Cabecera
        eyebrow="Ajustes"
        titulo="Conexión"
        descripcion="El número de WhatsApp del negocio, conectado por la API oficial de Meta. El número es tuyo: si algún día te vas, te lo llevás."
      />

      <Cuerpo className="flex flex-col gap-4">
        <Bloque
          titulo="WhatsApp Business"
          sub={conectada ? "Recibiendo mensajes" : "Todavía sin conectar"}
          accion={
            <EstadoPill tono={conectada ? "cliente" : "neutro"}>
              {conectada ? "Conectada" : "Sin conectar"}
            </EstadoPill>
          }
        >
          <Fila k="Número" v={cliente.whatsapp || "Sin definir"} />
          <Fila k="Nombre que ve la gente" v={cliente.nombreNegocio} />
          <Fila k="Estado del agente" v={asignacion?.estado === "activa" ? "Activo" : "En pausa"} />
          <Fila k="Quién paga los mensajes a Meta" v="La cuenta del negocio" />
        </Bloque>

        {conectada ? (
          <div
            className={`rounded-xl border px-4 py-4 ${
              salud.estado === "ok"
                ? "border-ok/30 bg-ok/[0.06]"
                : "border-bad/35 bg-bad/[0.07]"
            }`}
          >
            {salud.estado === "ok" ? (
              <>
                <p className="flex items-center gap-2 text-[13px] font-medium text-ok">
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-ok" />
                  Meta confirma que el número está conectado ahora mismo
                </p>
                <p className="mt-1.5 max-w-[62ch] text-[12.5px] text-ink-mute">
                  {salud.numero ? `${salud.numero} · ` : ""}
                  Calidad {salud.calidad ?? "sin datos"}. Este chequeo se hace en vivo cada vez que entrás
                  a esta pantalla, no solo mira lo que hay guardado.
                </p>
              </>
            ) : (
              <>
                <p className="flex items-center gap-2 text-[13px] font-medium text-bad">
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-bad" />
                  El WhatsApp se desconectó — el agente no puede contestar
                </p>
                <p className="mt-1.5 max-w-[62ch] text-[12.5px] text-ink-mute">
                  Meta respondió:{" "}
                  <span className="font-mono text-[11.5px]">
                    {salud.estado === "token_vencido" ? salud.detalle : "sin conexión configurada"}
                  </span>
                  . Casi siempre es el token vencido — escribinos para renovarlo.
                </p>
                <Link
                  href="/panel/soporte"
                  className="mt-3 inline-block rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft"
                >
                  Avisar que se desconectó
                </Link>
              </>
            )}
          </div>
        ) : null}

        {conectada ? (
          <Bloque titulo="Perfil de WhatsApp" sub="La foto, la info y los datos que ve la gente al abrir el chat">
            <FormaPerfilWhatsapp perfil={perfilWhatsapp} />
          </Bloque>
        ) : null}

        {!conectada ? (
          <div className="rounded-xl border border-line bg-surface px-4 py-4">
            <h3 className="text-[13px] font-medium text-ink">Falta conectar el número</h3>
            <p className="mt-1.5 max-w-[62ch] text-[13px] text-ink-mute">
              La conexión con Meta la hacemos nosotros con vos: hay que verificar el número,
              poner el nombre que va a ver la gente y dejar la cuenta de Meta a nombre del
              negocio. Escribinos y lo coordinamos.
            </p>
            <Link
              href="/panel/soporte"
              className="mt-3.5 inline-block rounded-lg bg-ink px-3.5 py-2 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft"
            >
              Escribirnos
            </Link>
          </div>
        ) : null}
      </Cuerpo>
    </>
  );
}

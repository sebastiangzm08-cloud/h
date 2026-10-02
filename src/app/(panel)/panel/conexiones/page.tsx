/* ==========================================================================
   Conexiones.

   Una tarjeta por servicio que pide alguna automatización contratada. Se
   cruza lo que el catálogo EXIGE con lo que ya está conectado, así nunca
   falta ni sobra.

   El botón "Conectar" arranca el OAuth de cada servicio. Ese flujo se
   engancha con n8n y va con Sebastian presente — hoy el botón lleva a
   pedirlo por WhatsApp.
   ========================================================================== */
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { BTN_PRIMARIO, BTN_SECUNDARIO } from "@/components/panel/configuracion/estilos";
import { EstadoVacio } from "@/components/panel/configuracion/seccion";
import { Eyebrow, PageHead, Pill } from "@/components/panel/ui";
import { ConectarBuffer } from "@/components/panel/conectar-buffer";
import { getConexionBuffer, getConexiones } from "@/lib/panel/datos";
import type { EstadoConexion } from "@/lib/panel/tipos";
import { waLink } from "@/config/site";
import { cn } from "@/lib/utils";

const ICONO: Record<string, NombreIcono> = {
  instagram: "imagen",
  facebook: "imagen",
  whatsapp: "mensajes",
  tiktok: "imagen",
  google: "conexiones",
};

const ESTADO: Record<
  EstadoConexion,
  { texto: string; tono: "ok" | "warn" | "bad" | "idle" }
> = {
  conectada: { texto: "Conectada", tono: "ok" },
  sin_conectar: { texto: "Sin conectar", tono: "idle" },
  vencida: { texto: "Permiso vencido", tono: "warn" },
  error: { texto: "Con error", tono: "bad" },
};

/* Instagram / Facebook / TikTok se conectan TODOS a través de Buffer
   (una sola tarjeta arriba). No van como tarjetas sueltas. */
const VIA_BUFFER = ["instagram", "facebook", "tiktok"];

export default async function ConexionesPage() {
  const [conexiones, buffer] = await Promise.all([
    getConexiones(),
    getConexionBuffer(),
  ]);
  const necesitaRedes = conexiones.some((c) => VIA_BUFFER.includes(c.servicio));
  const otras = conexiones.filter((c) => !VIA_BUFFER.includes(c.servicio));

  const faltan =
    (necesitaRedes && buffer.estado !== "listo" ? 1 : 0) +
    otras.filter((c) => c.estado !== "conectada").length;

  return (
    <>
      <PageHead
        titulo="Integraciones"
        sub={faltan === 0 ? "Todo conectado" : `${faltan} por conectar`}
        descripcion="Los servicios que tus automatizaciones necesitan enchufados para trabajar."
      />

      {necesitaRedes ? (
        <ConectarBuffer estado={buffer.estado} referencia={buffer.referencia} />
      ) : null}

      {!necesitaRedes && otras.length === 0 ? (
        <EstadoVacio icono="conexiones" titulo="Nada que conectar">
          Ninguna de tus automatizaciones necesita conexiones externas.
        </EstadoVacio>
      ) : otras.length > 0 ? (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {otras.map((c) => {
            const e = ESTADO[c.estado];
            return (
              <div
                key={c.servicio}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-4 sm:p-[18px]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-surface-3 text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
                    <Icono nombre={ICONO[c.servicio] ?? "conexiones"} className="h-[18px] w-[18px]" />
                  </span>
                  <Pill tono={e.tono}>{e.texto}</Pill>
                </div>

                <div>
                  <h2 className="text-[14px] font-semibold text-ink">{c.nombre}</h2>
                  <p className="mt-0.5 text-[12px] text-ink-mute">Para {c.paraQue}</p>
                </div>

                {c.referencia ? (
                  <div className="text-[12px] text-ink-mute">
                    <Eyebrow>Cuenta</Eyebrow>
                    <span className="mt-0.5 block font-mono break-all text-ink-soft">{c.referencia}</span>
                  </div>
                ) : null}

                {c.venceEn ? <p className="text-[11.5px] text-warn">Vence el {c.venceEn}</p> : null}

                <a
                  href={waLink(`Hola, quiero conectar ${c.nombre} en el panel (para ${c.paraQue}).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(c.estado === "conectada" ? BTN_SECUNDARIO : BTN_PRIMARIO, "mt-auto w-full sm:w-auto sm:self-start")}
                >
                  {c.estado === "conectada" ? "Reconectar" : "Conectar"}
                </a>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

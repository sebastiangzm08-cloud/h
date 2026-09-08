/* ==========================================================================
   Galería de piezas de contenido.

   Cada foto/video que el cliente subió, con el estado en que va. n8n mueve
   el estado a medida que trabaja (en fila → mejorándose → programada →
   publicada). El antes/después de la mejora con kie.ai queda para cuando el
   workflow escriba el resultado de vuelta — por ahora se ve el original.
   ========================================================================== */
import { Caja, CajaHead, Pill } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import { CancelarPieza } from "@/components/panel/cancelar-pieza";
import type { EstadoPieza, Pieza } from "@/lib/panel/tipos";

const ESTADO: Record<
  EstadoPieza,
  { texto: string; tono: "ok" | "warn" | "bad" | "idle" }
> = {
  pendiente: { texto: "En fila", tono: "idle" },
  en_retoque: { texto: "Mejorándose", tono: "warn" },
  programada: { texto: "Programada", tono: "idle" },
  publicada: { texto: "Publicada", tono: "ok" },
  fallida: { texto: "Falló", tono: "bad" },
  cancelada: { texto: "Cancelada", tono: "idle" },
};

const NOMBRE_RED: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

/** Miniatura cuadrada servida por ImageKit, sin traer el archivo entero. */
function miniatura(url: string): string {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}tr=w-480,h-480,c-maintain_ratio,fo-auto,q-80`;
}

export function GaleriaPiezas({ piezas }: { piezas: Pieza[] }) {
  return (
    <Caja>
      <CajaHead
        eyebrow="Tus piezas"
        titulo={`Contenido subido · ${piezas.length}`}
      />

      {piezas.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-ink-faint">
          Todavía no subiste nada. Lo que cargues arriba aparece acá con su
          estado.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {piezas.map((p) => {
            const e = ESTADO[p.estado];
            return (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface-2"
              >
                <div className="relative aspect-square bg-surface-3">
                  {p.tipo === "imagen" && p.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={miniatura(p.url)}
                      alt={p.instruccion || "Pieza de contenido"}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-ink-faint">
                      <Icono
                        nombre={p.tipo === "video" ? "reporte" : "imagen"}
                        className="h-6 w-6"
                      />
                    </span>
                  )}
                  <span className="absolute top-1.5 left-1.5">
                    <Pill tono={e.tono}>{e.texto}</Pill>
                  </span>
                  {p.esCarrusel ? (
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-ink/80 px-1.5 py-px font-mono text-[9.5px] font-medium text-paper backdrop-blur-sm">
                      ▦ {p.cantidadImagenes}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                  {p.instruccion ? (
                    <p className="line-clamp-2 text-[11.5px] leading-snug text-ink-soft">
                      {p.instruccion}
                    </p>
                  ) : (
                    <p className="text-[11.5px] text-ink-faint">Sin instrucción</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                    <span className="font-mono text-[10px] text-ink-faint">
                      {p.programadaPara ? `→ ${p.programadaPara}` : p.cuando}
                    </span>
                    {p.redes.length > 0 ? (
                      <span className="font-mono text-[10px] text-ink-faint">
                        {p.redes
                          .map((r) => NOMBRE_RED[r] ?? r)
                          .join(" · ")}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex justify-end">
                    <CancelarPieza piezaId={p.id} estado={p.estado} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Caja>
  );
}

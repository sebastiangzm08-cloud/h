import { existsSync } from "node:fs";
import { join } from "node:path";
import { PlayCircle, FilmSlate } from "@phosphor-icons/react/dist/ssr";

/**
 * Apartado de video del negocio.
 *
 * Misma convención que las demos de la home: poné el archivo en
 * `public/videos/negocio-<slug>.mp4` y el reproductor se activa solo.
 * Mientras no exista, se muestra un estado vacío honesto en vez de un
 * marco roto o un "próximamente" vacío de contenido — la sección igual
 * comunica qué se va a ver ahí.
 */
function hayVideo(slug: string) {
  return existsSync(
    join(process.cwd(), "public", "videos", `negocio-${slug}.mp4`)
  );
}

export function VideoExplicativo({
  slug,
  nombre,
}: {
  slug: string;
  nombre: string;
}) {
  const listo = hayVideo(slug);

  return (
    <section
      data-tema="oscuro"
      className="border-b border-noche-texto/10 bg-noche"
    >
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="eyebrow text-noche-texto/45">En video</p>
            <h2 className="mt-5 text-[1.75rem] leading-[1.1] font-semibold tracking-tight text-noche-texto sm:text-[2.125rem]">
              Mirá el sistema funcionando
            </h2>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-noche-texto/60">
              El recorrido completo, de la conversación de WhatsApp al panel
              con los números — sin cortes ni datos inventados.
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-noche-texto/12 bg-noche-texto/[0.03]">
              {listo ? (
                <video
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={`Demostración del sistema para ${nombre}`}
                >
                  <source src={`/videos/negocio-${slug}.mp4`} type="video/mp4" />
                  Tu navegador no puede reproducir este video.
                </video>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-noche-texto/15 text-noche-texto/40">
                    <FilmSlate size={24} />
                  </div>
                  <p className="text-[0.9375rem] font-medium tracking-tight text-noche-texto/70">
                    Grabando la demostración
                  </p>
                  <p className="max-w-[38ch] text-[0.875rem] leading-relaxed text-noche-texto/45">
                    Mientras tanto te lo mostramos en vivo durante el
                    diagnóstico, con tu propio caso sobre la mesa.
                  </p>
                </div>
              )}

              {listo && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity">
                  <PlayCircle size={56} weight="fill" className="text-noche-texto/80" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { existsSync } from "node:fs";
import { join } from "node:path";
import { Play, SpeakerSimpleSlash } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

/**
 * Poné el archivo public/videos/<id>.mp4 y la demo se activa sola,
 * reemplazando el placeholder por un loop silencioso autoplay.
 */
const demos = [
  {
    id: "clinica",
    sector: "Clínica",
    titulo: "De un mensaje de WhatsApp a una cita confirmada",
    duracion: "1:12",
  },
  {
    id: "taller",
    sector: "Taller",
    titulo: "De una foto de factura a un registro contable",
    duracion: "0:58",
  },
  {
    id: "tienda",
    sector: "Tienda en línea",
    titulo: "De un carrito abandonado a una venta recuperada",
    duracion: "1:04",
  },
];

function tieneVideo(id: string) {
  return existsSync(join(process.cwd(), "public", "videos", `${id}.mp4`));
}

export function Demos() {
  const algunaFalta = demos.some((d) => !tieneVideo(d.id));

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal>
          <p className="eyebrow mb-5">Se ve, no se explica</p>
          <h2 className="max-w-[26ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
            El mismo método, en tres negocios completamente distintos
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {demos.map((d, i) => {
            const activa = tieneVideo(d.id);
            return (
              <Reveal key={d.id} delay={i * 90}>
                <div className="group cursor-pointer">
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-noche">
                    {activa ? (
                      <>
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-full w-full object-cover"
                        >
                          <source src={`/videos/${d.id}.mp4`} type="video/mp4" />
                        </video>
                        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-noche/60 px-2.5 py-1 text-noche-texto/80 backdrop-blur-sm">
                          <SpeakerSimpleSlash size={12} />
                        </span>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-noche-texto/10 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
                          <Play size={20} weight="fill" className="ml-0.5 text-noche-texto" />
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-3 right-3 rounded-full bg-noche/60 px-2.5 py-1 font-mono text-[0.6875rem] text-noche-texto/80 backdrop-blur-sm">
                      {d.duracion}
                    </span>
                  </div>
                  <p className="eyebrow mt-4">{d.sector}</p>
                  <p className="mt-1.5 text-[1.0625rem] font-medium leading-snug tracking-tight text-ink">
                    {d.titulo}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {algunaFalta && (
          <p className="mt-8 text-[0.8125rem] text-ink-faint">
            Espacio reservado para las demos reales grabadas de la agencia.
          </p>
        )}
      </div>
    </section>
  );
}

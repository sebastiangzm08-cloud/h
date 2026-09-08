/* ==========================================================================
   Detalle de UNA automatización. Es su casa: todo lo suyo vive acá adentro,
   repartido en pestañas.

   Tres caminos:
   - contratada        → pestañas completas (Resumen · Configuración · Uso +
                          la pestaña propia de su tipo)
   - en catálogo, no contratada → ficha de "todavía no la tenés"
   - no existe         → 404
   ========================================================================== */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GraficaUso } from "@/components/panel/grafica";
import { Icono } from "@/components/panel/iconos";
import { Pestanas, type Pestana } from "@/components/panel/pestanas";
import {
  Caja,
  CajaHead,
  Nota,
  PageHead,
  Pill,
  colones,
  precioMensualTexto,
} from "@/components/panel/ui";
import { TarjetaCatalogo } from "@/components/panel/tarjeta-automatizacion";
import { SubirContenido } from "@/components/panel/subir-contenido";
import { GaleriaPiezas } from "@/components/panel/galeria-piezas";
import { ConfigRedes } from "@/components/panel/config-redes";
import { leerConfigRedes } from "@/lib/panel/redes-config";
import {
  getAsignacion,
  getAutomatizacion,
  getConexionBuffer,
  getPerfil,
  getPiezas,
  getUsoAutomatizacion,
  getUsoDiario,
} from "@/lib/panel/datos";
import { imagekitConfigurado } from "@/lib/imagekit";
import { nombrePlan, nombreProceso } from "@/lib/panel/tipos";

const NOMBRE_RED: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const aut =
    (await getAsignacion(slug))?.automatizacion ?? (await getAutomatizacion(slug));
  return {
    title: aut ? `${aut.nombre} · Panel Hoshizora` : "Automatización · Panel",
  };
}

/* Etiqueta legible para una clave de configuración:
   `escalarSiNoEntiende` → "Escalar si no entiende". */
function humaniza(clave: string) {
  const t = clave
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function valorLegible(v: unknown): string {
  if (typeof v === "boolean") return v ? "Sí" : "No";
  if (v == null || v === "") return "—";
  return String(v);
}

const volver = (
  <Link
    href="/panel/automatizaciones"
    className="inline-flex items-center gap-1.5 text-[12px] text-ink-mute transition-colors hover:text-ink"
  >
    <Icono nombre="flecha" className="h-3 w-3 rotate-180" />
    Automatizaciones
  </Link>
);

export default async function DetalleAutomatizacion({ params }: Props) {
  const { slug } = await params;
  const asignacion = await getAsignacion(slug);

  /* ---- Caminos 2 y 3: no la tiene contratada ---- */
  if (!asignacion) {
    const aut = await getAutomatizacion(slug);
    if (!aut) notFound();

    const mensaje = `Hola, quiero sumar la automatización "${aut.nombre}" a mi cuenta.`;

    return (
      <>
        {volver}
        <PageHead titulo={aut.nombre} sub={nombreProceso[aut.proceso]} />
        <div className="max-w-md">
          <TarjetaCatalogo
            automatizacion={aut}
            href={`/panel/automatizaciones/${aut.slug}`}
          />
        </div>
        <Caja className="max-w-md">
          <CajaHead eyebrow="Todavía no la tenés" titulo="Cómo sumarla" />
          <p className="text-[13px] leading-relaxed text-ink-faint">
            {aut.estado === "a_pedido"
              ? `Se construye para tu negocio y queda andando en ${aut.plazo}. Escribinos y arrancamos.`
              : "Está lista para activar en tu cuenta. Escribinos y la dejamos andando hoy."}
          </p>
          <p className="mt-3 text-[13px] text-ink-soft">
            Plan {nombrePlan[aut.planMinimo]} · {precioMensualTexto(aut.precioMensual)}
          </p>
          <a
            href={`https://wa.me/50660791641?text=${encodeURIComponent(mensaje)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            Escribirnos
          </a>
        </Caja>
      </>
    );
  }

  /* ---- Camino 1: contratada ---- */
  const { automatizacion: aut, estado, resumen, limites, config, precioMensual } =
    asignacion;
  const esRedes = aut.slug === "redes-sociales";
  const [uso, perfil, piezas, usoAut, bufferConn] = await Promise.all([
    getUsoDiario(asignacion.id),
    getPerfil(),
    esRedes ? getPiezas() : Promise.resolve([]),
    getUsoAutomatizacion(asignacion.id, limites),
    esRedes
      ? getConexionBuffer()
      : Promise.resolve({ estado: "listo" as const, referencia: null }),
  ]);
  const bufferListo = bufferConn.estado === "listo";
  const totalHoy = uso.at(-1)?.valor ?? 0;

  const resumenPanel = (
    <div className="grid gap-[18px] lg:grid-cols-2">
      <Caja>
        <CajaHead eyebrow="Estado" titulo="Cómo va" />
        <div className="flex flex-col gap-3 text-[13px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-ink-mute">Estado</span>
            <Pill tono={estado === "activa" ? "ok" : "idle"}>
              {estado === "activa" ? "Activa" : "Pausada"}
            </Pill>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-ink-mute">Proceso</span>
            <span className="font-mono text-[11px] text-ink-soft">
              {nombreProceso[aut.proceso]}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-ink-mute">Plan</span>
            <span className="text-ink-soft">{nombrePlan[aut.planMinimo]}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-ink-mute">Aporta a tu mensualidad</span>
            <span className="font-mono text-ink-soft">{colones(precioMensual)}</span>
          </div>
        </div>
      </Caja>

      <Caja>
        <CajaHead eyebrow="Ahora mismo" titulo="Resumen" />
        <p className="text-[13px] leading-relaxed text-ink-soft">{resumen}</p>

        {esRedes ? (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-[12.5px]">
            <span className="text-ink-mute">En fila ahora</span>
            <span className="font-mono text-ink-soft">
              {usoAut.enFila} {usoAut.enFila === 1 ? "pieza" : "piezas"}
            </span>
          </div>
        ) : null}

        {esRedes && !bufferListo ? (
          <p className="mt-3 rounded-lg bg-warn/[0.08] px-3 py-2 text-[12px] leading-relaxed text-warn">
            {usoAut.enFila > 0
              ? `${usoAut.enFila === 1 ? "Esa pieza no va a salir" : "Esas piezas no van a salir"} hasta que conectes Buffer. `
              : "Conectá Buffer para que tus piezas se publiquen. "}
            <Link
              href="/panel/conexiones"
              className="underline underline-offset-2 hover:text-ink"
            >
              Conectar ahora
            </Link>
          </p>
        ) : null}

        {usoAut.medidores.length > 0 ? (
          <dl className="mt-3 flex flex-col gap-3 border-t border-line pt-3 text-[12.5px]">
            {usoAut.medidores.map((m) => {
              const pct = m.tope > 0 ? Math.min(100, (m.usado / m.tope) * 100) : 0;
              return (
                <div key={m.clave} className="flex flex-col gap-1">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-mute">{m.etiqueta}</dt>
                    <dd className="font-mono text-ink-soft">
                      {m.usado.toLocaleString("es-CR")} /{" "}
                      {m.tope.toLocaleString("es-CR")}
                    </dd>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className={
                        pct >= 100
                          ? "h-full rounded-full bg-bad"
                          : pct >= 80
                            ? "h-full rounded-full bg-warn"
                            : "h-full rounded-full bg-ink-soft"
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </dl>
        ) : null}
      </Caja>
    </div>
  );

  const configPanel = esRedes ? (
    <Caja className="max-w-xl">
      <CajaHead eyebrow="Configuración" titulo="Cómo querés que escriban tus posts" />
      <ConfigRedes
        asignacionId={asignacion.id}
        config={leerConfigRedes(config)}
      />
    </Caja>
  ) : (
    <Caja className="max-w-xl">
      <CajaHead eyebrow="Configuración" titulo="Cómo se comporta" />
      {Object.keys(config).length > 0 ? (
        <dl className="text-[13px]">
          {Object.entries(config).map(([k, v], i, arr) => (
            <div
              key={k}
              className={
                i === arr.length - 1
                  ? "flex justify-between gap-6 py-2.5"
                  : "flex justify-between gap-6 border-b border-line py-2.5"
              }
            >
              <dt className="text-ink-mute">{humaniza(k)}</dt>
              <dd className="max-w-[60%] text-right text-ink-soft">
                {valorLegible(v)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-[13px] text-ink-faint">Sin configuración todavía.</p>
      )}
      <Nota tono="warn" className="mt-4">
        Para cambiar esto todavía nos escribís y lo ajustamos. El formulario para
        editarlo vos mismo está en construcción.
      </Nota>
    </Caja>
  );

  const usoPanel = (
    <Caja>
      <CajaHead eyebrow="Uso" titulo="Acciones de esta automatización · 14 días" />
      <GraficaUso puntos={uso} etiquetaFinal={`hoy · ${totalHoy}`} />
      <p className="mt-3 border-t border-line pt-3 text-[11.5px] text-ink-faint">
        Los medidores de límite en vivo están en{" "}
        <Link
          href="/panel"
          className="text-ink-mute underline underline-offset-2 hover:text-ink"
        >
          Inicio
        </Link>
        .
      </p>
    </Caja>
  );

  /* Pestaña propia del tipo. Honesta: dice qué falta, no finge. */
  const panelPorTipo: Record<string, Pestana> = {
    "redes-sociales": {
      id: "contenido",
      label: "Contenido",
      contenido: (
        <div className="flex flex-col gap-[18px]">
          <Caja className="max-w-2xl">
            <CajaHead
              eyebrow="Subir contenido"
              titulo="Fotos para publicar"
            />
            <p className="mb-4 text-[13px] leading-relaxed text-ink-faint">
              Soltá las fotos acá. Quedan en fila y la IA les escribe un texto
              distinto para cada red antes de publicarlas en tus turnos. En cada
              foto elegís si querés retoque con IA —mejorar calidad, quitar
              fondo o fondo blanco— antes de publicar (hasta{" "}
              {limites.fotosMejoradasMes ?? 30} al mes).
            </p>
            {!imagekitConfigurado() || !perfil.clienteId ? (
              <Nota tono="warn">
                La subida de archivos todavía no está activa en tu cuenta. En
                cuanto quede lista te avisamos y podés cargar tus piezas desde
                acá.
              </Nota>
            ) : !bufferListo ? (
              <div className="rounded-2xl border border-warn/25 bg-warn/[0.06] p-5">
                <p className="text-[13.5px] font-medium text-ink">
                  Primero conectá Buffer
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-mute">
                  Publicamos tus fotos a través de tu cuenta de Buffer. Mientras
                  no la conectés, lo que subas queda en fila y no sale a tus
                  redes. Es gratis y toma un minuto.
                </p>
                <Link
                  href="/panel/conexiones"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft"
                >
                  Conectar Buffer
                </Link>
              </div>
            ) : (
              <SubirContenido
                clienteId={perfil.clienteId}
                redesDisponibles={aut.conexionesRequeridas.map((c) => ({
                  valor: c,
                  nombre: NOMBRE_RED[c] ?? c,
                }))}
              />
            )}
          </Caja>

          <GaleriaPiezas piezas={piezas} />
        </div>
      ),
    },
    "agente-whatsapp": {
      id: "conversaciones",
      label: "Conversaciones",
      contenido: (
        <Caja className="max-w-xl">
          <CajaHead eyebrow="Conversaciones" titulo="Lo que atendió el agente" />
          <p className="text-[13px] leading-relaxed text-ink-faint">
            El hilo de cada conversación, con las que esperan una persona
            arriba. Se llena cuando el agente entre en funcionamiento.
          </p>
        </Caja>
      ),
    },
  };

  const pestanas: Pestana[] = [
    { id: "resumen", label: "Resumen", contenido: resumenPanel },
    { id: "config", label: "Configuración", contenido: configPanel },
    { id: "uso", label: "Uso", contenido: usoPanel },
  ];
  const extra = panelPorTipo[aut.slug];
  if (extra) pestanas.splice(1, 0, extra);

  return (
    <>
      {volver}
      <PageHead titulo={aut.nombre} sub={nombreProceso[aut.proceso]}>
        <Pill tono={estado === "activa" ? "ok" : "idle"}>
          {estado === "activa" ? "Activa" : "Pausada"}
        </Pill>
      </PageHead>
      <Pestanas pestanas={pestanas} />
    </>
  );
}

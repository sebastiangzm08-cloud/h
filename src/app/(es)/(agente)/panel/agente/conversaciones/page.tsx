import Link from "next/link";
import "@/components/panel/conversaciones/conversaciones.css";
import { Vacio } from "@/components/panel/agente-ui";
import { Redactar } from "@/components/panel/agente-redactar";
import { EncabezadoChat } from "@/components/panel/conversaciones/encabezado-chat";
import { FichaContacto } from "@/components/panel/conversaciones/ficha-contacto";
import { Hilo } from "@/components/panel/conversaciones/hilo";
import {
  Filtros,
  ListaConversaciones,
  comoFiltro,
  hrefConversaciones,
  type Filtro,
} from "@/components/panel/conversaciones/lista";
import { getAsignacion } from "@/lib/panel/datos";
import { leerConfigAgente } from "@/lib/panel/agente-config";
import {
  enModoEjemplo,
  getContactos,
  getConocimiento,
  getConversaciones,
  getMensajes,
} from "@/lib/panel/agente";
import {
  getCitasDeContacto,
  getConversacionPorId,
  pasaron24HorasDesdeSuUltimoMensaje,
  getHorariosLibres,
  hoyCR,
  resumirHerramientas,
  type CitaContacto,
  type DatosAcciones,
  type ServicioChat,
} from "@/lib/panel/conversaciones";
import { cn } from "@/lib/utils";

/* ==========================================================================
   La bandeja — Fase 3 del rediseño (2026-09-30), celular primero.

   La conversación abierta va en la URL (`?c=<id>`) a propósito, no en estado
   de React: así el enlace "Atenderla" del Resumen puede abrir una concreta,
   se puede compartir, y el botón Atrás del navegador funciona. Todo esto
   renderiza en el servidor; no hace falta JavaScript para leer un hilo.

   Tres columnas en pantalla grande (lista · chat · ficha del contacto), dos
   en tablet (la ficha se abre en una hoja desde el nombre del chat) y UNA a
   la vez en celular: con un chat abierto el chat ocupa todo y los filtros
   de arriba se esconden.

   Todo lo que se muestra sale de datos reales: conversaciones, mensajes,
   contactos, citas y el conocimiento / horario que cargó el cliente.
   ========================================================================== */

export default async function ConversacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; f?: string }>;
}) {
  const { c, f } = await searchParams;
  const filtro: Filtro = comoFiltro(f);

  const [todas, contactos, ejemplo, asignacionAgente, conocimiento] = await Promise.all([
    getConversaciones(),
    getContactos(),
    enModoEjemplo(),
    getAsignacion("agente-whatsapp"),
    getConocimiento(),
  ]);
  const agentePausado = asignacionAgente?.estado === "pausada";

  const lista = filtro === "todas" ? todas : todas.filter((x) => x.estado === filtro);

  /* Con `?c=` se abre ESA conversación, aunque el filtro no la incluya (por
     ejemplo, recién la tomaste y ya no está en "IA"). Sin `?c=` el
     escritorio arranca con la primera de la lista; el celular no abre
     ninguna (muestra la lista). */
  const conversacionElegida = Boolean(c);
  const abierta = c
    ? (todas.find((x) => x.id === c) ?? (await getConversacionPorId(c)))
    : (lista[0] ?? null);

  const cuentas: Record<Filtro, number> = {
    todas: todas.length,
    agente: todas.filter((x) => x.estado === "agente").length,
    humano: todas.filter((x) => x.estado === "humano").length,
    espera: todas.filter((x) => x.estado === "espera").length,
  };

  /* Lo que necesita el chat abierto. */
  const servicios: ServicioChat[] = conocimiento
    .filter((i) => i.tipo === "servicio" && i.activo)
    .map((i) => ({ clave: i.clave, monto: i.monto, duracionMin: i.duracionMin }));

  const [mensajes, citas, horarios] = abierta
    ? await Promise.all([
        getMensajes(abierta.id),
        getCitasDeContacto({ id: abierta.contactoId, nombre: abierta.nombre }),
        getHorariosLibres(servicios, asignacionAgente?.config),
      ])
    : [[], [] as CitaContacto[], null];

  const contacto = abierta ? (contactos.find((x) => x.id === abierta.contactoId) ?? null) : null;

  const datosAcciones: DatosAcciones | null =
    abierta && horarios
      ? {
          servicios,
          horarios,
          trato: leerConfigAgente(asignacionAgente?.config).trato,
          hoy: hoyCR(),
        }
      : null;

  const ficha =
    abierta ? (
      <FichaContacto
        conversacion={abierta}
        contacto={contacto}
        citas={citas}
        herramientas={resumirHerramientas(mensajes)}
      />
    ) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Filtros filtro={filtro} cuentas={cuentas} ocultoEnMovil={conversacionElegida} />

      {/* `min-h-0` + una sola fila `minmax(0,1fr)` es lo que hace que esta
          fila SÍ pueda encogerse dentro del contenedor de arriba (ocupa el
          alto que deja la barra superior): sin esto, cada columna crece con
          su contenido y estira la página entera en vez de scrollear por
          dentro. */}
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] md:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_300px]">
        {/* ---------- lista ---------- */}
        <ListaConversaciones
          lista={lista}
          filtro={filtro}
          abiertaId={abierta?.id ?? null}
          ocultaEnMovil={conversacionElegida}
          ejemplo={ejemplo}
          hayConversaciones={todas.length > 0}
        />

        {/* ---------- chat ---------- */}
        <section
          aria-label="Conversación"
          /* En celular, con un chat abierto, esto esconde la barra de arriba del
             armazón (ver conversaciones.css) para que el chat use toda la pantalla. */
          data-chat-movil={conversacionElegida && abierta ? "" : undefined}
          className={cn(
            "flex min-h-0 min-w-0 flex-col overflow-hidden border-line 2xl:border-r",
            !conversacionElegida && "max-md:hidden"
          )}
        >
          {!abierta || !datosAcciones ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6">
              <Vacio>
                {conversacionElegida
                  ? "No encontré esa conversación: puede que ya se haya cerrado."
                  : todas.length === 0
                    ? "Cuando alguien te escriba por WhatsApp, vas a ver la conversación acá."
                    : "Elegí una conversación de la lista."}
              </Vacio>
              {conversacionElegida ? (
                <Link
                  href={hrefConversaciones(filtro)}
                  prefetch={false}
                  className="inline-flex h-11 items-center rounded-xl border border-line-strong px-4 text-[13px] font-medium text-ink-soft transition-colors hover:bg-surface-2 active:bg-surface-3"
                >
                  Volver a la lista
                </Link>
              ) : null}
            </div>
          ) : (
            <>
              <EncabezadoChat
                conversacion={abierta}
                agentePausado={agentePausado}
                volverHref={hrefConversaciones(filtro)}
                ficha={ficha}
              />
              <Hilo mensajes={mensajes} />
              <Redactar
                key={abierta.id}
                conversacion={abierta}
                datos={datosAcciones}
                fueraDeVentana={pasaron24HorasDesdeSuUltimoMensaje(mensajes)}
              />
            </>
          )}
        </section>

        {/* ---------- ficha del contacto (pantalla grande) ---------- */}
        <aside
          aria-label="Ficha del contacto"
          className="scroll-fino hidden min-h-0 overflow-y-auto overscroll-contain px-4 py-5 2xl:block"
        >
          {ficha}
        </aside>
      </div>
    </div>
  );
}

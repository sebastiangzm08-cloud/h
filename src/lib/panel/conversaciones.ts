/* ==========================================================================
   Datos propios de la pantalla Conversaciones (Fase 3 del rediseño,
   2026-09-30).

   Vive acá, y no en `agente.ts`, para no tocar la costura compartida del
   agente. Todo es de LECTURA y sale de las mismas tablas `wa_*`:

   - historial de citas de UN contacto (ficha del contacto)
   - próximos horarios libres (acción rápida "Horarios libres")
   - "qué consultó la IA" en una conversación (a partir de lo que ya se
     guardó en `wa_mensajes.herramientas`)

   Los horarios libres usan EXACTAMENTE las mismas reglas que
   `📅 Calcular disponibilidad` del workflow y que `reservarValidada` /
   `wa_reservar_cita` al agendar a mano: grilla de 15 min, horario del
   negocio (`clientes.horario`), capacidad simultánea y colchón entre citas
   (`asignaciones.config.agenda`), anticipación mínima y máximo de días.
   Así nunca se le ofrece a alguien un horario que después el sistema no
   deja agendar. Costa Rica es -06:00 fijo (sin horario de verano).
   ========================================================================== */
import { supabaseServidor } from "@/lib/supabase/servidor";
import { getPerfil } from "./datos";
import {
  enModoEjemplo,
  getCitas,
  getHorarioNegocio,
  type ConversacionAgente,
  type MensajeAgente,
} from "./agente";
import { leerConfigAgenda } from "./agente-config";
import { hora } from "./agente-formato";

/* -------------------------------------------------------------------------
   Tipos (los usan también los componentes, con `import type`)
   ------------------------------------------------------------------------- */

export type ServicioChat = {
  clave: string;
  monto: number | null;
  duracionMin: number | null;
};

export type EstadoCitaChat = "confirmada" | "sin_confirmar" | "cancelada" | "cumplida";

export type CitaContacto = {
  id: string;
  /** "lun 5 oct 2026" — ya en hora de Costa Rica. */
  fecha: string;
  /** "8:00 a.m." */
  hora: string;
  servicio: string;
  monto: number | null;
  estado: EstadoCitaChat;
  /** Todavía no pasó y no está cancelada. */
  futura: boolean;
};

export type HoraLibre = { iso: string; texto: string };

export type DiaLibre = {
  /** "2026-10-05" (día de Costa Rica). */
  fecha: string;
  /** "lunes 5 de octubre" — para escribirle a la persona. */
  etiqueta: string;
  /** "lun 5 oct" — para la lista. */
  corta: string;
  horas: HoraLibre[];
};

export type HorariosServicio = {
  servicio: string;
  duracionMin: number;
  /** true si el servicio no tiene duración cargada y se calculó con 30 min por defecto. */
  duracionEstimada: boolean;
  dias: DiaLibre[];
};

export type HorariosLibres =
  | { estado: "ok"; porServicio: HorariosServicio[] }
  /** `clientes.horario` vacío: sin horario cargado no se puede calcular nada. */
  | { estado: "sin_horario" }
  | { estado: "sin_servicios" }
  /** No se pudo leer la agenda: mejor decirlo que ofrecer horarios a ciegas. */
  | { estado: "error" };

/** Todo lo que necesitan las acciones rápidas de la caja de escribir. */
export type DatosAcciones = {
  servicios: ServicioChat[];
  horarios: HorariosLibres;
  trato: "usted" | "vos";
  /** Hoy en Costa Rica, "YYYY-MM-DD" (mínimo del selector de fecha). */
  hoy: string;
};

export type HerramientaUsada = { nombre: string; veces: number };

/* -------------------------------------------------------------------------
   Fechas en hora de Costa Rica
   ------------------------------------------------------------------------- */

const ZONA_CR = "America/Costa_Rica";
const CR_OFFSET_MS = 6 * 3_600_000;
const DIAS_CLAVE = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];

function partesFecha(d: Date, opciones: Intl.DateTimeFormatOptions) {
  const partes = new Intl.DateTimeFormat("es-CR", { timeZone: ZONA_CR, ...opciones }).formatToParts(d);
  const dato = (tipo: string) => (partes.find((p) => p.type === tipo)?.value ?? "").replace(/\.$/, "");
  return { dia: dato("weekday"), numero: dato("day"), mes: dato("month"), anio: dato("year") };
}

/** "lun 5 oct 2026" */
function fechaConAnio(d: Date) {
  const p = partesFecha(d, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  return `${p.dia} ${p.numero} ${p.mes} ${p.anio}`;
}

/** "lun 5 oct" */
function fechaCortaCR(d: Date) {
  const p = partesFecha(d, { weekday: "short", day: "numeric", month: "short" });
  return `${p.dia} ${p.numero} ${p.mes}`;
}

/** "lunes 5 de octubre" */
function fechaLargaCR(d: Date) {
  const p = partesFecha(d, { weekday: "long", day: "numeric", month: "long" });
  return `${p.dia} ${p.numero} de ${p.mes}`;
}

/** Hoy en Costa Rica: "2026-09-30". */
export function hoyCR(): string {
  return new Date(Date.now() - CR_OFFSET_MS).toISOString().slice(0, 10);
}

/** "2026-10-05" del día de Costa Rica al que pertenece un instante. */
function claveDiaCR(ms: number) {
  return new Date(ms - CR_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * Para separar los días dentro del hilo: "Hoy", "Ayer" o "Lun 5 oct", y una
 * clave estable (el día de Costa Rica) para saber cuándo cambia el día.
 */
export function etiquetaDia(iso: string): { clave: string; texto: string } {
  const ms = new Date(iso).getTime();
  const clave = claveDiaCR(ms);
  if (clave === hoyCR()) return { clave, texto: "Hoy" };
  if (clave === claveDiaCR(Date.now() - 86_400_000)) return { clave, texto: "Ayer" };
  const corta = fechaCortaCR(new Date(ms));
  return { clave, texto: corta.charAt(0).toUpperCase() + corta.slice(1) };
}

/* -------------------------------------------------------------------------
   Una conversación por id (para ?c= fuera de las 80 que carga la lista)
   ------------------------------------------------------------------------- */

type FilaConversacionId = {
  id: string;
  contacto_id: string;
  estado: string;
  motivo_espera: string | null;
  ultimo_mensaje: string | null;
  ultimo_en: string;
  wa_contactos: { nombre: string | null; telefono: string; etiquetas: string[] | null } | null;
};

/** Mismo select y mapeo que getConversaciones, pero de UNA conversación abierta (no cerrada). */
export async function getConversacionPorId(id: string): Promise<ConversacionAgente | null> {
  if (await enModoEjemplo()) return null;
  const perfil = await getPerfil();
  if (!perfil.clienteId) return null;

  const sb = await supabaseServidor();
  const { data, error } = await sb
    .from("wa_conversaciones")
    .select(
      "id, contacto_id, estado, motivo_espera, ultimo_mensaje, ultimo_en, wa_contactos(nombre, telefono, etiquetas)"
    )
    .eq("id", id)
    .eq("cliente_id", perfil.clienteId)
    .neq("estado", "cerrada")
    .maybeSingle();
  if (error || !data) return null;

  const f = data as unknown as FilaConversacionId;
  return {
    id: f.id,
    contactoId: f.contacto_id,
    nombre: f.wa_contactos?.nombre?.trim() || f.wa_contactos?.telefono || "Sin nombre",
    telefono: f.wa_contactos?.telefono ?? "",
    estado: f.estado === "espera" || f.estado === "humano" ? f.estado : "agente",
    motivoEspera: f.motivo_espera ?? "",
    ultimoMensaje: f.ultimo_mensaje ?? "",
    ultimoEn: f.ultimo_en,
    etiquetas: f.wa_contactos?.etiquetas ?? [],
  };
}

/**
 * ¿Pasaron más de 24 h desde el último mensaje de la persona? Si sí, WhatsApp
 * solo deja escribirle con una plantilla aprobada. Sin mensajes suyos en el
 * hilo no se puede saber, y no se avisa.
 */
export function pasaron24HorasDesdeSuUltimoMensaje(mensajes: MensajeAgente[]): boolean {
  let ultimo = 0;
  for (const m of mensajes) {
    if (m.autor === "contacto") ultimo = Math.max(ultimo, new Date(m.creadoEn).getTime());
  }
  return ultimo > 0 && Date.now() - ultimo > 24 * 3_600_000;
}

/* -------------------------------------------------------------------------
   Historial de citas de un contacto
   ------------------------------------------------------------------------- */

type FilaCitaContacto = {
  id: string;
  cuando: string;
  servicio: string | null;
  monto: number | null;
  estado: string | null;
};

function comoEstadoCita(v: string | null): EstadoCitaChat {
  return v === "sin_confirmar" || v === "cancelada" || v === "cumplida" ? v : "confirmada";
}

/**
 * Todas las citas de una persona, las que vienen primero (de la más cercana a
 * la más lejana) y después las anteriores (de la más reciente a la más vieja).
 */
export async function getCitasDeContacto(contacto: {
  id: string;
  nombre: string;
}): Promise<CitaContacto[]> {
  let filas: FilaCitaContacto[] = [];

  if (await enModoEjemplo()) {
    /* En modo ejemplo las citas no traen el id del contacto: se cruzan por nombre. */
    filas = (await getCitas())
      .filter((c) => c.nombre === contacto.nombre)
      .map((c) => ({ id: c.id, cuando: c.cuando, servicio: c.servicio, monto: c.monto, estado: c.estado }));
  } else {
    const perfil = await getPerfil();
    if (!perfil.clienteId) return [];
    const sb = await supabaseServidor();
    const { data, error } = await sb
      .from("wa_citas")
      .select("id, cuando, servicio, monto, estado")
      .eq("cliente_id", perfil.clienteId)
      .eq("contacto_id", contacto.id)
      .order("cuando", { ascending: false })
      .limit(30);
    if (error || !data) return [];
    filas = data as FilaCitaContacto[];
  }

  const ahora = Date.now();
  const citas = filas.map((f) => {
    const d = new Date(f.cuando);
    const estado = comoEstadoCita(f.estado);
    const cita: CitaContacto = {
      id: f.id,
      fecha: fechaConAnio(d),
      hora: hora(f.cuando),
      servicio: f.servicio ?? "",
      monto: f.monto,
      estado,
      futura: d.getTime() >= ahora && estado !== "cancelada" && estado !== "cumplida",
    };
    return { cita, ms: d.getTime() };
  });

  const proximas = citas.filter((x) => x.cita.futura).sort((a, b) => a.ms - b.ms);
  const anteriores = citas.filter((x) => !x.cita.futura).sort((a, b) => b.ms - a.ms);
  return [...proximas, ...anteriores].map((x) => x.cita);
}

/* -------------------------------------------------------------------------
   "Qué consultó la IA" — solo lo que de verdad quedó guardado
   ------------------------------------------------------------------------- */

const NOMBRE_HERRAMIENTA: Record<string, string> = {
  precios: "Precios",
  agenda: "Agenda",
  horario: "Horario",
  servicios: "Servicios",
};

/** Nombre legible de una herramienta, o null si no se conoce (entonces no se muestra). */
export function nombreHerramienta(clave: string): string | null {
  return NOMBRE_HERRAMIENTA[clave.trim().toLowerCase()] ?? null;
}

/**
 * Cuántas veces consultó la IA cada cosa en esta conversación, leído de
 * `wa_mensajes.herramientas`. OJO: el workflow de n8n hoy NO escribe esa
 * columna (siempre queda vacía), así que en producción esto devuelve [] y
 * la ficha no muestra nada. Cuando el workflow empiece a llenarla, aparece
 * solo.
 */
export function resumirHerramientas(mensajes: MensajeAgente[]): HerramientaUsada[] {
  const cuenta = new Map<string, number>();
  for (const m of mensajes) {
    if (m.autor !== "agente") continue;
    for (const h of m.herramientas) {
      const clave = h.trim().toLowerCase();
      if (clave) cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1);
    }
  }
  return [...cuenta.entries()]
    .flatMap(([clave, veces]) => {
      const nombre = NOMBRE_HERRAMIENTA[clave];
      return nombre ? [{ nombre, veces }] : [];
    })
    .sort((a, b) => b.veces - a.veces);
}

/* -------------------------------------------------------------------------
   Próximos horarios libres
   ------------------------------------------------------------------------- */

/** Cuántos días con campo se muestran por servicio. */
const MAX_DIAS_MOSTRADOS = 7;
/** Cuántos horarios por día (repartidos entre la mañana y la tarde). */
const MAX_HORAS_POR_DIA = 4;
/** Duración por defecto, igual que `reservarValidada` y el workflow. */
const DURACION_POR_DEFECTO = 30;

type Ocupada = { ini: number; durMin: number | null };

/** Las citas ya agendadas, agrupadas por día de CR de su inicio. */
function agruparPorDia(ocupadas: Ocupada[]) {
  const mapa = new Map<string, Ocupada[]>();
  for (const o of ocupadas) {
    const k = claveDiaCR(o.ini);
    const lista = mapa.get(k);
    if (lista) lista.push(o);
    else mapa.set(k, [o]);
  }
  return mapa;
}

function minutosDe(hhmm: unknown): number | null {
  const [h, m] = String(hhmm).split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
}

/**
 * Los próximos horarios libres de cada servicio, por día. Misma lógica que
 * el nodo "📅 Calcular disponibilidad" del workflow (ver
 * `agente-whatsapp-BUILDER.mjs`), pero mostrando varios horarios por día:
 * acá la persona elige cuáles ofrecer, no hay un tope de 3 para el modelo.
 */
function calcularHorarios(
  servicios: ServicioChat[],
  horario: Record<string, [string, string][]>,
  agenda: ReturnType<typeof leerConfigAgenda>,
  ocupadas: Ocupada[]
): HorariosServicio[] {
  const ahora = Date.now();
  const desde = ahora + agenda.anticipacionMin * 60_000;
  const limite = ahora + agenda.maximoDiasAdelante * 86_400_000;
  const porDia = agruparPorDia(ocupadas);
  const colchonMs = agenda.colchonMin * 60_000;

  function ocupacion(ini: number, durMin: number) {
    const fin = ini + durMin * 60_000;
    const cercanas = [-1, 0, 1].flatMap((delta) => porDia.get(claveDiaCR(ini + delta * 86_400_000)) ?? []);
    return cercanas.filter((o) => {
      const oFin = o.ini + (o.durMin && o.durMin > 0 ? o.durMin : durMin) * 60_000;
      return o.ini < fin + colchonMs && oFin > ini - colchonMs;
    }).length;
  }

  const unicos = new Map<string, ServicioChat>();
  for (const s of servicios) if (s.clave && !unicos.has(s.clave)) unicos.set(s.clave, s);

  return [...unicos.values()].map((s) => {
    const dur = s.duracionMin && s.duracionMin > 0 ? s.duracionMin : DURACION_POR_DEFECTO;
    const dias: DiaLibre[] = [];
    const ahoraCR = new Date(ahora - CR_OFFSET_MS);

    for (let d = 0; d <= agenda.maximoDiasAdelante && dias.length < MAX_DIAS_MOSTRADOS; d++) {
      const base = new Date(ahoraCR.getTime() + d * 86_400_000);
      const bloques = horario[DIAS_CLAVE[base.getUTCDay()]];
      if (!Array.isArray(bloques)) continue;
      /* Medianoche de ese día en Costa Rica, en milisegundos UTC. */
      const medianoche =
        Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()) + CR_OFFSET_MS;

      const validos: { ms: number; min: number }[] = [];
      for (const bloque of bloques) {
        if (!Array.isArray(bloque) || bloque.length !== 2) continue;
        const ini = minutosDe(bloque[0]);
        const fin = minutosDe(bloque[1]);
        if (ini == null || fin == null) continue;
        for (let min = ini; min + dur <= fin; min += 15) {
          const ms = medianoche + min * 60_000;
          if (ms < desde || ms > limite) continue;
          if (ocupacion(ms, dur) < agenda.capacidad) validos.push({ ms, min });
        }
      }
      if (validos.length === 0) continue;

      /* Se prefieren las horas "redondas" (en punto y y media) y se reparten
         entre la mañana y la tarde, en vez de los primeros 4 huecos pegados. */
      const redondos = validos.filter((v) => v.min % 30 === 0);
      const candidatos = redondos.length > 0 ? redondos : validos;
      const elegidos =
        candidatos.length <= MAX_HORAS_POR_DIA
          ? candidatos
          : Array.from({ length: MAX_HORAS_POR_DIA }, (_, i) =>
              candidatos[Math.round((i * (candidatos.length - 1)) / (MAX_HORAS_POR_DIA - 1))]
            );

      const primero = new Date(elegidos[0].ms);
      dias.push({
        fecha: claveDiaCR(elegidos[0].ms),
        etiqueta: fechaLargaCR(primero),
        corta: fechaCortaCR(primero),
        horas: elegidos.map((v) => {
          const iso = new Date(v.ms).toISOString();
          return { iso, texto: hora(iso) };
        }),
      });
    }

    return { servicio: s.clave, duracionMin: dur, duracionEstimada: !(s.duracionMin && s.duracionMin > 0), dias };
  });
}

/**
 * Lee lo que hace falta y calcula los horarios libres. `config` es el
 * `asignaciones.config` del agente (de ahí salen capacidad, colchón,
 * anticipación y días hacia adelante).
 */
export async function getHorariosLibres(
  servicios: ServicioChat[],
  config: Record<string, unknown> | null | undefined
): Promise<HorariosLibres> {
  if (servicios.length === 0) return { estado: "sin_servicios" };

  const horario = await getHorarioNegocio();
  const hayHorario = Object.values(horario).some((b) => Array.isArray(b) && b.length > 0);
  if (!hayHorario) return { estado: "sin_horario" };

  const agenda = leerConfigAgenda(config);
  const ahora = Date.now();
  let ocupadas: Ocupada[] = [];

  if (await enModoEjemplo()) {
    ocupadas = (await getCitas())
      .filter((c) => c.estado === "confirmada" || c.estado === "sin_confirmar")
      .map((c) => ({ ini: new Date(c.cuando).getTime(), durMin: null }));
  } else {
    const perfil = await getPerfil();
    if (!perfil.clienteId) return { estado: "error" };
    const sb = await supabaseServidor();
    const { data, error } = await sb
      .from("wa_citas")
      .select("cuando, duracion_min")
      .eq("cliente_id", perfil.clienteId)
      .in("estado", ["confirmada", "sin_confirmar"])
      .gte("cuando", new Date(ahora - 86_400_000).toISOString())
      .lte("cuando", new Date(ahora + (agenda.maximoDiasAdelante + 2) * 86_400_000).toISOString())
      .order("cuando", { ascending: true })
      .limit(1000);
    /* Sin poder leer la agenda NO se calcula: todo se vería libre. */
    if (error || !data) return { estado: "error" };
    ocupadas = (data as { cuando: string; duracion_min: number | null }[]).map((c) => ({
      ini: new Date(c.cuando).getTime(),
      durMin: c.duracion_min,
    }));
  }

  return { estado: "ok", porServicio: calcularHorarios(servicios, horario, agenda, ocupadas) };
}

/* ==========================================================================
   Arma lo que dibuja la Agenda a partir de `getCitas()`: citas agrupadas por
   día, la franja de la semana y las cifras de arriba. Todo en hora de Costa
   Rica (sin horario de verano, igual que el resto del proyecto).

   Va en un archivo aparte, fuera del componente de la página, porque necesita
   "ahora" (`Date.now()`) y una página de React no debe leer el reloj
   mientras se dibuja.
   ========================================================================== */
import { colones } from "@/components/panel/ui";
import type { CitaAgente } from "@/lib/panel/agente";
import { fechaCorta, hora } from "@/lib/panel/agente-formato";

const ZONA = "America/Costa_Rica";

const CLAVE = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/* Los días se manejan como "2026-09-24" y se formatean a mediodía en UTC,
   así la zona horaria del servidor no corre el día de nadie. */
const SEMANA_LARGA = new Intl.DateTimeFormat("es-CR", { weekday: "long", timeZone: "UTC" });
const SEMANA_CORTA = new Intl.DateTimeFormat("es-CR", { weekday: "short", timeZone: "UTC" });
const MES_LARGO = new Intl.DateTimeFormat("es-CR", { month: "long", timeZone: "UTC" });

const aMediodia = (clave: string) => new Date(`${clave}T12:00:00Z`);
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function claveDia(fecha: string | number | Date) {
  return CLAVE.format(new Date(fecha));
}

function sumarDias(clave: string, dias: number) {
  const d = aMediodia(clave);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

function diferenciaDias(clave: string, base: string) {
  return Math.round((aMediodia(clave).getTime() - aMediodia(base).getTime()) / 86_400_000);
}

export type CitaFila = {
  id: string;
  nombre: string;
  servicio: string;
  /** "₡25.000", "Gratis" o vacío si el servicio no tiene precio cargado. */
  monto: string;
  estado: CitaAgente["estado"];
  hora: string;
  recordatorio: string | null;
  pasada: boolean;
};

export type DiaCitas = {
  clave: string;
  titulo: string;
  detalle: string;
  citas: CitaFila[];
};

export type DiaSemana = {
  clave: string;
  corto: string;
  numero: number;
  cantidad: number;
  esHoy: boolean;
  /** Para el lector de pantalla: "Jueves 24". */
  largo: string;
};

export type AgendaArmada = {
  dias: DiaCitas[];
  semana: DiaSemana[];
  citasHoy: number;
  proximos7: number;
  sinConfirmar: number;
};

function textoMonto(monto: number | null) {
  if (monto === null) return "";
  return monto > 0 ? colones(monto) : "Gratis";
}

function etiquetaDia(clave: string, hoy: string) {
  const diff = diferenciaDias(clave, hoy);
  const d = aMediodia(clave);
  const semana = SEMANA_LARGA.format(d);
  const numero = d.getUTCDate();
  const mes = MES_LARGO.format(d);
  const relativo = diff === -1 ? "Ayer" : diff === 0 ? "Hoy" : diff === 1 ? "Mañana" : null;
  return relativo
    ? { titulo: relativo, detalle: `${semana} ${numero} de ${mes}` }
    : { titulo: mayuscula(semana), detalle: `${numero} de ${mes}` };
}

export function armarAgenda(citas: CitaAgente[]): AgendaArmada {
  const ahora = Date.now();
  const hoy = claveDia(ahora);

  const grupos = new Map<string, CitaFila[]>();
  for (const c of citas) {
    const clave = claveDia(c.cuando);
    const fila: CitaFila = {
      id: c.id,
      nombre: c.nombre,
      servicio: c.servicio,
      monto: textoMonto(c.monto),
      estado: c.estado,
      hora: hora(c.cuando),
      recordatorio: c.recordatorioEn ? fechaCorta(c.recordatorioEn) : null,
      pasada: new Date(c.cuando).getTime() < ahora,
    };
    const grupo = grupos.get(clave);
    if (grupo) grupo.push(fila);
    else grupos.set(clave, [fila]);
  }

  const dias: DiaCitas[] = [...grupos.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([clave, lista]) => ({ clave, ...etiquetaDia(clave, hoy), citas: lista }));

  const activasDelDia = (clave: string) =>
    (grupos.get(clave) ?? []).filter((c) => c.estado !== "cancelada").length;

  const semana: DiaSemana[] = Array.from({ length: 7 }, (_, i) => {
    const clave = sumarDias(hoy, i);
    const d = aMediodia(clave);
    const corto = mayuscula(SEMANA_CORTA.format(d).replace(".", ""));
    return {
      clave,
      corto,
      numero: d.getUTCDate(),
      cantidad: activasDelDia(clave),
      esHoy: i === 0,
      largo: `${mayuscula(SEMANA_LARGA.format(d))} ${d.getUTCDate()}`,
    };
  });

  return {
    dias,
    semana,
    citasHoy: semana[0].cantidad,
    proximos7: semana.reduce((suma, d) => suma + d.cantidad, 0),
    sinConfirmar: citas.filter(
      (c) => c.estado === "sin_confirmar" && new Date(c.cuando).getTime() >= ahora
    ).length,
  };
}

/* ==========================================================================
   Lecturas de la pantalla "Resultados" (Rediseño, 2026-09-30).

   Cuatro respuestas de negocio sacadas de datos CRUDOS — mensajes,
   conversaciones y citas — sin migraciones y sin escribir nada:
   1. Dónde se pierden clientes (embudo de 7 o 30 días).
   2. Ventas del mes (citas cumplidas × monto).
   3. Oportunidades (preguntaron el precio y no tienen cita en 60 días).
   4. Recuperación (las oportunidades con más de 24 h sin actividad).

   Las cuentas están en `resultados-calculo.ts` (funciones puras, con las
   definiciones). Acá solo se lee, con el mismo cliente de Supabase que
   `agente.ts`, así que RLS sigue filtrando por cliente. Ver también la nota
   del Inicio sobre por qué NO se usa `wa_contactos.estado`.

   PostgREST corta a 1.000 filas por pedido: se pagina con `range`, hasta un
   tope, y si se llega al tope se AVISA en pantalla (`incompleto`) en vez de
   mostrar una cifra corta como si fuera exacta. Si una lectura falla, esa
   sección queda en `null` y la pantalla lo dice: nunca se muestra un 0 falso.
   ========================================================================== */
import { supabaseServidor } from "@/lib/supabase/servidor";
import { leerConfigAgente } from "./agente-config";
import { getAsignacion, getCliente, getPerfil } from "./datos";
import {
  DIA_MS,
  DIAS_OPORTUNIDAD,
  PREFILTRO_PRECIO,
  calcularEmbudo,
  calcularOportunidades,
  calcularVentas,
  inicioMesAnteriorCR,
  inicioMesCR,
  mitadMesAnteriorMs,
  nombreMesCR,
  preguntaPrecio,
  type CitaFila,
  type Embudo,
  type Oportunidades,
  type PreguntaFila,
  type Ventas,
} from "./resultados-calculo";

export type Rango = 7 | 30;

export type Resultados = {
  rango: Rango;
  /** `null` = no se pudo leer esa parte; la pantalla lo dice. */
  embudo: Embudo | null;
  ventas: Ventas | null;
  oportunidades: Oportunidades | null;
};

const TAM_PAGINA = 1000;
const PAGINAS_MENSAJES = 6;
const PAGINAS_PREGUNTAS = 3;
const PAGINAS_CITAS = 3;
const LIMITE_LISTA = 40;
const LIMITE_RECUPERABLES = 60;
const SLUG_AGENTE = "agente-whatsapp";

type PaginaPedida = PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

type Lectura<T> = { filas: T[]; fallo: boolean; truncado: boolean };

/**
 * Pide páginas hasta que una venga VACÍA. No se asume que el servidor entrega
 * 1.000 filas por pedido (`max_rows` se puede cambiar): se avanza por lo que
 * de verdad llegó. Si se llega al tope de páginas y todavía hay filas, queda
 * `truncado` (se avisa en pantalla); la página extra es solo una sonda.
 */
async function paginar<T>(
  nombre: string,
  pedir: (desde: number, hasta: number) => PaginaPedida,
  maxPaginas: number
): Promise<Lectura<T>> {
  const filas: T[] = [];
  let desde = 0;
  for (let pagina = 0; pagina <= maxPaginas; pagina += 1) {
    const { data, error } = await pedir(desde, desde + TAM_PAGINA - 1);
    if (error) {
      console.error(`[resultados] ${nombre}:`, error.message);
      return { filas, fallo: true, truncado: false };
    }
    const lote = (data ?? []) as T[];
    if (lote.length === 0) return { filas, fallo: false, truncado: false };
    if (pagina === maxPaginas) return { filas, fallo: false, truncado: true };
    filas.push(...lote);
    desde += lote.length;
  }
  return { filas, fallo: false, truncado: true };
}

/** PostgREST devuelve el embebido como objeto, pero según la versión puede venir en arreglo. */
function uno<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
}

type FilaEscribio = {
  conversacion_id: string;
  wa_conversaciones: { contacto_id: string } | { contacto_id: string }[] | null;
};

type FilaPregunta = {
  conversacion_id: string;
  texto: string | null;
  transcripcion: string | null;
  creado_en: string;
  wa_conversaciones:
    | ConversacionEmbebida
    | ConversacionEmbebida[]
    | null;
};

type ConversacionEmbebida = {
  contacto_id: string;
  estado: string | null;
  ultimo_mensaje: string | null;
  ultimo_en: string | null;
  wa_contactos: { nombre: string | null; telefono: string | null } | { nombre: string | null; telefono: string | null }[] | null;
};

type FilaCitaDb = { contacto_id: string; estado: string; cuando: string; creada_en: string };

const FILTRO_PRECIO = PREFILTRO_PRECIO.flatMap((p) => [`texto.ilike.*${p}*`, `transcripcion.ilike.*${p}*`]).join(",");

export async function getResultados(rango: Rango): Promise<Resultados> {
  const nulo: Resultados = { rango, embudo: null, ventas: null, oportunidades: null };

  const perfil = await getPerfil();
  const id = perfil.clienteId;
  if (!id) return nulo;

  const sb = await supabaseServidor();
  const ahoraMs = Date.now();
  const ahoraIso = new Date(ahoraMs).toISOString();
  const desdeRangoMs = ahoraMs - rango * DIA_MS;
  const desdeRango = new Date(desdeRangoMs).toISOString();
  const hace60 = new Date(ahoraMs - DIAS_OPORTUNIDAD * DIA_MS).toISOString();
  const mes = inicioMesCR(ahoraMs);
  const mesPasado = inicioMesAnteriorCR(ahoraMs);

  const [escribieron, preguntas, citas, cumplidas, cumplidasPasado, sinMarcar, servicios, cliente, asignacion] =
    await Promise.all([
      /* Quién escribió en el período: un renglón por mensaje, solo para
         contar personas distintas. */
      paginar<FilaEscribio>(
        "mensajes del período",
        (a, b) =>
          sb
            .from("wa_mensajes")
            .select("conversacion_id, wa_conversaciones(contacto_id)")
            .eq("cliente_id", id)
            .eq("autor", "contacto")
            .gte("creado_en", desdeRango)
            .order("creado_en", { ascending: false })
            .order("id", { ascending: true })
            .range(a, b),
        PAGINAS_MENSAJES
      ),
      /* Mensajes de contactos que parecen pregunta de precio, 60 días. El
         `or` es solo un prefiltro de la base; el regex exacto se aplica
         después, en `calcularOportunidades` y acá abajo. */
      paginar<FilaPregunta>(
        "preguntas de precio",
        (a, b) =>
          sb
            .from("wa_mensajes")
            .select(
              "conversacion_id, texto, transcripcion, creado_en, wa_conversaciones(contacto_id, estado, ultimo_mensaje, ultimo_en, wa_contactos(nombre, telefono))"
            )
            .eq("cliente_id", id)
            .eq("autor", "contacto")
            .gte("creado_en", hace60)
            .or(FILTRO_PRECIO)
            .order("creado_en", { ascending: false })
            .order("id", { ascending: true })
            .range(a, b),
        PAGINAS_PREGUNTAS
      ),
      /* Citas de los últimos 60 días o que todavía no pasan, en cualquier estado. */
      paginar<FilaCitaDb>(
        "citas",
        (a, b) =>
          sb
            .from("wa_citas")
            .select("contacto_id, estado, cuando, creada_en")
            .eq("cliente_id", id)
            .or(`creada_en.gte.${hace60},cuando.gte.${ahoraIso}`)
            .order("creada_en", { ascending: false })
            .order("id", { ascending: true })
            .range(a, b),
        PAGINAS_CITAS
      ),
      /* Ventas: mismo criterio del Inicio (`getImpactoMes`): cumplidas del mes
         que ya pasaron, por el monto de la cita. */
      paginar<{ monto: number | null; servicio: string | null }>(
        "citas cumplidas del mes",
        (a, b) =>
          sb
            .from("wa_citas")
            .select("monto, servicio")
            .eq("cliente_id", id)
            .eq("estado", "cumplida")
            .gte("cuando", mes)
            .lt("cuando", ahoraIso)
            .order("cuando", { ascending: true })
            .order("id", { ascending: true })
            .range(a, b),
        PAGINAS_CITAS
      ),
      paginar<{ monto: number | null }>(
        "citas cumplidas del mes pasado",
        (a, b) =>
          sb
            .from("wa_citas")
            .select("monto")
            .eq("cliente_id", id)
            .eq("estado", "cumplida")
            .gte("cuando", mesPasado)
            .lt("cuando", mes)
            .order("cuando", { ascending: true })
            .order("id", { ascending: true })
            .range(a, b),
        PAGINAS_CITAS
      ),
      sb
        .from("wa_citas")
        .select("id", { count: "exact", head: true })
        .eq("cliente_id", id)
        .in("estado", ["confirmada", "sin_confirmar"])
        .gte("cuando", mes)
        .lt("cuando", ahoraIso),
      sb
        .from("wa_conocimiento")
        .select("clave")
        .eq("cliente_id", id)
        .eq("tipo", "servicio")
        .eq("activo", true)
        .limit(200),
      getCliente(),
      getAsignacion(SLUG_AGENTE),
    ]);

  const negocio = cliente.nombreNegocio === "Tu negocio" ? "" : cliente.nombreNegocio;
  const trato = leerConfigAgente(asignacion?.config).trato;
  const nombresServicios = ((servicios.data ?? []) as { clave: string | null }[])
    .map((s) => s.clave ?? "")
    .filter(Boolean);

  const citasFilas: CitaFila[] = citas.filas.map((c) => ({
    contactoId: c.contacto_id,
    estado: c.estado,
    cuando: c.cuando,
    creadaEn: c.creada_en,
  }));

  const preguntasFilas: PreguntaFila[] = preguntas.filas.map((f) => {
    const conv = uno(f.wa_conversaciones);
    const contacto = uno(conv?.wa_contactos);
    return {
      conversacionId: f.conversacion_id,
      /* Sin la conversación embebida (no debería pasar) se usa el id de la
         conversación como persona: no tendrá citas, pero se cuenta. */
      contactoId: conv?.contacto_id ?? `conv:${f.conversacion_id}`,
      texto: f.texto,
      transcripcion: f.transcripcion,
      creadoEn: f.creado_en,
      estado: conv?.estado ?? "agente",
      ultimoMensaje: conv?.ultimo_mensaje ?? "",
      ultimoEn: conv?.ultimo_en ?? f.creado_en,
      nombre: contacto?.nombre ?? "",
      telefono: contacto?.telefono ?? "",
    };
  });

  /* 1. Embudo. Necesita mensajes, preguntas y citas. */
  let embudo: Embudo | null = null;
  if (!escribieron.fallo && !preguntas.fallo && !citas.fallo) {
    const ultimaPregunta = preguntas.filas[preguntas.filas.length - 1];
    const preguntasCortadasDentroDelRango =
      preguntas.truncado && ultimaPregunta !== undefined && Date.parse(ultimaPregunta.creado_en) >= desdeRangoMs;

    embudo = calcularEmbudo({
      ahoraMs,
      rango,
      escribieron: escribieron.filas.map(
        (f) => uno(f.wa_conversaciones)?.contacto_id ?? `conv:${f.conversacion_id}`
      ),
      preguntaron: preguntasFilas
        .filter((f) => Date.parse(f.creadoEn) >= desdeRangoMs && preguntaPrecio(f.texto, f.transcripcion))
        .map((f) => f.contactoId),
      citas: citasFilas,
      incompleto: escribieron.truncado || citas.truncado || preguntasCortadasDentroDelRango,
    });
  }

  /* 3 y 4. Oportunidades (la lista de Recuperación sale de acá). */
  const oportunidades: Oportunidades | null =
    preguntas.fallo || citas.fallo
      ? null
      : calcularOportunidades({
          ahoraMs,
          preguntas: preguntasFilas,
          citas: citasFilas,
          servicios: nombresServicios,
          negocio,
          trato,
          limite: LIMITE_LISTA,
          limiteRecuperables: LIMITE_RECUPERABLES,
          incompleto: preguntas.truncado || citas.truncado,
        });

  /* 2. Ventas. */
  const ventas: Ventas | null =
    cumplidas.fallo || cumplidasPasado.fallo || sinMarcar.error
      ? null
      : calcularVentas({
          mes: nombreMesCR(ahoraMs),
          mesPasado: nombreMesCR(mitadMesAnteriorMs(ahoraMs)),
          cumplidas: cumplidas.filas,
          cumplidasMesPasado: cumplidasPasado.filas,
          pasadasSinMarcar: sinMarcar.count ?? 0,
          incompleto: cumplidas.truncado || cumplidasPasado.truncado,
        });

  return { rango, embudo, ventas, oportunidades };
}

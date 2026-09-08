"use server";

/* ==========================================================================
   Registrar en la fila las piezas que el cliente ya subió a ImageKit.

   El navegador sube el archivo directo a ImageKit y nos pasa la URL y el
   fileId. Acá se guarda una fila en `cola` por pieza (o una sola con varias
   imágenes si es carrusel), en estado `pendiente`. El `📤 Publicador (panel)`
   de n8n sondea `cola`, valida los límites de verdad y publica.

   Es un Server Action = endpoint POST público: vuelve a comprobar la sesión
   y que el cliente tenga contratada la automatización de redes.
   ========================================================================== */
import { revalidatePath } from "next/cache";
import { supabaseServidor } from "@/lib/supabase/servidor";
import { getAsignacion, getPerfil } from "./datos";

export type PiezaSubida = {
  url: string;
  fileId: string;
  nombre: string;
  esVideo: boolean;
  /** Instrucción propia de ESA pieza (retoque + contexto). Ya armada en el
      cliente: "mejorala. es la promo de setiembre". */
  instruccion: string;
  /** Frase de retoque de ESA foto ("quitale el fondo" / "mejorala" / ""). Se
      usa para el retoque por foto dentro de un carrusel. */
  retoque: string;
};

export type OpcionesPieza = {
  redes: string[];
  /** ISO date (yyyy-mm-dd) o vacío para "sin fecha". */
  programadaPara: string;
  /** true = todas las fotos van en UN post (carrusel / álbum). */
  carrusel: boolean;
};

export type ResultadoContenido =
  | { ok: true; mensaje: string; cuantas: number }
  | { ok: false; error: string };

const SLUG_REDES = "redes-sociales";

export async function registrarPiezas(
  piezas: PiezaSubida[],
  opciones: OpcionesPieza
): Promise<ResultadoContenido> {
  const perfil = await getPerfil();
  if (perfil.rol !== "cliente" && perfil.rol !== "admin") {
    return { ok: false, error: "No autorizado." };
  }
  if (!perfil.clienteId) {
    return { ok: false, error: "Tu cuenta no está ligada a un negocio." };
  }
  if (!Array.isArray(piezas) || piezas.length === 0) {
    return { ok: false, error: "No llegó ninguna pieza." };
  }
  if (piezas.length > 20) {
    return { ok: false, error: "Máximo 20 piezas por tanda." };
  }

  const asignacion = await getAsignacion(SLUG_REDES);
  if (!asignacion) {
    return {
      ok: false,
      error: "No tenés la automatización de Redes sociales contratada.",
    };
  }

  const programadaPara =
    opciones.programadaPara && /^\d{4}-\d{2}-\d{2}$/.test(opciones.programadaPara)
      ? new Date(`${opciones.programadaPara}T09:00:00`).toISOString()
      : null;

  const redes = (opciones.redes ?? [])
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);

  const base = {
    cliente_id: perfil.clienteId,
    asignacion_id: asignacion.id,
    redes,
    programada_para: programadaPara,
    estado: "pendiente" as const,
  };

  const carrusel = opciones.carrusel && piezas.length > 1;

  const filas = carrusel
    ? [
        {
          ...base,
          tipo: "imagen",
          url_imagekit: piezas[0].url, // portada
          imagekit_file_id: piezas[0].fileId || null,
          imagenes: piezas.map((p) => p.url),
          // retoque por foto, paralelo a `imagenes`
          retoques: piezas.map((p) => (p.retoque ?? "").slice(0, 120)),
          es_carrusel: true,
          // la instrucción de la fila es sólo el contexto (para el texto)
          instruccion: (piezas[0].instruccion ?? "").trim().slice(0, 600) || null,
        },
      ]
    : piezas.map((p) => ({
        ...base,
        tipo: p.esVideo ? "video" : "imagen",
        url_imagekit: p.url,
        imagekit_file_id: p.fileId || null,
        imagenes: [] as string[],
        es_carrusel: false,
        instruccion: (p.instruccion ?? "").trim().slice(0, 600) || null,
      }));

  const supabase = await supabaseServidor();
  let { error } = await supabase.from("cola").insert(filas);

  // Antes de la migración de carrusel, `imagenes`/`es_carrusel` no existen:
  // reintentá sin esas columnas (el carrusel se guarda como fotos sueltas).
  let degradado = false;
  if (error) {
    degradado = carrusel;
    const sinNuevas = piezas.map((p) => ({
      cliente_id: perfil.clienteId,
      asignacion_id: asignacion.id,
      redes,
      programada_para: programadaPara,
      estado: "pendiente" as const,
      tipo: p.esVideo ? "video" : "imagen",
      url_imagekit: p.url,
      imagekit_file_id: p.fileId || null,
      instruccion: (p.instruccion ?? "").trim().slice(0, 600) || null,
    }));
    ({ error } = await supabase.from("cola").insert(sinNuevas));
  }

  if (error) {
    return { ok: false, error: "No se pudo guardar en la fila. Probá de nuevo." };
  }

  revalidatePath("/panel");
  revalidatePath(`/panel/automatizaciones/${SLUG_REDES}`);

  if (carrusel && !degradado) {
    return {
      ok: true,
      cuantas: 1,
      mensaje: `Carrusel de ${piezas.length} fotos en fila.${
        programadaPara ? " Sale el día elegido." : " Sale en el próximo turno."
      }`,
    };
  }
  const n = degradado ? piezas.length : filas.length;
  return {
    ok: true,
    cuantas: n,
    mensaje: programadaPara
      ? `${n} ${n === 1 ? "pieza queda" : "piezas quedan"} en fila para el día elegido.`
      : `${n} ${n === 1 ? "pieza queda" : "piezas quedan"} en fila. Salen en el próximo turno si no les ponés fecha.`,
  };
}

/* -------------------------------------------------------------------------
   Cancelar una pieza de la fila. El cliente puede frenar lo que todavía no
   se publicó. RLS `cola_editar` deja al cliente actualizar SU fila.
   ------------------------------------------------------------------------- */
const CANCELABLES = ["pendiente", "en_retoque", "programada"];

export async function cancelarPieza(
  _prev: ResultadoContenido | null,
  form: FormData
): Promise<ResultadoContenido> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) {
    return { ok: false, error: "Tu cuenta no está ligada a un negocio." };
  }
  const piezaId = String(form.get("piezaId") ?? "");
  if (!piezaId) return { ok: false, error: "Falta la pieza." };

  const supabase = await supabaseServidor();
  const { data: pieza } = await supabase
    .from("cola")
    .select("id, estado")
    .eq("id", piezaId)
    .eq("cliente_id", perfil.clienteId)
    .maybeSingle();

  if (!pieza) return { ok: false, error: "Esa pieza no es tuya." };
  if (!CANCELABLES.includes(pieza.estado)) {
    return { ok: false, error: "Esa pieza ya no se puede cancelar." };
  }

  const { error } = await supabase
    .from("cola")
    .update({ estado: "cancelada" })
    .eq("id", piezaId);
  if (error) return { ok: false, error: "No se pudo cancelar. Probá de nuevo." };

  revalidatePath("/panel");
  revalidatePath(`/panel/automatizaciones/${SLUG_REDES}`);
  return { ok: true, cuantas: 1, mensaje: "Pieza cancelada." };
}

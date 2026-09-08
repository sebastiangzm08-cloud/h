"use server";

/* ==========================================================================
   Conectar Buffer.

   Buffer no permite OAuth de terceros, así que el cliente crea un
   "Personal Access" token en Buffer → menú de su organización → API →
   Personal Access → New Key, y lo pega acá.

   Lo VERIFICAMOS contra la API nueva de Buffer (GraphQL, api.buffer.com):
     1. `account { organizations { id } }` → confirma que el token sirve
     2. `channels(input: { organizationId }) { id service ... }` → los canales
   Si hay Instagram/Facebook/TikTok, guardamos token + canales (id:red) y
   marcamos "conectada". El token queda en `conexiones.detalle` (jsonb) — que
   NUNCA se manda al navegador del cliente: sólo lo lee n8n.

   Escribe con `supabaseAdmin()`: `conexiones` no tiene política de INSERT
   para el cliente (a propósito).
   ========================================================================== */
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/servidor";
import { getPerfil } from "./datos";

export type ResultadoConexion =
  | { ok: true; mensaje: string }
  | { ok: false; error: string };

const BUFFER_API = "https://api.buffer.com";
const REDES_OK = ["instagram", "facebook", "tiktok"];
const NOMBRE: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

const COMO_SACAR_TOKEN =
  "Creá uno nuevo en Buffer: menú de tu organización (abajo a la izquierda) → API → Personal Access → New Key. Copiá el token completo.";

type CanalBuffer = {
  id?: string;
  service?: string;
  displayName?: string;
  name?: string;
};

async function bufferGraphQL(token: string, query: string): Promise<Response> {
  return fetch(BUFFER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
}

export async function guardarBuffer(
  _prev: ResultadoConexion | null,
  form: FormData
): Promise<ResultadoConexion> {
  const perfil = await getPerfil();
  if (!perfil.clienteId) {
    return { ok: false, error: "Tu cuenta no está ligada a un negocio." };
  }

  const token = String(form.get("buffer") ?? "").trim().slice(0, 300);
  if (!token) return { ok: false, error: "Pegá tu token de Buffer." };

  /* 1. Validar el token y sacar la(s) organización(es). */
  let orgIds: string[] = [];
  try {
    const r = await bufferGraphQL(
      token,
      "query { account { organizations { id } } }"
    );
    if (r.status === 401 || r.status === 403) {
      return { ok: false, error: `Ese token no funcionó. ${COMO_SACAR_TOKEN}` };
    }
    if (!r.ok) {
      return { ok: false, error: "Buffer no respondió. Probá de nuevo en un momento." };
    }
    const body = await r.json();
    if (Array.isArray(body?.errors) && body.errors.length > 0) {
      const msg = String(body.errors[0]?.message ?? "").slice(0, 140);
      return {
        ok: false,
        error: msg
          ? `Buffer rechazó el token: "${msg}". ${COMO_SACAR_TOKEN}`
          : `Ese token no funcionó. ${COMO_SACAR_TOKEN}`,
      };
    }
    orgIds = (body?.data?.account?.organizations ?? [])
      .map((o: { id?: string }) => String(o?.id ?? ""))
      .filter(Boolean);
  } catch {
    return { ok: false, error: "No pudimos hablar con Buffer. Probá de nuevo." };
  }
  if (orgIds.length === 0) {
    return {
      ok: false,
      error: "El token sirve pero no encontramos ninguna organización en tu Buffer.",
    };
  }

  /* 2. Traer los canales de cada organización. */
  let canalesRaw: CanalBuffer[] = [];
  try {
    for (const orgId of orgIds) {
      const q = `query { channels(input: { organizationId: ${JSON.stringify(
        orgId
      )} }) { id service displayName name } }`;
      const r = await bufferGraphQL(token, q);
      if (!r.ok) continue;
      const body = await r.json();
      if (Array.isArray(body?.data?.channels)) {
        canalesRaw = canalesRaw.concat(body.data.channels as CanalBuffer[]);
      }
    }
  } catch {
    return { ok: false, error: "No pudimos leer tus canales de Buffer. Probá de nuevo." };
  }

  const usables = canalesRaw
    .map((c) => {
      const raw = String(c.service ?? "").toLowerCase();
      // Buffer a veces devuelve "facebookpage", "instagrambusiness", etc.
      const service = REDES_OK.find((red) => raw.startsWith(red)) ?? raw;
      return {
        id: String(c.id ?? ""),
        service,
        nombre: c.displayName || c.name || NOMBRE[service] || "",
      };
    })
    .filter((c) => c.id && REDES_OK.includes(c.service));

  const admin = supabaseAdmin();

  if (usables.length === 0) {
    /* Token válido pero sin redes conectadas: se guarda para no perderlo,
       pero la conexión NO queda lista. */
    await admin.from("conexiones").upsert(
      {
        cliente_id: perfil.clienteId,
        servicio: "buffer",
        referencia_externa: "Token verificado · sin redes aún",
        estado: "sin_conectar",
        detalle: { token },
      },
      { onConflict: "cliente_id,servicio" }
    );
    revalidatePath("/panel/conexiones");
    return {
      ok: false,
      error:
        "El token sirve, pero no hay Instagram, Facebook ni TikTok conectados en tu Buffer. Conectalos allá y volvé a mandarlo.",
    };
  }

  const canales = usables.map((p) => `${p.id}:${p.service}`).join(", ");
  const displayRef = usables
    .map((p) => `${NOMBRE[p.service] ?? p.service} ${p.nombre}`.trim())
    .join(" · ");

  const fila = {
    cliente_id: perfil.clienteId,
    servicio: "buffer",
    referencia_externa: displayRef,
    estado: "conectada",
    detalle: { token, canales, perfiles: usables },
  };
  let { error } = await admin
    .from("conexiones")
    .upsert(fila, { onConflict: "cliente_id,servicio" });

  // Antes de la migración, la columna `detalle` no existe: guardá sin ella
  // (el token queda en referencia_externa como respaldo).
  if (error) {
    const { detalle: _d, ...sinDetalle } = fila;
    void _d;
    ({ error } = await admin
      .from("conexiones")
      .upsert(
        { ...sinDetalle, referencia_externa: `${displayRef} · ${token}` },
        { onConflict: "cliente_id,servicio" }
      ));
  }
  if (error) return { ok: false, error: "No se pudo guardar. Probá de nuevo." };

  revalidatePath("/panel/conexiones");
  revalidatePath("/panel");
  const n = usables.length;
  return {
    ok: true,
    mensaje: `Conectado. Detecté ${n} ${n === 1 ? "red" : "redes"}: ${displayRef}.`,
  };
}

/* ==========================================================================
   Acciones del panel admin — las que ESCRIBEN.

   NO SON Server Actions — son funciones normales que llama la ruta
   `/api/admin/[nombre]/route.ts` por POST. Antes eran `"use server"`, pero
   los Server Actions perdían la cookie de sesión en el POST detrás del
   proxy (se confirmó en dos plataformas distintas: Netlify y este VPS, con
   evidencia real — bolsa de cookies contra el servidor en vivo, y una
   réplica completa de la librería de Supabase del navegador). Un Route
   Handler normal, en cambio, se probó de punta a punta y sí conserva la
   cookie. De ahí el cambio de arquitectura completo.

   Siguen siendo un endpoint POST público (cualquiera con la URL puede
   llamarlas), así que cada una vuelve a comprobar que quien la llama es
   admin con `exigirAdmin()`.

   `crearCuentaCliente` usa `supabaseAdmin()` (service_role) porque crear
   una cuenta de acceso es lo único que RLS no permite hacer al admin.
   ========================================================================== */
import { revalidatePath } from "next/cache";
import {
  supabaseAdmin,
  supabaseConToken,
  supabaseServidor,
} from "@/lib/supabase/servidor";
import { getAutomatizacion, getPerfil } from "./datos";
import {
  PLANTILLA_RECORDATORIO_CUERPO,
  PLANTILLA_RECORDATORIO_EJEMPLO,
  PLANTILLA_RECORDATORIO_IDIOMA,
  PLANTILLA_RECORDATORIO_NOMBRE,
  PLANTILLAS_RECORDATORIO_MANUAL,
} from "./agente-plantillas";

export type ResultadoAccion =
  | { ok: true; mensaje: string; datos?: Record<string, unknown> }
  | { ok: false; error: string };

/**
 * Portón de las acciones del admin. Devuelve `null` si quien llama es admin,
 * o un `ResultadoAccion` de error si no.
 *
 * El camino normal es la cookie de sesión, que se mantiene viva gracias al
 * refresco de `src/proxy.ts`. Los otros dos son red de seguridad:
 *   1. Cookie de sesión (lo habitual).
 *   2. Token en el cuerpo del POST — el `<CampoToken>` del formulario lo manda
 *      y acá se revalida contra Supabase con `getUser(token)`.
 *   3. Cookie válida pero la consulta a `perfiles` falló — se relee el rol con
 *      service_role.
 */
async function exigirAdmin(form?: FormData): Promise<ResultadoAccion | null> {
  // 1. Camino normal: perfil del cliente autenticado (respeta RLS).
  const perfil = await getPerfil();
  if (perfil.rol === "admin") return null;

  // 2. Token en el cuerpo del POST. Es el token del propio usuario; lo
  //    revalidamos contra Supabase (getUser pega contra el servidor de auth),
  //    así que un token falso o vencido no pasa.
  const token = form?.get("_token");
  if (typeof token === "string" && token.length > 20) {
    try {
      const { data: u } = await supabaseConToken(token).auth.getUser(token);
      const uid = u.user?.id;
      if (uid) {
        const { data } = await supabaseAdmin()
          .from("perfiles")
          .select("rol")
          .eq("id", uid)
          .maybeSingle();
        if (data?.rol === "admin") return null;
        console.error(
          `[exigirAdmin] token ok uid=${uid} rol=${data?.rol ?? "?"} — no es admin`
        );
      } else {
        console.error("[exigirAdmin] el _token del form no validó contra Supabase");
      }
    } catch (e) {
      console.error("[exigirAdmin] error validando _token:", (e as Error).message);
    }
  }

  // 3. Última red: la cookie llegó (tenemos uid) pero la consulta de perfil
  //    del camino 1 falló. Releer el rol con service_role.
  if (perfil.id !== "sin-sesion") {
    const { data } = await supabaseAdmin()
      .from("perfiles")
      .select("rol")
      .eq("id", perfil.id)
      .maybeSingle();
    if (data?.rol === "admin") return null;
    console.error(
      `[exigirAdmin] uid ${perfil.id} no es admin ni por service_role (rol=${data?.rol ?? "?"})`
    );
  }

  console.error(
    `[exigirAdmin] sin autorización — perfil.id=${perfil.id}, _token=${
      typeof token === "string" && token ? "presente" : "ausente"
    }`
  );
  return { ok: false, error: "No autorizado." };
}

/* -------------------------------------------------------------------------
   Alta de cliente

   Crea las TRES cosas que necesita un cliente para entrar:
   1. la cuenta de acceso (auth) con contraseña, ya confirmada
   2. la fila del negocio (clientes)
   3. el perfil que une cuenta ↔ negocio (perfiles)

   Si algo falla a mitad, deshace lo que alcanzó a crear: nada de clientes
   fantasma sin perfil ni cuentas sin negocio.
   ------------------------------------------------------------------------- */
export async function crearCuentaCliente(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const nombreNegocio = String(form.get("nombreNegocio") ?? "").trim();
  const personaContacto = String(form.get("personaContacto") ?? "").trim();
  const correo = String(form.get("correo") ?? "").trim().toLowerCase();
  const whatsapp = String(form.get("whatsapp") ?? "").trim();
  const rubro = String(form.get("rubro") ?? "").trim();
  const plan = String(form.get("plan") ?? "Básico").trim();
  const clave = String(form.get("clave") ?? "");
  const slugAuto = String(form.get("automatizacion") ?? "").trim();
  const precioRaw = String(form.get("precioAsignacion") ?? "").trim();

  if (!nombreNegocio || !correo || !clave) {
    return { ok: false, error: "Faltan el negocio, el correo o la contraseña." };
  }
  if (clave.length < 8) {
    return { ok: false, error: "La contraseña necesita al menos 8 caracteres." };
  }
  if (!/^\S+@\S+\.\S+$/.test(correo)) {
    return { ok: false, error: "Ese correo no tiene buena pinta." };
  }

  const admin = supabaseAdmin();

  // 1. Cuenta de acceso
  const { data: creado, error: eAuth } = await admin.auth.admin.createUser({
    email: correo,
    password: clave,
    email_confirm: true,
  });
  if (eAuth || !creado.user) {
    const m = (eAuth?.message ?? "").toLowerCase();
    if (m.includes("already been registered") || m.includes("already exists")) {
      return { ok: false, error: "Ya existe una cuenta con ese correo." };
    }
    return { ok: false, error: "No se pudo crear la cuenta de acceso." };
  }
  const uid = creado.user.id;

  // 2. Ficha del negocio
  const { data: cli, error: eCli } = await admin
    .from("clientes")
    .insert({
      nombre_negocio: nombreNegocio,
      rubro: rubro || null,
      persona_contacto: personaContacto || null,
      correo,
      whatsapp: whatsapp || null,
      plan,
      estado: "prueba",
    })
    .select("id")
    .single();

  if (eCli || !cli) {
    await admin.auth.admin.deleteUser(uid); // deshacer la cuenta
    const m = (eCli?.message ?? "").toLowerCase();
    if (m.includes("duplicate") && m.includes("correo")) {
      return { ok: false, error: "Ya hay un cliente con ese correo." };
    }
    return { ok: false, error: "Se creó la cuenta pero falló el registro del negocio. Se deshizo." };
  }

  // 3. Perfil que une los dos
  const { error: ePer } = await admin.from("perfiles").insert({
    id: uid,
    rol: "cliente",
    cliente_id: cli.id,
    nombre: personaContacto || nombreNegocio,
  });

  if (ePer) {
    await admin.from("clientes").delete().eq("id", cli.id);
    await admin.auth.admin.deleteUser(uid);
    return { ok: false, error: "Falló el último paso (perfil). Se deshizo todo." };
  }

  // 4. Asignar la automatización elegida (opcional). Si falla, el cliente
  //    igual queda creado — se asigna a mano desde su ficha.
  let autoAsignada = "";
  let avisoAuto = "";
  if (slugAuto) {
    const producto = await getAutomatizacion(slugAuto);
    const { data: cat } = await admin
      .from("catalogo_automatizaciones")
      .select("id, nombre")
      .eq("slug", slugAuto)
      .maybeSingle();

    if (!producto || !cat) {
      avisoAuto = " No se pudo asignar la automatización (no está en el catálogo); hacelo desde su ficha.";
    } else {
      const precioNum = Number(precioRaw);
      const precio =
        precioRaw !== "" && Number.isFinite(precioNum) && precioNum >= 0
          ? precioNum
          : producto.precioMensual ?? 0;
      const { error: eAsg } = await admin.from("asignaciones").insert({
        cliente_id: cli.id,
        automatizacion_id: cat.id,
        estado: "activa",
        precio_mensual: precio,
        limites: producto.limitesSugeridos ?? {},
      });
      if (eAsg) {
        avisoAuto = " El cliente quedó creado pero falló asignar la automatización; hacelo desde su ficha.";
      } else {
        autoAsignada = cat.nombre;
      }
    }
  }

  revalidatePath("/panel/admin/clientes");
  revalidatePath("/panel/admin");

  const dominio =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "tu-dominio";
  const quien = personaContacto || "el cliente";
  const mensaje = [
    `✅ Cuenta creada para ${nombreNegocio}${
      autoAsignada ? ` con ${autoAsignada}` : ""
    }.`,
    "",
    `Mandale a ${quien}:`,
    `• Link: ${dominio}/acceso`,
    `• Correo: ${correo}`,
    `• Contraseña: ${clave}`,
    "",
    "Que entre y complete su perfil, conecte Buffer y suba sus primeras fotos.",
    "La contraseña no queda guardada — pasásela ahora.",
  ].join("\n") + avisoAuto;

  return {
    ok: true,
    mensaje,
    /* Para que la Alta guiada sepa a quién le siguió el paso 2 (conectar
       WhatsApp) sin tener que ir a buscarlo — nunca se parsea del texto. */
    datos: { clienteId: cli.id, esAgenteWhatsapp: slugAuto === "agente-whatsapp" },
  };
}

/* -------------------------------------------------------------------------
   Asignar una automatización a un cliente

   Busca la automatización en el catálogo de la base por su slug. Si el
   catálogo todavía no está sembrado, lo dice claro en vez de fallar feo.
   ------------------------------------------------------------------------- */
export async function asignarAutomatizacion(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const clienteId = String(form.get("clienteId") ?? "");
  const slug = String(form.get("slug") ?? "");
  const precio = Number(form.get("precio") ?? 0);

  if (!clienteId || !slug) {
    return { ok: false, error: "Elegí el cliente y la automatización." };
  }

  const supabase = await supabaseServidor();

  const { data: cat, error: eCat } = await supabase
    .from("catalogo_automatizaciones")
    .select("id, nombre")
    .eq("slug", slug)
    .maybeSingle();

  if (eCat) return { ok: false, error: "No se pudo leer el catálogo." };
  if (!cat) {
    return {
      ok: false,
      error:
        "Esa automatización no está en el catálogo de la base todavía. Hay que sembrar `catalogo_automatizaciones` primero.",
    };
  }

  // Los límites por defecto del producto se copian a la asignación; después
  // se ajustan por cliente si hace falta.
  const producto = await getAutomatizacion(slug);
  const limites = producto?.limitesSugeridos ?? {};

  const { error: eAsg } = await supabase.from("asignaciones").insert({
    cliente_id: clienteId,
    automatizacion_id: cat.id,
    estado: "activa",
    precio_mensual: Number.isFinite(precio) ? precio : 0,
    limites,
  });

  if (eAsg) {
    const m = eAsg.message.toLowerCase();
    if (m.includes("duplicate")) {
      return { ok: false, error: "Ese cliente ya tiene esa automatización." };
    }
    return { ok: false, error: "No se pudo asignar. Probá de nuevo." };
  }

  revalidatePath("/panel/admin/clientes");
  revalidatePath("/panel/admin/asignar");

  return { ok: true, mensaje: `${cat.nombre} asignada.` };
}

/* -------------------------------------------------------------------------
   Conectar el WhatsApp de un cliente

   Reemplaza el INSERT a mano en `conexiones` de cada alta nueva. Antes de
   guardar nada, comprueba el `phone_number_id` + token contra la Graph API
   de Meta de verdad — si el token está mal copiado o vencido, Meta lo dice
   ACÁ, no en la primera prueba real con el cliente. Nunca se guarda como
   "conectada" una credencial que Meta no confirmó (mismo principio que
   `wa_reservar_cita`: comprobar antes de hablar).

   `detalle.asignacion_id` es LEÍDO por el workflow de n8n (nodo "⚙️ Cómo
   debe responder") para saber de cuál `asignaciones` sacar la config del
   agente — sin él, cualquier mensaje de este número tumba la ejecución
   ("invalid input syntax for type uuid: null"). Se resuelve acá siempre
   (nunca a mano) y se hace merge con lo que ya hubiera en `detalle`, para
   no perder ese ni ningún otro dato que ya estuviera guardado ahí.
   ------------------------------------------------------------------------- */
export async function conectarWhatsapp(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const clienteId = String(form.get("clienteId") ?? "");
  const phoneNumberId = String(form.get("phoneNumberId") ?? "").trim();
  const token = String(form.get("token") ?? "").trim();
  const wabaId = String(form.get("wabaId") ?? "").trim();
  const endpoint =
    String(form.get("endpoint") ?? "").trim() || "https://graph.facebook.com/v21.0";

  if (!clienteId) return { ok: false, error: "Falta el cliente." };
  if (!phoneNumberId || !token) {
    return { ok: false, error: "Falta el ID del número o el token." };
  }

  const admin = supabaseAdmin();

  const { data: asignacion } = await admin
    .from("asignaciones")
    .select("id, catalogo_automatizaciones!inner(slug)")
    .eq("cliente_id", clienteId)
    .eq("catalogo_automatizaciones.slug", "agente-whatsapp")
    .maybeSingle();
  if (!asignacion) {
    return {
      ok: false,
      error: "Este cliente todavía no tiene asignado el Agente de WhatsApp — asignáselo primero desde su ficha.",
    };
  }

  // Comprobar contra Meta ANTES de guardar nada.
  let numeroVerificado = "";
  let nombreVerificado = "";
  try {
    const res = await fetch(
      `${endpoint}/${phoneNumberId}?fields=display_phone_number,verified_name`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const cuerpo = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = cuerpo?.error?.message || `Meta respondió ${res.status}`;
      return { ok: false, error: `Meta rechazó esos datos: ${msg}` };
    }
    numeroVerificado = cuerpo.display_phone_number ?? "";
    nombreVerificado = cuerpo.verified_name ?? "";
  } catch (e) {
    return { ok: false, error: `No se pudo comprobar con Meta: ${(e as Error).message}` };
  }

  const { data: actual } = await admin
    .from("conexiones")
    .select("detalle")
    .eq("cliente_id", clienteId)
    .eq("servicio", "whatsapp")
    .maybeSingle();

  const { error } = await admin.from("conexiones").upsert(
    {
      cliente_id: clienteId,
      servicio: "whatsapp",
      estado: "conectada",
      referencia_externa: numeroVerificado || phoneNumberId,
      detalle: {
        ...(actual?.detalle as Record<string, unknown> | null),
        phone_number_id: phoneNumberId,
        token,
        endpoint,
        asignacion_id: asignacion.id,
        ...(wabaId ? { waba_id: wabaId } : {}),
      },
    },
    { onConflict: "cliente_id,servicio" }
  );
  if (error) return { ok: false, error: "Meta lo confirmó pero no se pudo guardar. Probá de nuevo." };

  revalidatePath(`/panel/admin/clientes/${clienteId}`);
  revalidatePath("/panel/admin/clientes");

  // Mejor esfuerzo: en cuanto hay WABA, dejar sembrada la plantilla que
  // necesitan los recordatorios de cita — así no queda como un paso aparte
  // que alguien se puede olvidar de hacer.
  const notaPlantilla = wabaId
    ? ` ${(await asegurarPlantillasRecordatorio(endpoint, wabaId, token)).mensaje}`
    : " Falta el WABA ID para dejar listas las plantillas de recordatorios — se pueden mandar después desde aquí mismo.";

  return {
    ok: true,
    mensaje: `WhatsApp conectado y confirmado con Meta: ${nombreVerificado || "sin nombre verificado"}${
      numeroVerificado ? ` (${numeroVerificado})` : ""
    }.${notaPlantilla}`,
  };
}

/**
 * Deja lista (o confirma que ya existe) UNA plantilla en la WABA de un
 * cliente. Idempotente a propósito: si Meta dice "ya existe" (mismo nombre +
 * idioma), eso se trata como éxito, no como error.
 */
async function mandarPlantilla(
  endpoint: string,
  wabaId: string,
  token: string,
  nombre: string,
  cuerpo: string,
  ejemplo: string[]
): Promise<{ ok: boolean; nombre: string; mensaje: string }> {
  try {
    const res = await fetch(`${endpoint}/${wabaId}/message_templates`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nombre,
        category: "UTILITY",
        language: PLANTILLA_RECORDATORIO_IDIOMA,
        components: [{ type: "BODY", text: cuerpo, example: { body_text: [ejemplo] } }],
      }),
    });
    const cuerpoResp = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, nombre, mensaje: "mandada a revisión" };
    const msg = String(cuerpoResp?.error?.error_user_msg || cuerpoResp?.error?.message || "");
    if (/existe|exists|duplicate/i.test(msg)) return { ok: true, nombre, mensaje: "ya existía" };
    return { ok: false, nombre, mensaje: msg || `código ${res.status}` };
  } catch (e) {
    return { ok: false, nombre, mensaje: (e as Error).message };
  }
}

/**
 * Deja listas (o confirma que ya existen) TODAS las plantillas que el
 * producto necesita — la de cita y las 3 de recordatorio manual — en la WABA
 * de un cliente. Se llama sola desde `conectarWhatsapp` cuando ya hay WABA
 * ID, y también se puede repetir a mano desde la ficha (botón "Reenviar
 * plantillas de recordatorio") si la primera vez falló o si el cliente no
 * tenía el WABA ID todavía.
 */
async function asegurarPlantillasRecordatorio(
  endpoint: string,
  wabaId: string,
  token: string
): Promise<{ ok: boolean; mensaje: string }> {
  const todas = [
    { nombre: PLANTILLA_RECORDATORIO_NOMBRE, cuerpo: PLANTILLA_RECORDATORIO_CUERPO, ejemplo: PLANTILLA_RECORDATORIO_EJEMPLO },
    ...PLANTILLAS_RECORDATORIO_MANUAL.map((p) => ({ nombre: p.nombrePlantilla, cuerpo: p.cuerpo, ejemplo: p.ejemplo })),
  ];

  const resultados = await Promise.all(
    todas.map((p) => mandarPlantilla(endpoint, wabaId, token, p.nombre, p.cuerpo, p.ejemplo))
  );

  const fallidas = resultados.filter((r) => !r.ok);
  if (fallidas.length === 0) {
    return { ok: true, mensaje: `Las ${resultados.length} plantillas de recordatorio quedaron listas (mandadas o ya existentes).` };
  }
  return {
    ok: false,
    mensaje: `${resultados.length - fallidas.length} de ${resultados.length} plantillas quedaron listas. Fallaron: ${fallidas
      .map((f) => `${f.nombre} (${f.mensaje})`)
      .join("; ")}.`,
  };
}

export async function reenviarPlantillaRecordatorio(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const clienteId = String(form.get("clienteId") ?? "");
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("conexiones")
    .select("detalle")
    .eq("cliente_id", clienteId)
    .eq("servicio", "whatsapp")
    .maybeSingle();

  const detalle = (data?.detalle ?? {}) as Record<string, unknown>;
  const endpoint = String(detalle.endpoint || "https://graph.facebook.com/v21.0");
  const wabaId = String(detalle.waba_id || "");
  const token = String(detalle.token || "");

  if (!wabaId) return { ok: false, error: "Este cliente no tiene WABA ID guardado — agregalo reconectando el WhatsApp." };
  if (!token) return { ok: false, error: "Este cliente no tiene WhatsApp conectado." };

  const r = await asegurarPlantillasRecordatorio(endpoint, wabaId, token);
  return r.ok ? { ok: true, mensaje: r.mensaje } : { ok: false, error: r.mensaje };
}

/* -------------------------------------------------------------------------
   Conectar el correo de un cliente

   A propósito NO es un dominio de Hoshizora ni una casilla compartida:
   cada cliente trae su PROPIA casilla dedicada (un Gmail nuevo, por
   ejemplo) con una contraseña de aplicación — así las respuestas salen
   con la identidad del cliente, nunca con la de Hoshizora, y si algún
   cliente tiene problemas de reputación de correo, no salpica a nadie más.

   Comprueba la credencial en vivo contra el SMTP ANTES de guardar nada
   (mismo principio que `conectarWhatsapp`): una contraseña de aplicación
   mal copiada se ve acá, no en el primer correo real perdido.
   ------------------------------------------------------------------------- */
export async function conectarCorreo(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const clienteId = String(form.get("clienteId") ?? "");
  const correo = String(form.get("correo") ?? "").trim().toLowerCase();
  const claveApp = String(form.get("claveApp") ?? "").trim();
  const nombreRemitente = String(form.get("nombreRemitente") ?? "").trim();
  const imapHost = String(form.get("imapHost") ?? "imap.gmail.com").trim();
  const imapPort = Number(form.get("imapPort") ?? 993);
  const smtpHost = String(form.get("smtpHost") ?? "smtp.gmail.com").trim();
  const smtpPort = Number(form.get("smtpPort") ?? 465);

  if (!clienteId) return { ok: false, error: "Falta el cliente." };
  if (!correo || !claveApp) return { ok: false, error: "Falta el correo o la contraseña de aplicación." };

  const { data: asignacion } = await supabaseAdmin()
    .from("asignaciones")
    .select("id, catalogo_automatizaciones!inner(slug)")
    .eq("cliente_id", clienteId)
    .eq("catalogo_automatizaciones.slug", "agente-whatsapp")
    .maybeSingle();
  if (!asignacion) {
    return {
      ok: false,
      error: "Este cliente todavía no tiene asignado el Agente — asignáselo primero desde su ficha.",
    };
  }

  // Comprobar contra el SMTP de verdad ANTES de guardar nada. El mismo
  // usuario/clave sirve para IMAP (es la misma cuenta) — si el SMTP
  // autentica, el IMAP autentica.
  try {
    const nodemailer = await import("nodemailer");
    const transportador = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: correo, pass: claveApp },
    });
    await transportador.verify();
  } catch (e) {
    return { ok: false, error: `No se pudo autenticar: ${(e as Error).message}` };
  }

  const { error } = await supabaseAdmin().from("conexiones").upsert(
    {
      cliente_id: clienteId,
      servicio: "correo",
      estado: "conectada",
      referencia_externa: correo,
      detalle: {
        correo,
        clave_app: claveApp,
        nombre_remitente: nombreRemitente || undefined,
        imap_host: imapHost,
        imap_port: imapPort,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        asignacion_id: asignacion.id,
      },
    },
    { onConflict: "cliente_id,servicio" }
  );
  if (error) return { ok: false, error: "Se autenticó pero no se pudo guardar. Probá de nuevo." };

  revalidatePath(`/panel/admin/clientes/${clienteId}`);
  revalidatePath("/panel/admin/clientes");
  return { ok: true, mensaje: `Correo conectado y confirmado: ${correo}.` };
}

/* -------------------------------------------------------------------------
   Sembrar la agenda de un cliente nuevo (admin, en el alta)

   Mismo destino que `guardarAgenda` del propio cliente (`asignaciones.
   config.agenda` + `clientes.horario`) — pero gateado por `exigirAdmin` y
   con el `clienteId` explícito en el form, para que Sebastián se lo pueda
   dejar configurado ANTES de que el cliente entre por primera vez. El
   cliente lo puede seguir editando después desde su propio panel; esto
   solo evita que un cliente nuevo arranque con los valores por defecto
   (capacidad 1, sin horario) hasta que alguien se acuerde de tocarlo.
   ------------------------------------------------------------------------- */
const DIAS_AGENDA = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"] as const;

export async function sembrarAgenda(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const clienteId = String(form.get("clienteId") ?? "");
  if (!clienteId) return { ok: false, error: "Falta el cliente." };

  const admin = supabaseAdmin();
  const { data: asignaciones } = await admin
    .from("asignaciones")
    .select("id, config, catalogo_automatizaciones!inner(slug)")
    .eq("cliente_id", clienteId)
    .eq("catalogo_automatizaciones.slug", "agente-whatsapp");
  const asignacion = asignaciones?.[0];
  if (!asignacion) {
    return { ok: false, error: "Este cliente todavía no tiene asignado el Agente de WhatsApp." };
  }

  const num = (v: FormDataEntryValue | null, def: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  const nuevaAgenda = {
    activa: form.get("activa") === "on",
    capacidad: Math.min(20, Math.max(1, num(form.get("capacidad"), 1))),
    colchonMin: Math.min(120, Math.max(0, num(form.get("colchonMin"), 0))),
    anticipacionMin: Math.min(1440, Math.max(0, num(form.get("anticipacionMin"), 60))),
    maximoDiasAdelante: Math.min(90, Math.max(1, num(form.get("maximoDiasAdelante"), 30))),
  };

  const horario: Record<string, [string, string][]> = {};
  for (const dia of DIAS_AGENDA) {
    const cerrado = form.get(`cerrado_${dia}`) === "on";
    const ini = String(form.get(`ini_${dia}`) ?? "");
    const fin = String(form.get(`fin_${dia}`) ?? "");
    horario[dia] = cerrado || !ini || !fin ? [] : [[ini, fin]];
  }

  const config = (asignacion.config ?? {}) as Record<string, unknown>;
  const { error: e1 } = await admin
    .from("asignaciones")
    .update({ config: { ...config, agenda: nuevaAgenda } })
    .eq("id", asignacion.id);
  if (e1) return { ok: false, error: e1.message };

  const { error: e2 } = await admin.from("clientes").update({ horario }).eq("id", clienteId);
  if (e2) return { ok: false, error: e2.message };

  revalidatePath(`/panel/admin/clientes/${clienteId}`);
  return { ok: true, mensaje: "Agenda sembrada. El cliente ya puede seguir ajustándola desde su panel." };
}

/* -------------------------------------------------------------------------
   Suspender / reactivar el servicio de un cliente

   Suspender = el servicio queda apagado (falta de pago o pausa a pedido).
   El cliente y sus automatizaciones pasan a "pausado"; el panel del cliente
   muestra el aviso y n8n deja de publicar (comprueba `asignaciones.estado`).
   ------------------------------------------------------------------------- */
async function fijarEstadoCliente(
  clienteId: string,
  estadoCliente: "activo" | "pausado",
  estadoAsig: "activa" | "pausada",
  form?: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;
  if (!clienteId) return { ok: false, error: "Falta el cliente." };

  // service_role: `cobros` y algunas tablas no tienen GRANT de UPDATE para
  // `authenticated`. La acción ya está detrás de `exigirAdmin()`.
  const supabase = supabaseAdmin();
  const a = await supabase
    .from("clientes")
    .update({ estado: estadoCliente })
    .eq("id", clienteId);
  const b = await supabase
    .from("asignaciones")
    .update({ estado: estadoAsig })
    .eq("cliente_id", clienteId);

  if (a.error || b.error) {
    return { ok: false, error: "No se pudo cambiar el estado." };
  }

  revalidatePath("/panel/admin/clientes");
  revalidatePath(`/panel/admin/clientes/${clienteId}`);
  return {
    ok: true,
    mensaje:
      estadoCliente === "pausado"
        ? "Servicio suspendido. El cliente lo ve pausado y n8n deja de publicar."
        : "Servicio reactivado.",
  };
}

export async function suspenderCliente(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  return fijarEstadoCliente(
    String(form.get("clienteId") ?? ""),
    "pausado",
    "pausada",
    form
  );
}

export async function reactivarCliente(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  return fijarEstadoCliente(
    String(form.get("clienteId") ?? ""),
    "activo",
    "activa",
    form
  );
}

/* -------------------------------------------------------------------------
   Marcar un cobro como pagado

   Si con esto el cliente queda sin cobros pendientes ni vencidos y estaba
   suspendido, se reactiva solo.
   ------------------------------------------------------------------------- */
export async function marcarCobroPagado(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const cobroId = String(form.get("cobroId") ?? "");
  const clienteId = String(form.get("clienteId") ?? "");
  const metodo = String(form.get("metodo") ?? "SINPE Móvil").trim();
  if (!cobroId || !clienteId) return { ok: false, error: "Faltan datos del cobro." };

  const supabase = supabaseAdmin();
  const up = await supabase
    .from("cobros")
    .update({ estado: "pagado", metodo, pagado_en: new Date().toISOString() })
    .eq("id", cobroId)
    .eq("cliente_id", clienteId);
  if (up.error) return { ok: false, error: "No se pudo registrar el pago." };

  // ¿Queda algo sin pagar?
  const { data: pendientes } = await supabase
    .from("cobros")
    .select("id")
    .eq("cliente_id", clienteId)
    .in("estado", ["pendiente", "vencido"]);

  let mensaje = "Pago registrado.";
  if (!pendientes || pendientes.length === 0) {
    const { data: cli } = await supabase
      .from("clientes")
      .select("estado")
      .eq("id", clienteId)
      .maybeSingle();
    if (cli && (cli.estado === "pausado" || cli.estado === "moroso")) {
      await fijarEstadoCliente(clienteId, "activo", "activa", form);
      mensaje = "Pago registrado y servicio reactivado.";
    }
  }

  revalidatePath(`/panel/admin/clientes/${clienteId}`);
  revalidatePath("/panel/admin/clientes");
  revalidatePath("/panel/admin/pagos");
  return { ok: true, mensaje };
}

/* -------------------------------------------------------------------------
   Precio de una automatización ya asignada

   El precio por cliente puede cambiar (precio de fundador, ajuste, etc.).
   Esto toca `asignaciones.precio_mensual`, que es la tarifa estándar. Un
   mes puntual distinto por una promo se maneja con el `monto` del cobro
   (ver `crearCobro`), no acá.
   ------------------------------------------------------------------------- */
export async function cambiarPrecioAsignacion(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const asignacionId = String(form.get("asignacionId") ?? "");
  const clienteId = String(form.get("clienteId") ?? "");
  const precio = Number(form.get("precio") ?? -1);
  if (!asignacionId) return { ok: false, error: "Falta la asignación." };
  if (!Number.isFinite(precio) || precio < 0) {
    return { ok: false, error: "Poné un precio válido (0 o más)." };
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("asignaciones")
    .update({ precio_mensual: Math.round(precio) })
    .eq("id", asignacionId);
  if (error) return { ok: false, error: "No se pudo guardar el precio." };

  if (clienteId) revalidatePath(`/panel/admin/clientes/${clienteId}`);
  revalidatePath("/panel/admin/clientes");
  return { ok: true, mensaje: "Precio actualizado." };
}

/* -------------------------------------------------------------------------
   Crear un cobro de un mes

   Acá va el importe REAL de ese mes: normalmente la suma de las
   automatizaciones activas, pero se puede bajar por una promo o ajustar por
   lo que sea. Queda en estado `pendiente`.
   ------------------------------------------------------------------------- */
export async function crearCobro(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const clienteId = String(form.get("clienteId") ?? "");
  const periodo = String(form.get("periodo") ?? "").trim().slice(0, 40);
  const monto = Number(form.get("monto") ?? -1);
  if (!clienteId || !periodo) {
    return { ok: false, error: "Poné el periodo (ej. Octubre 2026)." };
  }
  if (!Number.isFinite(monto) || monto < 0) {
    return { ok: false, error: "Poné un monto válido." };
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.from("cobros").insert({
    cliente_id: clienteId,
    periodo,
    monto: Math.round(monto),
    estado: "pendiente",
  });
  if (error) return { ok: false, error: "No se pudo crear el cobro." };

  revalidatePath(`/panel/admin/clientes/${clienteId}`);
  revalidatePath("/panel/admin/clientes");
  revalidatePath("/panel/admin/pagos");
  return { ok: true, mensaje: `Cobro de ${periodo} creado.` };
}

/* -------------------------------------------------------------------------
   Generar los cobros de un mes de una sola pasada

   Para cada cliente `activo` o `moroso` con automatizaciones activas, crea
   el cobro `pendiente` de ese periodo con la suma de sus tarifas. Salta a
   quien ya tenga un cobro con ese mismo periodo — se puede correr dos veces
   sin duplicar. Un mes con promo se ajusta después en la ficha del cliente.
   ------------------------------------------------------------------------- */
export async function generarCobrosDelMes(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const periodo = String(form.get("periodo") ?? "").trim().slice(0, 40);
  if (!periodo) {
    return { ok: false, error: "Poné el periodo (ej. Octubre 2026)." };
  }

  const supabase = supabaseAdmin();

  const { data: clientes, error: eCli } = await supabase
    .from("clientes")
    .select("id, nombre_negocio, estado, asignaciones(precio_mensual, estado)")
    .in("estado", ["activo", "moroso"]);
  if (eCli || !clientes) {
    return { ok: false, error: "No se pudo leer la lista de clientes." };
  }

  const { data: yaTienen } = await supabase
    .from("cobros")
    .select("cliente_id")
    .eq("periodo", periodo);
  const conCobro = new Set((yaTienen ?? []).map((c) => c.cliente_id));

  const nuevos: { cliente_id: string; periodo: string; monto: number; estado: string }[] =
    [];
  let saltados = 0;

  for (const c of clientes) {
    if (conCobro.has(c.id)) {
      saltados++;
      continue;
    }
    const asigs = (c.asignaciones ?? []) as {
      precio_mensual: number;
      estado: string;
    }[];
    const monto = asigs
      .filter((a) => a.estado === "activa")
      .reduce((s, a) => s + (a.precio_mensual ?? 0), 0);
    if (monto <= 0) {
      saltados++;
      continue;
    }
    nuevos.push({ cliente_id: c.id, periodo, monto, estado: "pendiente" });
  }

  if (nuevos.length === 0) {
    return {
      ok: true,
      mensaje:
        saltados > 0
          ? `Nada que crear: ${saltados === 1 ? "el cliente ya tiene" : `los ${saltados} clientes ya tienen`} su cobro de ${periodo}.`
          : `No hay clientes activos con automatizaciones para cobrar en ${periodo}.`,
    };
  }

  const { error: eIns } = await supabase.from("cobros").insert(nuevos);
  if (eIns) return { ok: false, error: "No se pudieron crear los cobros." };

  revalidatePath("/panel/admin/pagos");
  revalidatePath("/panel/admin/clientes");
  return {
    ok: true,
    mensaje: `${nuevos.length} ${nuevos.length === 1 ? "cobro creado" : "cobros creados"} para ${periodo}${
      saltados > 0 ? ` · ${saltados} ya lo tenían` : ""
    }.`,
  };
}

/* -------------------------------------------------------------------------
   Consultas de soporte — lado del admin

   Responder agrega una línea (autor='hoshizora') y marca la consulta como
   'respondida'. Cerrar la marca 'resuelta'. El admin puede actualizar
   `mensajes` (política `mensajes_admin`).
   ------------------------------------------------------------------------- */
export async function responderConsultaAdmin(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const mensajeId = String(form.get("mensajeId") ?? "");
  const texto = String(form.get("texto") ?? "").trim().slice(0, 4000);
  if (!mensajeId || !texto) return { ok: false, error: "Escribí la respuesta." };

  const supabase = supabaseAdmin();
  const eL = await supabase.from("mensajes_lineas").insert({
    mensaje_id: mensajeId,
    autor: "hoshizora",
    texto,
  });
  if (eL.error) return { ok: false, error: "No se pudo enviar la respuesta." };

  await supabase.from("mensajes").update({ estado: "respondida" }).eq("id", mensajeId);

  revalidatePath(`/panel/admin/mensajes/${mensajeId}`);
  revalidatePath("/panel/admin/mensajes");
  revalidatePath(`/panel/soporte/${mensajeId}`);
  return { ok: true, mensaje: "Respuesta enviada." };
}

export async function cerrarConsulta(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const mensajeId = String(form.get("mensajeId") ?? "");
  if (!mensajeId) return { ok: false, error: "Falta la consulta." };

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("mensajes")
    .update({ estado: "resuelta" })
    .eq("id", mensajeId);
  if (error) return { ok: false, error: "No se pudo cerrar." };

  revalidatePath(`/panel/admin/mensajes/${mensajeId}`);
  revalidatePath("/panel/admin/mensajes");
  return { ok: true, mensaje: "Consulta marcada como resuelta." };
}

/* -------------------------------------------------------------------------
   Acceso del cliente: resetear la contraseña y cambiar el correo de acceso.

   Son operaciones sobre `auth.users`, que solo el `service_role` puede
   tocar. Van aparte de "editar datos" a propósito: un typo acá deja a
   alguien afuera. El correo de acceso es el de `auth.users`; se mantiene
   `clientes.correo` en sincronía para que las pantallas lo muestren igual.
   ------------------------------------------------------------------------- */
async function uidDelCliente(clienteId: string): Promise<string | null> {
  if (!clienteId) return null;
  const admin = supabaseAdmin();
  const { data } = await admin
    .from("perfiles")
    .select("id")
    .eq("cliente_id", clienteId)
    .eq("rol", "cliente")
    .order("creado_en", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function resetearClaveCliente(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const clienteId = String(form.get("clienteId") ?? "");
  const clave = String(form.get("clave") ?? "");
  if (clave.length < 8) {
    return { ok: false, error: "La contraseña necesita al menos 8 caracteres." };
  }

  const uid = await uidDelCliente(clienteId);
  if (!uid) return { ok: false, error: "No se encontró la cuenta de acceso." };

  const admin = supabaseAdmin();
  const { error } = await admin.auth.admin.updateUserById(uid, { password: clave });
  if (error) return { ok: false, error: "No se pudo cambiar la contraseña." };

  revalidatePath(`/panel/admin/clientes/${clienteId}`);
  return {
    ok: true,
    mensaje:
      "Contraseña cambiada. Pasásela vos al cliente — no queda guardada en ningún lado.",
  };
}

export async function cambiarCorreoAcceso(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const clienteId = String(form.get("clienteId") ?? "");
  const correo = String(form.get("correo") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(correo)) {
    return { ok: false, error: "Ese correo no tiene buena pinta." };
  }

  const uid = await uidDelCliente(clienteId);
  if (!uid) return { ok: false, error: "No se encontró la cuenta de acceso." };

  const admin = supabaseAdmin();
  const { error: eAuth } = await admin.auth.admin.updateUserById(uid, {
    email: correo,
    email_confirm: true,
  });
  if (eAuth) {
    const m = (eAuth.message ?? "").toLowerCase();
    if (m.includes("already") || m.includes("registered") || m.includes("exists")) {
      return { ok: false, error: "Ya hay otra cuenta con ese correo." };
    }
    return { ok: false, error: "No se pudo cambiar el correo de acceso." };
  }

  await admin.from("clientes").update({ correo }).eq("id", clienteId);

  revalidatePath(`/panel/admin/clientes/${clienteId}`);
  revalidatePath("/panel/admin/clientes");
  return {
    ok: true,
    mensaje: `Correo de acceso cambiado a ${correo}. El cliente entra con ese de ahora en adelante.`,
  };
}

/* -------------------------------------------------------------------------
   Editar los datos básicos de un cliente (no el correo de acceso, que se
   cambia aparte para no dejar a nadie afuera por error).
   ------------------------------------------------------------------------- */
export async function editarCliente(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const id = String(form.get("clienteId") ?? "");
  const nombreNegocio = String(form.get("nombreNegocio") ?? "").trim();
  if (!id || !nombreNegocio) {
    return { ok: false, error: "El nombre del negocio no puede quedar vacío." };
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase
    .from("clientes")
    .update({
      nombre_negocio: nombreNegocio,
      persona_contacto: String(form.get("personaContacto") ?? "").trim() || null,
      whatsapp: String(form.get("whatsapp") ?? "").trim() || null,
      rubro: String(form.get("rubro") ?? "").trim() || null,
      plan: String(form.get("plan") ?? "Básico").trim(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: "No se pudo guardar." };

  revalidatePath(`/panel/admin/clientes/${id}`);
  revalidatePath("/panel/admin/clientes");
  return { ok: true, mensaje: "Datos actualizados." };
}

/* -------------------------------------------------------------------------
   Eliminar un cliente — PERMANENTE.

   Borra la ficha de `clientes`, y por la cascada de la base se van con ella:
   asignaciones, piezas en cola, actividad, cobros, conexiones, consultas y
   los perfiles ligados. Después borra las cuentas de acceso (`auth.users`),
   que no caen solas con la ficha. El log técnico de `ejecuciones` se queda
   (queda sin cliente, para no perder la auditoría).

   Pide escribir el nombre exacto del negocio como confirmación.
   ------------------------------------------------------------------------- */
export async function eliminarCliente(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const id = String(form.get("clienteId") ?? "");
  const confirmacion = String(form.get("confirmacion") ?? "").trim();
  if (!id) return { ok: false, error: "Falta el cliente." };

  const admin = supabaseAdmin();
  const { data: cli } = await admin
    .from("clientes")
    .select("nombre_negocio")
    .eq("id", id)
    .maybeSingle();
  if (!cli) return { ok: false, error: "Ese cliente ya no existe." };

  if (confirmacion !== cli.nombre_negocio) {
    return {
      ok: false,
      error: `Para confirmar, escribí el nombre del negocio tal cual: “${cli.nombre_negocio}”.`,
    };
  }

  // Cuentas de acceso ligadas (una o varias personas del mismo negocio).
  const { data: perfiles } = await admin
    .from("perfiles")
    .select("id")
    .eq("cliente_id", id);
  const uids = (perfiles ?? []).map((p) => p.id as string);

  // 1. La ficha → cascada al resto de las tablas del cliente.
  const { error } = await admin.from("clientes").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar. Probá de nuevo." };

  // 2. Las cuentas de acceso (auth.users no cae con la ficha).
  for (const uid of uids) {
    await admin.auth.admin.deleteUser(uid).catch(() => {});
  }

  revalidatePath("/panel/admin/clientes");
  revalidatePath("/panel/admin");
  // Antes hacía `redirect()` (mecanismo propio de Server Actions). Ahora es
  // una ruta normal: devuelve el resultado y el navegador hace la vuelta a
  // la lista — ver EliminarCliente en acciones-cliente.tsx.
  return { ok: true, mensaje: `${cli.nombre_negocio} eliminado.` };
}

/* -------------------------------------------------------------------------
   Demos de venta — simulador de WhatsApp por prospecto (ver demos-venta.sql
   para el porqué de la tabla separada, sin foto ni logo a propósito).

   No son clientes: no llevan cobro ni asignación. `demos_admin` en RLS ya
   le da al admin acceso total, así que esto usa el cliente normal
   (`supabaseServidor`), igual que el resto de este archivo — nada acá
   necesita saltarse RLS.
   ------------------------------------------------------------------------- */
function slugDemo(nombreNegocio: string) {
  const base = nombreNegocio
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  // Sufijo al azar: el slug hace de "contraseña" del link — nadie más lo
  // adivina probando nombres de negocio comunes.
  const sufijo = Math.random().toString(36).slice(2, 7);
  return `${base || "demo"}-${sufijo}`;
}

export async function crearDemo(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const nombreNegocio = String(form.get("nombreNegocio") ?? "").trim();
  const servicios = String(form.get("servicios") ?? "").trim();
  const horario = String(form.get("horario") ?? "").trim();

  if (!nombreNegocio) return { ok: false, error: "Ponele un nombre al negocio." };
  if (!servicios || !horario) {
    return {
      ok: false,
      error:
        "Servicios/precios y horario son obligatorios — sin eso el bot no tiene de dónde responder.",
    };
  }

  const emojisForm = String(form.get("emojis") ?? "pocos");
  const slug = slugDemo(nombreNegocio);
  const logoUrl = String(form.get("logoUrl") ?? "").trim();

  const supabase = await supabaseServidor();
  const { error } = await supabase.from("demos").insert({
    slug,
    nombre_negocio: nombreNegocio,
    rubro: String(form.get("rubro") ?? "").trim(),
    trato: form.get("trato") === "vos" ? "vos" : "usted",
    estilo: String(form.get("estilo") ?? "").trim(),
    emojis: ["ninguno", "pocos", "varios"].includes(emojisForm) ? emojisForm : "pocos",
    servicios,
    horario,
    nota_extra: String(form.get("notaExtra") ?? "").trim(),
    logo_url: logoUrl || null,
  });

  if (error) return { ok: false, error: "No se pudo crear la demo. Probá de nuevo." };

  revalidatePath("/panel/admin/demos");
  return { ok: true, mensaje: "Demo creada.", datos: { slug } };
}

export async function pausarDemo(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const id = String(form.get("demoId") ?? "");
  if (!id) return { ok: false, error: "Falta la demo." };

  const supabase = await supabaseServidor();
  const { error } = await supabase.from("demos").update({ activo: false }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo pausar." };

  revalidatePath("/panel/admin/demos");
  return { ok: true, mensaje: "Demo pausada — el link deja de responder." };
}

export async function reactivarDemo(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const id = String(form.get("demoId") ?? "");
  if (!id) return { ok: false, error: "Falta la demo." };

  const supabase = await supabaseServidor();
  const { error } = await supabase.from("demos").update({ activo: true }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo reactivar." };

  revalidatePath("/panel/admin/demos");
  return { ok: true, mensaje: "Demo reactivada." };
}

export async function eliminarDemo(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin(form);
  if (noAutor) return noAutor;

  const id = String(form.get("demoId") ?? "");
  if (!id) return { ok: false, error: "Falta la demo." };

  const supabase = await supabaseServidor();
  const { error } = await supabase.from("demos").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar." };

  revalidatePath("/panel/admin/demos");
  return { ok: true, mensaje: "Demo eliminada." };
}

"use server";

/* ==========================================================================
   Acciones del panel admin — las que ESCRIBEN.

   Un Server Action es un endpoint POST público: aunque el botón solo se vea
   en el panel admin, cualquiera puede llamarlo. Por eso cada una vuelve a
   comprobar que quien la llama es admin, con el cliente que respeta RLS.

   `crearCuentaCliente` usa `supabaseAdmin()` (service_role) porque crear
   una cuenta de acceso es lo único que RLS no permite hacer al admin.
   ========================================================================== */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin, supabaseServidor } from "@/lib/supabase/servidor";
import { getAutomatizacion, getPerfil } from "./datos";

export type ResultadoAccion =
  | { ok: true; mensaje: string }
  | { ok: false; error: string };

async function exigirAdmin(): Promise<ResultadoAccion | null> {
  // 1. Camino normal: perfil del cliente autenticado (respeta RLS).
  const perfil = await getPerfil();
  if (perfil.rol === "admin") return null;

  // 2. Respaldo: en un Server Action de Netlify la consulta a `perfiles`
  //    con el cliente autenticado a veces falla (blip / cookie chunked) y
  //    devuelve "cliente" por error. Si hay una sesión válida (tenemos uid),
  //    leemos el rol con service_role, que se salta RLS. Es seguro: ya
  //    confirmamos que hay un usuario logueado, sólo consultamos su rol.
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
  } else {
    console.error("[exigirAdmin] getPerfil devolvió sin-sesion en la acción");
  }

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
  const noAutor = await exigirAdmin();
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

  return { ok: true, mensaje };
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
  const noAutor = await exigirAdmin();
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
   Suspender / reactivar el servicio de un cliente

   Suspender = el servicio queda apagado (falta de pago o pausa a pedido).
   El cliente y sus automatizaciones pasan a "pausado"; el panel del cliente
   muestra el aviso y n8n deja de publicar (comprueba `asignaciones.estado`).
   ------------------------------------------------------------------------- */
async function fijarEstadoCliente(
  clienteId: string,
  estadoCliente: "activo" | "pausado",
  estadoAsig: "activa" | "pausada"
): Promise<ResultadoAccion> {
  const noAutor = await exigirAdmin();
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
  return fijarEstadoCliente(String(form.get("clienteId") ?? ""), "pausado", "pausada");
}

export async function reactivarCliente(
  _prev: ResultadoAccion | null,
  form: FormData
): Promise<ResultadoAccion> {
  return fijarEstadoCliente(String(form.get("clienteId") ?? ""), "activo", "activa");
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
  const noAutor = await exigirAdmin();
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
      await fijarEstadoCliente(clienteId, "activo", "activa");
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
  const noAutor = await exigirAdmin();
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
  const noAutor = await exigirAdmin();
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
  const noAutor = await exigirAdmin();
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
  const noAutor = await exigirAdmin();
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
  const noAutor = await exigirAdmin();
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
  const noAutor = await exigirAdmin();
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
  const noAutor = await exigirAdmin();
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
  const noAutor = await exigirAdmin();
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
  const noAutor = await exigirAdmin();
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
  redirect("/panel/admin/clientes");
}

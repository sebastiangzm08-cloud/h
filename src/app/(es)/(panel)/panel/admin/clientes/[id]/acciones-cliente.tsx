"use client";

/* ==========================================================================
   Botones del admin sobre un cliente: suspender / reactivar el servicio,
   marcar un cobro como pagado, editar datos, acceso y eliminar.

   Todas pasan por `useAccionAdmin(nombre)` — un POST normal a
   `/api/admin/<nombre>`, no un Server Action. Ver el porqué en el
   comentario grande de `admin-acciones.ts`.

   Rediseño 2026-09-30: SOLO presentación. Cada acción llama a la misma ruta
   con los mismos campos que antes. Lo que cambia:
   - campos de 44 px y 16 px en celular, botones de 44 px;
   - lo que antes eran enlaces subrayados chiquitos ahora son botones;
   - "Editar datos" y "Cambiar el precio" ya no se cierran al enviar: si la
     acción falla, el formulario sigue abierto con el error (antes se
     cerraban y el error nunca se veía);
   - suspender pide una confirmación (apaga todo lo del cliente).
   ========================================================================== */
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { ResultadoAccion } from "@/lib/panel/admin-acciones";
import { useAccionAdmin } from "@/components/panel/usar-accion-admin";
import { CampoMonto } from "@/components/panel/campo-monto";
import { CampoToken } from "@/components/panel/campo-token";
import { DIAS_HORARIO, type ConfigAgenda } from "@/lib/panel/agente-config";
import {
  BTN_CHICO_PRIMARIO,
  BTN_CHICO_SECUNDARIO,
  BTN_PELIGRO,
  BTN_PELIGRO_SOLIDO,
  BTN_PRIMARIO,
  BTN_TEXTO,
  CAMPO,
  ETIQUETA,
  MensajeAccion,
  Selector,
} from "@/components/admin/admin-ui";
import { useDesplegable } from "@/components/admin/usar-desplegable";
import { useEnvio } from "@/components/admin/usar-envio";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { cn } from "@/lib/utils";

/** Botón que abre un panel de la ficha. */
function BotonAbrir({
  onClick,
  icono,
  children,
}: {
  onClick: () => void;
  icono?: NombreIcono;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={BTN_CHICO_SECUNDARIO}>
      {icono ? <Icono nombre={icono} className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

/** Cabecera de un panel que se despliega: título y "Cerrar". */
function CabeceraPanel({ titulo, onCerrar }: { titulo: string; onCerrar: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-[13.5px] font-semibold tracking-tight text-ink">{titulo}</h3>
      <button type="button" onClick={onCerrar} className={cn(BTN_TEXTO, "-mr-2.5")}>
        Cerrar
      </button>
    </div>
  );
}

const PANEL = "flex w-full flex-col gap-3.5 rounded-xl border border-line bg-surface p-3.5 sm:p-4";

/** Campo con su etiqueta arriba. */
function Etiquetado({
  etiqueta,
  ayuda,
  children,
  className,
}: {
  etiqueta: string;
  ayuda?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className={ETIQUETA}>{etiqueta}</span>
      {children}
      {ayuda ? <span className="text-[11.5px] leading-snug text-ink-faint">{ayuda}</span> : null}
    </label>
  );
}

/* -------------------------------------------------------------------------
   Servicio
   ------------------------------------------------------------------------- */

export function BotonServicio({
  clienteId,
  estadoCliente,
}: {
  clienteId: string;
  estadoCliente: "activo" | "prueba" | "pausado" | "moroso";
}) {
  const suspendido = estadoCliente === "pausado" || estadoCliente === "moroso";
  const enPrueba = estadoCliente === "prueba";
  // "Activar" (prueba -> activo) y "Reactivar" (pausado/moroso -> activo) son
  // la MISMA acción del servidor (reactivarCliente ya deja `estado: "activo"`
  // sin importar de dónde venía) — sólo cambia el texto del botón.
  const [estado, ejecutar, pendiente] = useAccionAdmin(
    suspendido || enPrueba ? "reactivarCliente" : "suspenderCliente"
  );
  /* `base` guarda el resultado que había al pedir la confirmación: la caja se
     queda visible ("Suspendiendo…") hasta que llega uno NUEVO. */
  const [confirmando, setConfirmando] = useState(false);
  const [base, setBase] = useState<ResultadoAccion | null>(null);
  const verConfirmacion = confirmando && estado === base;

  const reactiva = suspendido || enPrueba;
  const texto = enPrueba
    ? "Activar cliente"
    : suspendido
      ? "Reactivar servicio"
      : "Suspender servicio";

  return (
    <form action={ejecutar} className="flex flex-col gap-3">
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />

      {reactiva ? (
        <button type="submit" disabled={pendiente} className={cn(BTN_PRIMARIO, "self-start")}>
          {pendiente ? "Un momento…" : texto}
        </button>
      ) : verConfirmacion ? (
        <div
          role="alertdialog"
          aria-label="Confirmar la suspensión del servicio"
          className="flex flex-col gap-3 rounded-xl border border-bad/30 bg-bad/[0.07] p-3.5"
        >
          <p className="text-[12.5px] leading-snug text-ink-soft">
            Se pausan <b className="font-medium text-ink">todas</b> sus automatizaciones y deja de publicarse
            y de contestar. Lo podés reactivar cuando quieras.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="submit" disabled={pendiente} className={BTN_PELIGRO_SOLIDO}>
              {pendiente ? "Suspendiendo…" : "Sí, suspender"}
            </button>
            <button type="button" onClick={() => setConfirmando(false)} className={BTN_TEXTO}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setBase(estado);
            setConfirmando(true);
          }}
          className={cn(BTN_PELIGRO, "self-start")}
        >
          {texto}
        </button>
      )}
      <MensajeAccion estado={estado} />
    </form>
  );
}

/* -------------------------------------------------------------------------
   Cobros
   ------------------------------------------------------------------------- */

export function BotonPago({
  clienteId,
  cobroId,
}: {
  clienteId: string;
  cobroId: string;
}) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("marcarCobroPagado");

  return (
    <form action={ejecutar} className="flex flex-col items-stretch gap-2 sm:items-end">
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <input type="hidden" name="cobroId" value={cobroId} />
      <button type="submit" disabled={pendiente} className={BTN_CHICO_SECUNDARIO}>
        <Icono nombre="facturacion" className="h-4 w-4" />
        {pendiente ? "Guardando…" : "Marcar pagado"}
      </button>
      {estado && !estado.ok ? <MensajeAccion estado={estado} className="max-w-[300px]" /> : null}
    </form>
  );
}

/** Precio mensual de una automatización, editable en el lugar. */
export function PrecioAsignacion({
  clienteId,
  asignacionId,
  precio,
}: {
  clienteId: string;
  asignacionId: string;
  precio: number;
}) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("cambiarPrecioAsignacion");
  const panel = useDesplegable(estado);
  const envio = useEnvio(estado, ejecutar, { limpiarSiOk: false });

  if (!panel.visible) {
    return (
      <button
        type="button"
        onClick={panel.abrir}
        className="group inline-flex h-11 flex-none items-center gap-2 rounded-lg px-2.5 font-mono text-[12.5px] text-ink-soft transition-colors hover:bg-surface-3 hover:text-ink sm:h-9"
        title="Cambiar el precio"
        aria-label={`Cambiar el precio, hoy ₡${precio.toLocaleString("es-CR")} al mes`}
      >
        ₡{precio.toLocaleString("es-CR")}/mes
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-3.5 w-3.5 text-ink-faint transition-colors group-hover:text-ink-mute"
        >
          <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
        </svg>
      </button>
    );
  }

  return (
    <form {...envio} className="flex min-w-0 flex-col gap-2">
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <input type="hidden" name="asignacionId" value={asignacionId} />
      <div className="flex flex-wrap items-center gap-2">
        <label className="block w-36">
          <span className="sr-only">Precio mensual en colones</span>
          <CampoMonto name="precio" defaultValue={precio} autoFocus className={CAMPO} />
        </label>
        <button type="submit" disabled={pendiente} className={BTN_CHICO_PRIMARIO}>
          {pendiente ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={panel.cerrar} className={BTN_TEXTO}>
          Cancelar
        </button>
      </div>
      <MensajeAccion estado={estado && !estado.ok ? estado : null} />
    </form>
  );
}

/** Crear el cobro de un mes, con el monto que sea (promos, ajustes). */
export function AgregarCobro({
  clienteId,
  montoSugerido,
}: {
  clienteId: string;
  montoSugerido: number;
}) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("crearCobro");
  const envio = useEnvio(estado, ejecutar);

  return (
    <form {...envio} className="flex flex-col gap-3">
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <Etiquetado etiqueta="Periodo">
          <input
            name="periodo"
            placeholder="Octubre 2026"
            required
            autoComplete="off"
            className={CAMPO}
          />
        </Etiquetado>
        <Etiquetado etiqueta="Monto (₡)">
          <CampoMonto
            name="monto"
            defaultValue={montoSugerido || undefined}
            placeholder="30.000"
            required
            className={CAMPO}
          />
        </Etiquetado>
        <button type="submit" disabled={pendiente} className={BTN_PRIMARIO}>
          {pendiente ? "Creando…" : "Crear cobro"}
        </button>
      </div>
      <MensajeAccion estado={estado} />
    </form>
  );
}

/* -------------------------------------------------------------------------
   Datos y acceso
   ------------------------------------------------------------------------- */

/** Editar los datos básicos del cliente, en un panel que se despliega. */
export function EditarDatosCliente({
  clienteId,
  datos,
}: {
  clienteId: string;
  datos: {
    nombreNegocio: string;
    personaContacto: string;
    whatsapp: string;
    rubro: string;
    plan: string;
  };
}) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("editarCliente");
  const panel = useDesplegable(estado);
  const envio = useEnvio(estado, ejecutar, { limpiarSiOk: false });

  if (!panel.visible) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <BotonAbrir onClick={panel.abrir} icono="ajustes">
          Editar datos
        </BotonAbrir>
        {panel.guardado ? <MensajeAccion estado={estado} className="py-2" /> : null}
      </div>
    );
  }

  return (
    <form {...envio} className={PANEL}>
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <CabeceraPanel titulo="Editar datos del cliente" onCerrar={panel.cerrar} />
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Etiquetado etiqueta="Negocio">
          <input name="nombreNegocio" defaultValue={datos.nombreNegocio} required className={CAMPO} />
        </Etiquetado>
        <Etiquetado etiqueta="Persona de contacto">
          <input name="personaContacto" defaultValue={datos.personaContacto} className={CAMPO} />
        </Etiquetado>
        <Etiquetado etiqueta="WhatsApp">
          <input name="whatsapp" defaultValue={datos.whatsapp} inputMode="tel" className={CAMPO} />
        </Etiquetado>
        <Etiquetado etiqueta="Rubro">
          <input name="rubro" defaultValue={datos.rubro} className={CAMPO} />
        </Etiquetado>
        <Etiquetado etiqueta="Plan">
          <Selector name="plan" defaultValue={datos.plan}>
            <option>Básico</option>
            <option>Growth</option>
            <option>Scale</option>
          </Selector>
        </Etiquetado>
      </div>
      <p className="text-[11.5px] text-ink-faint">El correo de acceso se cambia aparte, en «Acceso».</p>
      <MensajeAccion estado={estado && !estado.ok ? estado : null} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pendiente} className={BTN_PRIMARIO}>
          {pendiente ? "Guardando…" : "Guardar cambios"}
        </button>
        <button type="button" onClick={panel.cerrar} className={BTN_TEXTO}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/** Acceso del cliente: resetear contraseña y cambiar el correo de acceso.
    Panel que se despliega — son acciones que dejan a alguien afuera si se
    hacen mal, así que no están a un clic. */
export function AccesoCliente({
  clienteId,
  correoActual,
}: {
  clienteId: string;
  correoActual: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [rClave, aClave, pClave] = useAccionAdmin("resetearClaveCliente");
  const [rCorreo, aCorreo, pCorreo] = useAccionAdmin("cambiarCorreoAcceso");
  /* La contraseña nueva se queda en el campo: hay que copiarla y pasársela al cliente. */
  const envioClave = useEnvio(rClave, aClave, { limpiarSiOk: false });
  const envioCorreo = useEnvio(rCorreo, aCorreo, { limpiarSiOk: false });

  if (!abierto) {
    return (
      <BotonAbrir onClick={() => setAbierto(true)} icono="cuenta">
        Acceso
      </BotonAbrir>
    );
  }

  return (
    <div className={PANEL}>
      <CabeceraPanel titulo="Acceso del cliente" onCerrar={() => setAbierto(false)} />

      <form {...envioClave} className="flex flex-col gap-2.5">
        <CampoToken />
        <input type="hidden" name="clienteId" value={clienteId} />
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
          <Etiquetado etiqueta="Nueva contraseña" className="sm:w-60">
            <input
              name="clave"
              type="text"
              minLength={8}
              required
              autoComplete="off"
              placeholder="Mínimo 8 caracteres"
              className={CAMPO}
            />
          </Etiquetado>
          <button type="submit" disabled={pClave} className={BTN_CHICO_PRIMARIO}>
            {pClave ? "Cambiando…" : "Cambiar contraseña"}
          </button>
        </div>
        <MensajeAccion estado={rClave} />
      </form>

      <form {...envioCorreo} className="flex flex-col gap-2.5 border-t border-line pt-3.5">
        <CampoToken />
        <input type="hidden" name="clienteId" value={clienteId} />
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
          <Etiquetado etiqueta="Correo de acceso" className="sm:w-72">
            <input
              name="correo"
              type="email"
              defaultValue={correoActual}
              required
              autoComplete="off"
              className={CAMPO}
            />
          </Etiquetado>
          <button type="submit" disabled={pCorreo} className={BTN_CHICO_PRIMARIO}>
            {pCorreo ? "Cambiando…" : "Cambiar correo"}
          </button>
        </div>
        <MensajeAccion estado={rCorreo} />
      </form>

      <p className="text-[11.5px] text-ink-faint">
        La contraseña no queda guardada: copiala y pasásela al cliente al toque.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Conexiones
   ------------------------------------------------------------------------- */

/** Conectar (o reconectar) el WhatsApp del cliente: pega el phone_number_id
    y el token permanente que salieron de generar el Usuario del Sistema en
    el Business Manager del cliente. Comprueba contra Meta antes de guardar
    — si el token está mal, se ve acá, no en la primera prueba real. */
export function ConectarWhatsapp({ clienteId }: { clienteId: string }) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("conectarWhatsapp");
  const [abierto, setAbierto] = useState(false);
  const envio = useEnvio(estado, ejecutar);

  if (!abierto) {
    return (
      <BotonAbrir onClick={() => setAbierto(true)} icono="conexiones">
        Conectar WhatsApp
      </BotonAbrir>
    );
  }

  return (
    <form {...envio} className={PANEL}>
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <CabeceraPanel titulo="Conectar WhatsApp" onCerrar={() => setAbierto(false)} />
      <p className="text-[12.5px] leading-snug text-ink-faint">
        Salen de crear el Usuario del Sistema en el Business Manager del cliente: asignale el activo de
        WhatsApp y generá el token permanente con los permisos{" "}
        <code className="rounded bg-surface-3 px-1 py-px font-mono text-[11px]">whatsapp_business_messaging</code> y{" "}
        <code className="rounded bg-surface-3 px-1 py-px font-mono text-[11px]">whatsapp_business_management</code>.
      </p>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Etiquetado etiqueta="Phone Number ID *">
          <input name="phoneNumberId" required placeholder="1316882374848089" inputMode="numeric" className={CAMPO} />
        </Etiquetado>
        <Etiquetado etiqueta="Endpoint (opcional)">
          <input name="endpoint" placeholder="https://graph.facebook.com/v21.0" inputMode="url" className={CAMPO} />
        </Etiquetado>
      </div>
      <Etiquetado etiqueta="Token permanente *">
        <input name="token" type="password" required autoComplete="off" className={CAMPO} />
      </Etiquetado>
      <Etiquetado
        etiqueta="WABA ID (WhatsApp Business Account)"
        ayuda="Opcional, pero sin esto no se puede armar la plantilla de recordatorios."
      >
        <input name="wabaId" placeholder="102938475610234" inputMode="numeric" className={CAMPO} />
      </Etiquetado>
      <MensajeAccion estado={estado} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pendiente} className={BTN_PRIMARIO}>
          {pendiente ? "Comprobando con Meta…" : "Conectar"}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className={BTN_TEXTO}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/** Para cuando el WABA ID se agregó DESPUÉS de conectar (o la primera vez
    falló) — reintenta mandar la plantilla sin tener que volver a pegar el
    token. Vive junto al botón de "Conectar WhatsApp" en la ficha. */
export function ReenviarPlantillaRecordatorio({ clienteId }: { clienteId: string }) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("reenviarPlantillaRecordatorio");

  return (
    <form action={ejecutar} className="flex flex-col gap-2">
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <button type="submit" disabled={pendiente} className={BTN_CHICO_SECUNDARIO}>
        <Icono nombre="calendario" className="h-4 w-4" />
        {pendiente ? "Mandando a Meta…" : "Reenviar plantillas de recordatorio"}
      </button>
      {estado ? <MensajeAccion estado={estado} className="basis-full" /> : null}
    </form>
  );
}

/** Conectar el correo del cliente: una casilla PROPIA y dedicada (Gmail,
    Outlook, lo que sea) con una contraseña de aplicación — nunca un
    dominio de Hoshizora ni una casilla compartida entre clientes. Se
    comprueba contra el SMTP en vivo antes de guardar. */
export function ConectarCorreo({ clienteId }: { clienteId: string }) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("conectarCorreo");
  const [abierto, setAbierto] = useState(false);
  const envio = useEnvio(estado, ejecutar);

  if (!abierto) {
    return (
      <BotonAbrir onClick={() => setAbierto(true)} icono="correo">
        Conectar correo
      </BotonAbrir>
    );
  }

  return (
    <form {...envio} className={PANEL}>
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <CabeceraPanel titulo="Conectar correo" onCerrar={() => setAbierto(false)} />
      <p className="text-[12.5px] leading-snug text-ink-faint">
        Una casilla NUEVA y dedicada para este cliente (ej. un Gmail), con una contraseña de aplicación:
        nunca tu propio correo ni uno compartido entre clientes.
      </p>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Etiquetado etiqueta="Correo *">
          <input name="correo" type="email" required placeholder="citas.clinica@gmail.com" className={CAMPO} />
        </Etiquetado>
        <Etiquetado etiqueta="Nombre del remitente">
          <input name="nombreRemitente" placeholder="Clínica Dental Aurora" className={CAMPO} />
        </Etiquetado>
      </div>
      <Etiquetado etiqueta="Contraseña de aplicación *">
        <input name="claveApp" type="password" required autoComplete="off" className={CAMPO} />
      </Etiquetado>
      <details className="group rounded-xl border border-line px-3.5 text-[12.5px] text-ink-mute">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 select-none">
          Otro proveedor (no Gmail)
          <Icono nombre="flecha" className="h-3 w-3 transition-transform group-open:rotate-90" />
        </summary>
        <div className="grid gap-3.5 pt-1 pb-3.5 sm:grid-cols-2">
          <Etiquetado etiqueta="Servidor IMAP">
            <input name="imapHost" defaultValue="imap.gmail.com" className={CAMPO} />
          </Etiquetado>
          <Etiquetado etiqueta="Puerto IMAP">
            <input name="imapPort" type="number" defaultValue={993} className={CAMPO} />
          </Etiquetado>
          <Etiquetado etiqueta="Servidor SMTP">
            <input name="smtpHost" defaultValue="smtp.gmail.com" className={CAMPO} />
          </Etiquetado>
          <Etiquetado etiqueta="Puerto SMTP">
            <input name="smtpPort" type="number" defaultValue={465} className={CAMPO} />
          </Etiquetado>
        </div>
      </details>
      <MensajeAccion estado={estado} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pendiente} className={BTN_PRIMARIO}>
          {pendiente ? "Comprobando…" : "Conectar"}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className={BTN_TEXTO}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/** Sembrar la agenda de un cliente nuevo (capacidad/colchón/horario) desde
    el alta, en vez de dejarlo en los valores por defecto hasta que el
    cliente entre por su cuenta a configurarlo. El cliente lo sigue pudiendo
    editar después desde su propio panel — esto solo le da un punto de
    partida real en vez de "capacidad 1, sin horario". */
export function FormaAgendaAdmin({
  clienteId,
  agenda,
  horario,
}: {
  clienteId: string;
  agenda: ConfigAgenda;
  horario: Record<string, [string, string][]>;
}) {
  const [estado, ejecutar, pendiente] = useAccionAdmin("sembrarAgenda");
  const [abierto, setAbierto] = useState(false);
  const envio = useEnvio(estado, ejecutar, { limpiarSiOk: false });
  const [cerrados, setCerrados] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DIAS_HORARIO.map(({ clave }) => [clave, !horario[clave]?.length]))
  );

  if (!abierto) {
    return (
      <BotonAbrir onClick={() => setAbierto(true)} icono="calendario">
        Sembrar agenda y horario
      </BotonAbrir>
    );
  }

  return (
    <form {...envio} className={PANEL}>
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <CabeceraPanel titulo="Agenda y horario" onCerrar={() => setAbierto(false)} />

      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[13px] text-ink-soft">
        <input
          type="checkbox"
          name="activa"
          defaultChecked={agenda.activa}
          className="h-5 w-5 flex-none accent-[var(--panel-acento,#7c5cff)]"
        />
        Agenda sola (si se apaga, toma el dato y avisa que alguien confirma)
      </label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Etiquetado etiqueta="Capacidad">
          <input type="number" name="capacidad" min={1} max={20} defaultValue={agenda.capacidad} inputMode="numeric" className={CAMPO} />
        </Etiquetado>
        <Etiquetado etiqueta="Colchón (min)">
          <input type="number" name="colchonMin" min={0} max={120} defaultValue={agenda.colchonMin} inputMode="numeric" className={CAMPO} />
        </Etiquetado>
        <Etiquetado etiqueta="Anticipación (min)">
          <input type="number" name="anticipacionMin" min={0} max={1440} defaultValue={agenda.anticipacionMin} inputMode="numeric" className={CAMPO} />
        </Etiquetado>
        <Etiquetado etiqueta="Días adelante">
          <input type="number" name="maximoDiasAdelante" min={1} max={90} defaultValue={agenda.maximoDiasAdelante} inputMode="numeric" className={CAMPO} />
        </Etiquetado>
      </div>

      <div className="flex flex-col divide-y divide-line rounded-xl border border-line px-3.5">
        {DIAS_HORARIO.map(({ clave, texto }) => {
          const bloque = horario[clave]?.[0];
          const cerrado = cerrados[clave];
          return (
            <div key={clave} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 sm:flex-nowrap">
              <label className="flex min-h-11 w-full flex-none cursor-pointer items-center gap-3 text-[13px] text-ink-soft sm:w-32">
                <input
                  type="checkbox"
                  checked={!cerrado}
                  onChange={(e) => setCerrados((c) => ({ ...c, [clave]: !e.target.checked }))}
                  className="h-5 w-5 flex-none accent-[var(--panel-acento,#7c5cff)]"
                />
                {texto}
                {cerrado ? <span className="text-[11.5px] text-ink-faint">cerrado</span> : null}
              </label>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <input
                  type="time"
                  name={`ini_${clave}`}
                  defaultValue={bloque?.[0] ?? "08:00"}
                  disabled={cerrado}
                  aria-label={`${texto}: abre`}
                  className={cn(CAMPO, "sm:max-w-[140px]")}
                />
                <span className="text-ink-faint" aria-hidden="true">
                  –
                </span>
                <input
                  type="time"
                  name={`fin_${clave}`}
                  defaultValue={bloque?.[1] ?? "17:00"}
                  disabled={cerrado}
                  aria-label={`${texto}: cierra`}
                  className={cn(CAMPO, "sm:max-w-[140px]")}
                />
              </div>
              <input type="hidden" name={`cerrado_${clave}`} value={cerrado ? "on" : ""} />
            </div>
          );
        })}
      </div>

      <MensajeAccion estado={estado} />
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pendiente} className={BTN_PRIMARIO}>
          {pendiente ? "Guardando…" : "Guardar agenda"}
        </button>
        <button type="button" onClick={() => setAbierto(false)} className={BTN_TEXTO}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------
   Zona de peligro
   ------------------------------------------------------------------------- */

/** Zona de peligro: eliminar el cliente para siempre. Pide escribir el
    nombre del negocio antes de habilitar el botón.

    Antes esto terminaba con un `redirect()` del lado del servidor (propio
    de los Server Actions). Ahora la acción sólo devuelve el resultado, y
    acá se hace la vuelta a la lista cuando `estado.ok` se pone en `true`. */
export function EliminarCliente({
  clienteId,
  nombreNegocio,
}: {
  clienteId: string;
  nombreNegocio: string;
}) {
  const router = useRouter();
  const [estado, ejecutar, pendiente] = useAccionAdmin("eliminarCliente");
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const envio = useEnvio(estado, ejecutar, { limpiarSiOk: false });

  useEffect(() => {
    if (estado?.ok) {
      router.push("/panel/admin/clientes");
      router.refresh();
    }
  }, [estado, router]);

  if (!abierto) {
    return (
      <button type="button" onClick={() => setAbierto(true)} className={BTN_PELIGRO}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
        </svg>
        Eliminar este cliente
      </button>
    );
  }

  const coincide = texto.trim() === nombreNegocio;

  return (
    <form
      {...envio}
      className="flex flex-col gap-3.5 rounded-xl border border-bad/30 bg-bad/[0.06] p-3.5 sm:p-4"
    >
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <p className="text-[12.5px] leading-snug text-ink-soft">
        <b className="font-medium text-bad">Se borra para siempre:</b> la ficha, las automatizaciones, las
        piezas en cola, la actividad, los cobros, las conexiones, las consultas y la(s) cuenta(s) de
        acceso. El log técnico de ejecuciones se conserva sin cliente. Esto no se puede deshacer.
      </p>
      <Etiquetado etiqueta="Escribí el nombre del negocio para confirmar">
        <input
          name="confirmacion"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={nombreNegocio}
          autoComplete="off"
          className={CAMPO}
        />
      </Etiquetado>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pendiente || !coincide} className={BTN_PELIGRO_SOLIDO}>
          {pendiente ? "Eliminando…" : "Eliminar definitivamente"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAbierto(false);
            setTexto("");
          }}
          className={BTN_TEXTO}
        >
          Cancelar
        </button>
      </div>
      {estado && !estado.ok ? <MensajeAccion estado={estado} /> : null}
    </form>
  );
}


"use client";

/* ==========================================================================
   Botones del admin sobre un cliente: suspender / reactivar el servicio y
   marcar un cobro como pagado.
   ========================================================================== */
import { useActionState, useState } from "react";
import {
  cambiarCorreoAcceso,
  cambiarPrecioAsignacion,
  crearCobro,
  editarCliente,
  eliminarCliente,
  marcarCobroPagado,
  reactivarCliente,
  resetearClaveCliente,
  suspenderCliente,
  type ResultadoAccion,
} from "@/lib/panel/admin-acciones";
import { CampoToken } from "@/components/panel/campo-token";
import { cn } from "@/lib/utils";

const campo =
  "h-8 w-28 rounded-lg border border-line bg-surface-2 px-2.5 text-[12.5px] text-ink " +
  "transition-colors focus:border-line-strong focus:bg-surface-3 focus:outline-none";

function Mensaje({ estado }: { estado: ResultadoAccion | null }) {
  if (!estado) return null;
  return (
    <p
      role={estado.ok ? "status" : "alert"}
      className={cn(
        "mt-2 rounded-lg px-3 py-2 text-[12px]",
        estado.ok ? "bg-ok/10 text-ok" : "bg-bad/10 text-bad"
      )}
    >
      {estado.ok ? estado.mensaje : estado.error}
    </p>
  );
}

export function BotonServicio({
  clienteId,
  suspendido,
}: {
  clienteId: string;
  suspendido: boolean;
}) {
  const accion = suspendido ? reactivarCliente : suspenderCliente;
  const [estado, ejecutar, pendiente] = useActionState<
    ResultadoAccion | null,
    FormData
  >(accion, null);

  return (
    <form action={ejecutar}>
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <button
        type="submit"
        disabled={pendiente}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-full px-5 text-[12.5px] font-medium transition-colors disabled:opacity-50",
          suspendido
            ? "bg-ink text-paper hover:bg-ink-soft"
            : "border border-bad/40 text-bad hover:bg-bad/10"
        )}
      >
        {pendiente
          ? "…"
          : suspendido
            ? "Reactivar servicio"
            : "Suspender servicio"}
      </button>
      <Mensaje estado={estado} />
    </form>
  );
}

export function BotonPago({
  clienteId,
  cobroId,
}: {
  clienteId: string;
  cobroId: string;
}) {
  const [estado, ejecutar, pendiente] = useActionState<
    ResultadoAccion | null,
    FormData
  >(marcarCobroPagado, null);

  return (
    <form action={ejecutar} className="inline">
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <input type="hidden" name="cobroId" value={cobroId} />
      <button
        type="submit"
        disabled={pendiente}
        className="inline-flex h-8 items-center rounded-full border border-line-strong px-3 text-[11.5px] text-ink transition-colors hover:bg-surface-2 disabled:opacity-50"
      >
        {pendiente ? "…" : "Marcar pagado"}
      </button>
      <Mensaje estado={estado} />
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
  const [estado, ejecutar, pendiente] = useActionState<
    ResultadoAccion | null,
    FormData
  >(cambiarPrecioAsignacion, null);
  const [editando, setEditando] = useState(false);

  if (!editando) {
    return (
      <button
        type="button"
        onClick={() => setEditando(true)}
        className="font-mono text-[12px] text-ink-soft underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink"
        title="Cambiar el precio"
      >
        ₡{precio.toLocaleString("es-CR")}/mes
      </button>
    );
  }

  return (
    <form
      action={(fd) => {
        ejecutar(fd);
        setEditando(false);
      }}
      className="flex items-center gap-1.5"
    >
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <input type="hidden" name="asignacionId" value={asignacionId} />
      <input
        name="precio"
        type="number"
        min={0}
        step={1000}
        defaultValue={precio}
        autoFocus
        className={campo}
      />
      <button
        type="submit"
        disabled={pendiente}
        className="inline-flex h-8 items-center rounded-lg bg-ink px-3 text-[11.5px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-50"
      >
        Guardar
      </button>
      <button
        type="button"
        onClick={() => setEditando(false)}
        className="text-[11.5px] text-ink-faint hover:text-ink-mute"
      >
        Cancelar
      </button>
      <Mensaje estado={estado} />
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
  const [estado, ejecutar, pendiente] = useActionState<
    ResultadoAccion | null,
    FormData
  >(crearCobro, null);

  return (
    <form action={ejecutar} className="flex flex-wrap items-end gap-2.5">
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <label className="flex flex-col gap-1">
        <span className="text-[10.5px] font-medium text-ink-mute uppercase">
          Periodo
        </span>
        <input
          name="periodo"
          placeholder="Octubre 2026"
          required
          className={cn(campo, "w-36")}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10.5px] font-medium text-ink-mute uppercase">
          Monto (₡)
        </span>
        <input
          name="monto"
          type="number"
          min={0}
          step={1000}
          defaultValue={montoSugerido || undefined}
          placeholder="30000"
          required
          className={campo}
        />
      </label>
      <button
        type="submit"
        disabled={pendiente}
        className="inline-flex h-8 items-center rounded-full bg-ink px-4 text-[12px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-50"
      >
        {pendiente ? "…" : "Crear cobro"}
      </button>
      <Mensaje estado={estado} />
    </form>
  );
}

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
  const [estado, ejecutar, pendiente] = useActionState<
    ResultadoAccion | null,
    FormData
  >(editarCliente, null);
  const [abierto, setAbierto] = useState(false);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-[12px] text-ink-mute underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink"
      >
        Editar datos
      </button>
    );
  }

  const lbl = "flex flex-col gap-1 text-[11px] font-medium text-ink-mute uppercase";
  const inp =
    "h-9 rounded-lg border border-line bg-surface-2 px-2.5 text-[12.5px] normal-case text-ink " +
    "transition-colors focus:border-line-strong focus:bg-surface-3 focus:outline-none";

  return (
    <form
      action={(fd) => {
        ejecutar(fd);
        setAbierto(false);
      }}
      className="mt-3 flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-3.5"
    >
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={lbl}>
          Negocio
          <input name="nombreNegocio" defaultValue={datos.nombreNegocio} required className={inp} />
        </label>
        <label className={lbl}>
          Persona
          <input name="personaContacto" defaultValue={datos.personaContacto} className={inp} />
        </label>
        <label className={lbl}>
          WhatsApp
          <input name="whatsapp" defaultValue={datos.whatsapp} className={inp} />
        </label>
        <label className={lbl}>
          Rubro
          <input name="rubro" defaultValue={datos.rubro} className={inp} />
        </label>
        <label className={lbl}>
          Plan
          <select name="plan" defaultValue={datos.plan} className={cn(inp, "appearance-none")}>
            <option>Básico</option>
            <option>Growth</option>
            <option>Scale</option>
          </select>
        </label>
      </div>
      <p className="text-[10.5px] text-ink-faint normal-case">
        El correo de acceso se cambia aparte.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pendiente}
          className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-[12px] font-medium text-paper transition-colors hover:bg-ink-soft disabled:opacity-50"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="text-[11.5px] text-ink-faint hover:text-ink-mute"
        >
          Cancelar
        </button>
      </div>
      <Mensaje estado={estado} />
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
  const [rClave, aClave, pClave] = useActionState<ResultadoAccion | null, FormData>(
    resetearClaveCliente,
    null
  );
  const [rCorreo, aCorreo, pCorreo] = useActionState<
    ResultadoAccion | null,
    FormData
  >(cambiarCorreoAcceso, null);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-[12px] text-ink-mute underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink"
      >
        Acceso
      </button>
    );
  }

  const lbl = "flex flex-col gap-1 text-[11px] font-medium text-ink-mute uppercase";
  const inp =
    "h-9 rounded-lg border border-line bg-surface-2 px-2.5 text-[12.5px] normal-case text-ink " +
    "transition-colors focus:border-line-strong focus:bg-surface-3 focus:outline-none";
  const btn =
    "inline-flex h-9 items-center rounded-full bg-ink px-4 text-[12px] font-medium text-paper " +
    "transition-colors hover:bg-ink-soft disabled:opacity-50";

  return (
    <div className="mt-3 flex flex-col gap-4 rounded-xl border border-line bg-surface-2 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-wide text-ink-mute uppercase">
          Acceso del cliente
        </span>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="text-[11.5px] text-ink-faint hover:text-ink-mute"
        >
          Cerrar
        </button>
      </div>

      <form action={aClave} className="flex flex-wrap items-end gap-2.5">
        <CampoToken />
        <input type="hidden" name="clienteId" value={clienteId} />
        <label className={lbl}>
          Nueva contraseña
          <input
            name="clave"
            type="text"
            minLength={8}
            required
            placeholder="mínimo 8"
            className={cn(inp, "w-44")}
          />
        </label>
        <button type="submit" disabled={pClave} className={btn}>
          {pClave ? "…" : "Cambiar contraseña"}
        </button>
        <Mensaje estado={rClave} />
      </form>

      <form action={aCorreo} className="flex flex-wrap items-end gap-2.5 border-t border-line pt-3.5">
        <CampoToken />
        <input type="hidden" name="clienteId" value={clienteId} />
        <label className={lbl}>
          Correo de acceso
          <input
            name="correo"
            type="email"
            defaultValue={correoActual}
            required
            className={cn(inp, "w-60")}
          />
        </label>
        <button type="submit" disabled={pCorreo} className={btn}>
          {pCorreo ? "…" : "Cambiar correo"}
        </button>
        <Mensaje estado={rCorreo} />
      </form>

      <p className="text-[10.5px] text-ink-faint normal-case">
        La contraseña no queda guardada: copiala y pasásela al cliente al toque.
      </p>
    </div>
  );
}

/** Zona de peligro: eliminar el cliente para siempre. Pide escribir el
    nombre del negocio antes de habilitar el botón. */
export function EliminarCliente({
  clienteId,
  nombreNegocio,
}: {
  clienteId: string;
  nombreNegocio: string;
}) {
  const [estado, ejecutar, pendiente] = useActionState<
    ResultadoAccion | null,
    FormData
  >(eliminarCliente, null);
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-[12px] text-bad underline decoration-bad/40 underline-offset-2 transition-colors hover:decoration-bad"
      >
        Eliminar este cliente
      </button>
    );
  }

  const coincide = texto.trim() === nombreNegocio;

  return (
    <form
      action={ejecutar}
      className="flex flex-col gap-3 rounded-xl border border-bad/30 bg-bad/5 p-3.5"
    >
      <CampoToken />
      <input type="hidden" name="clienteId" value={clienteId} />
      <p className="text-[12.5px] text-bad">
        Se borra para siempre: la ficha, las automatizaciones, las piezas en
        cola, la actividad, los cobros, las conexiones, las consultas y la(s)
        cuenta(s) de acceso. El log técnico de ejecuciones se conserva sin
        cliente. Esto no se puede deshacer.
      </p>
      <label className="flex flex-col gap-1 text-[11px] font-medium text-ink-mute uppercase">
        Escribí el nombre del negocio para confirmar
        <input
          name="confirmacion"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={nombreNegocio}
          autoComplete="off"
          className="h-9 rounded-lg border border-line bg-surface-2 px-2.5 text-[12.5px] normal-case text-ink transition-colors focus:border-line-strong focus:bg-surface-3 focus:outline-none"
        />
      </label>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pendiente || !coincide}
          className="inline-flex h-9 items-center rounded-full bg-bad px-4 text-[12px] font-medium text-paper transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
        >
          {pendiente ? "Eliminando…" : "Eliminar definitivamente"}
        </button>
        <button
          type="button"
          onClick={() => {
            setAbierto(false);
            setTexto("");
          }}
          className="text-[11.5px] text-ink-faint hover:text-ink-mute"
        >
          Cancelar
        </button>
      </div>
      {estado && !estado.ok ? (
        <p role="alert" className="text-[12px] text-bad">
          {estado.error}
        </p>
      ) : null}
    </form>
  );
}

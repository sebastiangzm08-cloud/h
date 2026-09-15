"use client";

/* ==========================================================================
   Alta guiada de cliente nuevo.

   Antes esto eran 3 pasos sueltos, en 2 pantallas distintas: "Alta" creaba
   la cuenta, y para conectar WhatsApp y sembrar la agenda había que ir a la
   ficha del cliente y abrir cada widget por separado. Sebastián lo pidió
   junto ("onboarding semi-automático"): un solo lugar, un paso después del
   otro, sin que se pierda de vista el correo/contraseña que hay que
   pasarle al cliente mientras se hacen los siguientes pasos.

   Sigue siendo "semi": cada paso lo llena una persona (Sebastián), no hay
   nada que se dispare solo. Lo automático es que ya no hay que ir a buscar
   el cliente recién creado en otra pantalla para seguir armándolo — el
   `clienteId` que devuelve el paso 1 viaja solo a los pasos 2 y 3.

   WhatsApp y Agenda son SALTABLES a propósito: si todavía no existe el
   Usuario del Sistema de Meta para este cliente (lo normal: eso se arma
   DESPUÉS de que el cliente comparta su Business Manager), no tiene sentido
   bloquear el alta esperando un dato que no existe todavía. Se completa
   después desde la ficha del cliente — los mismos widgets siguen ahí.
   ========================================================================== */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccionAdmin } from "@/components/panel/usar-accion-admin";
import { CampoMonto } from "@/components/panel/campo-monto";
import { CampoToken } from "@/components/panel/campo-token";
import { DIAS_HORARIO, CONFIG_AGENDA_POR_DEFECTO } from "@/lib/panel/agente-config";
import { cn } from "@/lib/utils";

type Paso = "cuenta" | "whatsapp" | "agenda" | "listo";

const campo =
  "h-11 w-full rounded-xl border border-line bg-surface-2 px-3.5 text-[14px] text-ink " +
  "placeholder:text-ink-faint transition-colors focus:border-line-strong " +
  "focus:bg-surface-3 focus:outline-none";
const campoChico =
  "h-9 rounded-lg border border-line bg-surface-2 px-2.5 text-[12.5px] text-ink " +
  "transition-colors focus:border-line-strong focus:bg-surface-3 focus:outline-none";
const lblChico = "flex flex-col gap-1 text-[11px] font-medium text-ink-mute uppercase";
const boton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[13.5px] font-medium text-paper " +
  "transition-all duration-200 ease-out hover:bg-ink-soft active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50";
const botonSecundario =
  "inline-flex h-11 items-center justify-center rounded-full border border-line-strong px-5 text-[13px] text-ink-soft " +
  "transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-50";

function claveAlAzar() {
  const abc = "abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ2345679";
  let s = "";
  for (let i = 0; i < 12; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}

function Campo({
  label, name, requerido, tipo = "text", placeholder,
}: { label: string; name: string; requerido?: boolean; tipo?: string; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-medium text-ink-mute">
        {label} {requerido ? <span className="text-ink-faint">*</span> : null}
      </span>
      <input name={name} type={tipo} required={requerido} placeholder={placeholder} className={campo} />
    </label>
  );
}

function ErrorBox({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-lg bg-bad/10 px-3.5 py-3 text-[12.5px] text-bad">
      {error}
    </p>
  );
}

/** Los 3 pasos, con su numerito y si ya quedaron atrás. */
function Progreso({ paso, conWhatsapp }: { paso: Paso; conWhatsapp: boolean }) {
  if (paso === "listo") return null;
  const pasos: { id: Paso; n: number; texto: string }[] = conWhatsapp
    ? [
        { id: "cuenta", n: 1, texto: "Cuenta" },
        { id: "whatsapp", n: 2, texto: "WhatsApp" },
        { id: "agenda", n: 3, texto: "Agenda" },
      ]
    : [{ id: "cuenta", n: 1, texto: "Cuenta" }];
  const iActual = pasos.findIndex((p) => p.id === paso);

  return (
    <div className="mb-5 flex items-center gap-2.5">
      {pasos.map((p, i) => (
        <div key={p.id} className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-7 w-7 flex-none items-center justify-center rounded-full text-[12px] font-medium",
              i < iActual ? "bg-ok text-paper" : i === iActual ? "bg-ink text-paper" : "bg-surface-3 text-ink-faint"
            )}
          >
            {i < iActual ? "✓" : p.n}
          </div>
          <span className={cn("text-[12px]", i === iActual ? "font-medium text-ink" : "text-ink-faint")}>
            {p.texto}
          </span>
          {i < pasos.length - 1 ? <div className="h-px w-8 bg-line-strong" /> : null}
        </div>
      ))}
    </div>
  );
}

export function AltaGuiada() {
  const [paso, setPaso] = useState<Paso>("cuenta");
  const [clienteId, setClienteId] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [conWhatsapp, setConWhatsapp] = useState(false);
  const [mensajeCuenta, setMensajeCuenta] = useState("");
  const [whatsappConectado, setWhatsappConectado] = useState(false);
  const [agendaSembrada, setAgendaSembrada] = useState(false);
  const [clave, setClave] = useState("");

  const [estadoCuenta, ejecutarCuenta, pendienteCuenta] = useAccionAdmin("crearCuentaCliente");
  const [estadoWa, ejecutarWa, pendienteWa] = useAccionAdmin("conectarWhatsapp");
  const [estadoAgenda, ejecutarAgenda, pendienteAgenda] = useAccionAdmin("sembrarAgenda");

  useEffect(() => {
    if (!estadoCuenta?.ok) return;
    const datos = estadoCuenta.datos as { clienteId?: string; esAgenteWhatsapp?: boolean } | undefined;
    setMensajeCuenta(estadoCuenta.mensaje);
    if (datos?.clienteId) setClienteId(datos.clienteId);
    if (datos?.esAgenteWhatsapp) {
      setConWhatsapp(true);
      setPaso("whatsapp");
    } else {
      setPaso("listo");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoCuenta]);

  useEffect(() => {
    if (!estadoWa?.ok) return;
    setWhatsappConectado(true);
    setPaso("agenda");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoWa]);

  useEffect(() => {
    if (!estadoAgenda?.ok) return;
    setAgendaSembrada(true);
    setPaso("listo");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoAgenda]);

  return (
    <div className="flex flex-col gap-5">
      <Progreso paso={paso} conWhatsapp={conWhatsapp} />

      {/* ---------------------------------------------------------- Paso 1 */}
      {paso === "cuenta" ? (
        <form
          action={(fd) => {
            setNombreNegocio(String(fd.get("nombreNegocio") ?? ""));
            ejecutarCuenta(fd);
          }}
          className="flex flex-col gap-6"
        >
          <CampoToken />
          <fieldset className="grid gap-4 sm:grid-cols-2" disabled={pendienteCuenta}>
            <Campo label="Nombre del negocio" name="nombreNegocio" requerido placeholder="Farmasi · Johana" />
            <Campo label="Rubro" name="rubro" placeholder="Suplementos y cuidado personal" />
            <Campo label="Persona de contacto" name="personaContacto" placeholder="Johana Rodríguez" />
            <Campo label="WhatsApp" name="whatsapp" placeholder="+506 6079 1641" />
            <Campo label="Correo de acceso" name="correo" requerido tipo="email" placeholder="johana@sunegocio.com" />
            <label className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-medium text-ink-mute">Plan</span>
              <select name="plan" defaultValue="Básico" className={cn(campo, "appearance-none")}>
                <option>Básico</option>
                <option>Growth</option>
                <option>Scale</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-medium text-ink-mute">Automatización</span>
              <select name="automatizacion" defaultValue="agente-whatsapp" className={cn(campo, "appearance-none")}>
                <option value="">— asignar después —</option>
                <option value="redes-sociales">Redes sociales</option>
                <option value="agente-whatsapp">Agente de WhatsApp</option>
                <option value="prospeccion-clientes">Prospección e inteligencia</option>
              </select>
              <span className="text-[11px] text-ink-faint">
                Con Agente de WhatsApp seguís acá mismo a conectar el número y la agenda.
              </span>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-medium text-ink-mute">
                Precio mensual <span className="text-ink-faint">(₡, opcional)</span>
              </span>
              <CampoMonto
                name="precioAsignacion"
                placeholder="Deja vacío = precio de lista"
                className={campo}
              />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[11.5px] font-medium text-ink-mute">
                Contraseña de primer acceso <span className="text-ink-faint">*</span>
              </span>
              <div className="flex gap-2">
                <input
                  name="clave" type="text" required minLength={8} value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="Al menos 8 caracteres" className={campo}
                />
                <button
                  type="button" onClick={() => setClave(claveAlAzar())}
                  className="h-11 flex-none rounded-xl border border-line-strong px-4 text-[12.5px] text-ink transition-colors hover:bg-surface-2"
                >
                  Generar
                </button>
              </div>
              <span className="text-[11px] text-ink-faint">
                Se la pasás vos por WhatsApp. No queda guardada — el cliente la cambia desde Ajustes.
              </span>
            </label>
          </fieldset>

          <ErrorBox error={!estadoCuenta?.ok ? estadoCuenta?.error : undefined} />

          <button type="submit" disabled={pendienteCuenta} className={cn(boton, "self-start")}>
            {pendienteCuenta ? "Creando…" : "Crear cuenta y seguir"}
          </button>
        </form>
      ) : null}

      {/* ------------------------------------------------------- Paso 2 */}
      {paso === "whatsapp" ? (
        <div className="flex flex-col gap-5">
          <ResumenCuenta nombreNegocio={nombreNegocio} mensaje={mensajeCuenta} />

          <form action={ejecutarWa} className="flex flex-col gap-4">
            <CampoToken />
            <input type="hidden" name="clienteId" value={clienteId} />
            <p className="text-[12.5px] text-ink-faint">
              Salen de crear el Usuario del Sistema en el Business Manager del cliente: asignale el
              activo de WhatsApp y generá el token permanente con los permisos{" "}
              <code>whatsapp_business_messaging</code> y <code>whatsapp_business_management</code>.
              Si todavía no lo tenés, saltalo — queda pendiente en la ficha del cliente.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={lblChico}>
                Phone Number ID
                <input name="phoneNumberId" placeholder="1316882374848089" className={cn(campoChico, "h-11 normal-case text-[14px]")} />
              </label>
              <label className={lblChico}>
                Endpoint (opcional)
                <input name="endpoint" placeholder="https://graph.facebook.com/v21.0" className={cn(campoChico, "h-11 normal-case text-[14px]")} />
              </label>
            </div>
            <label className={lblChico}>
              Token permanente
              <input name="token" type="password" autoComplete="off" className={cn(campoChico, "h-11 normal-case text-[14px]")} />
            </label>

            <ErrorBox error={!estadoWa?.ok ? estadoWa?.error : undefined} />

            <div className="flex items-center gap-3">
              <button type="submit" disabled={pendienteWa} className={boton}>
                {pendienteWa ? "Comprobando con Meta…" : "Conectar y seguir"}
              </button>
              <button
                type="button" disabled={pendienteWa}
                onClick={() => setPaso("agenda")}
                className={botonSecundario}
              >
                Hacerlo después →
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* -------------------------------------------------------- Paso 3 */}
      {paso === "agenda" ? (
        <div className="flex flex-col gap-5">
          <ResumenCuenta
            nombreNegocio={nombreNegocio}
            mensaje={mensajeCuenta}
            whatsappConectado={whatsappConectado}
          />

          <form action={ejecutarAgenda} className="flex flex-col gap-4">
            <CampoToken />
            <input type="hidden" name="clienteId" value={clienteId} />
            <p className="text-[12.5px] text-ink-faint">
              Punto de partida para que el agente pueda agendar desde el primer mensaje real. El
              cliente lo puede seguir editando después desde su propio panel — esto solo evita que
              arranque en &quot;capacidad 1, sin horario&quot;. Si preferís que lo defina el cliente
              mismo, saltalo.
            </p>

            <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-soft">
              <input type="checkbox" name="activa" defaultChecked={CONFIG_AGENDA_POR_DEFECTO.activa} className="h-3.5 w-3.5 accent-ink" />
              Agendamiento automático activo
            </label>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className={lblChico}>
                Capacidad
                <input type="number" name="capacidad" min={1} max={20} defaultValue={CONFIG_AGENDA_POR_DEFECTO.capacidad} className={cn(campoChico, "normal-case")} />
              </label>
              <label className={lblChico}>
                Colchón (min)
                <input type="number" name="colchonMin" min={0} max={120} defaultValue={CONFIG_AGENDA_POR_DEFECTO.colchonMin} className={cn(campoChico, "normal-case")} />
              </label>
              <label className={lblChico}>
                Anticipación (min)
                <input type="number" name="anticipacionMin" min={0} max={1440} defaultValue={CONFIG_AGENDA_POR_DEFECTO.anticipacionMin} className={cn(campoChico, "normal-case")} />
              </label>
              <label className={lblChico}>
                Días adelante
                <input type="number" name="maximoDiasAdelante" min={1} max={90} defaultValue={CONFIG_AGENDA_POR_DEFECTO.maximoDiasAdelante} className={cn(campoChico, "normal-case")} />
              </label>
            </div>

            <HorarioPorDefecto />

            <ErrorBox error={!estadoAgenda?.ok ? estadoAgenda?.error : undefined} />

            <div className="flex items-center gap-3">
              <button type="submit" disabled={pendienteAgenda} className={boton}>
                {pendienteAgenda ? "Guardando…" : "Guardar y terminar"}
              </button>
              <button
                type="button" disabled={pendienteAgenda}
                onClick={() => setPaso("listo")}
                className={botonSecundario}
              >
                Hacerlo después →
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* ----------------------------------------------------------- Listo */}
      {paso === "listo" ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2.5 text-ok">
            <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-ok text-paper text-[12px]">✓</div>
            <span className="text-[14px] font-medium">{nombreNegocio || "Cliente"} quedó de alta.</span>
          </div>

          <ResumenCuenta
            nombreNegocio={nombreNegocio}
            mensaje={mensajeCuenta}
            whatsappConectado={conWhatsapp ? whatsappConectado : undefined}
            agendaSembrada={conWhatsapp ? agendaSembrada : undefined}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Link href={clienteId ? `/panel/admin/clientes/${clienteId}` : "/panel/admin/clientes"} className={boton}>
              Ver ficha del cliente
            </Link>
            <button
              type="button"
              onClick={() => {
                setPaso("cuenta");
                setClienteId("");
                setNombreNegocio("");
                setConWhatsapp(false);
                setMensajeCuenta("");
                setWhatsappConectado(false);
                setAgendaSembrada(false);
                setClave("");
              }}
              className={botonSecundario}
            >
              Dar de alta a otro cliente
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** El correo/link/contraseña del paso 1, siempre a la vista mientras se
    avanza por los siguientes pasos — es lo único de toda la alta que hay
    que copiar y pegar, y perderlo de vista a medio wizard sería un dolor
    de cabeza real (tocaría ir a buscarlo en la ficha del cliente). */
function ResumenCuenta({
  nombreNegocio, mensaje, whatsappConectado, agendaSembrada,
}: {
  nombreNegocio: string;
  mensaje: string;
  whatsappConectado?: boolean;
  agendaSembrada?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-2 p-4">
      <p className="mb-2 text-[11px] font-medium tracking-wide text-ink-mute uppercase">
        {nombreNegocio || "Cuenta creada"}
      </p>
      <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-ink-soft">{mensaje}</p>
      {whatsappConectado !== undefined ? (
        <p className={cn("mt-3 text-[12px]", whatsappConectado ? "text-ok" : "text-ink-faint")}>
          {whatsappConectado ? "✓ WhatsApp conectado" : "— WhatsApp: pendiente (se hace después desde la ficha)"}
        </p>
      ) : null}
      {agendaSembrada !== undefined ? (
        <p className={cn("text-[12px]", agendaSembrada ? "text-ok" : "text-ink-faint")}>
          {agendaSembrada ? "✓ Agenda y horario sembrados" : "— Agenda: pendiente (se hace después desde la ficha)"}
        </p>
      ) : null}
    </div>
  );
}

/** Lunes a viernes 8-17, sábado y domingo cerrado — el punto de partida más
    común. Sin toggles de abrir/cerrar acá (eso ya lo tiene el cliente en su
    propio panel): esto es solo para no dejarlo en blanco del todo. */
function HorarioPorDefecto() {
  return (
    <div className="flex flex-col gap-1.5">
      {DIAS_HORARIO.map(({ clave, texto }) => {
        const finde = clave === "sab" || clave === "dom";
        return (
          <div key={clave} className="flex items-center gap-2">
            <span className="w-20 flex-none text-[12px] text-ink-soft">{texto}</span>
            <input type="time" name={`ini_${clave}`} defaultValue={finde ? "" : "08:00"} disabled={finde} className={cn(campoChico, "max-w-[110px] disabled:opacity-40")} />
            <span className="text-ink-faint">–</span>
            <input type="time" name={`fin_${clave}`} defaultValue={finde ? "" : "17:00"} disabled={finde} className={cn(campoChico, "max-w-[110px] disabled:opacity-40")} />
            <input type="hidden" name={`cerrado_${clave}`} value={finde ? "on" : ""} />
          </div>
        );
      })}
    </div>
  );
}

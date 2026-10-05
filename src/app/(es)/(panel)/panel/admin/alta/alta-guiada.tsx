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

   Rediseño 2026-09-30 (presentación; mismas acciones y mismos campos):
   - el paso en que se está se DERIVA de los resultados de las acciones, sin
     efectos que llamen a setState (antes había tres, con error de lint);
   - los campos no se borran si el servidor rechaza algo (ver `useEnvio`);
   - los errores del servidor marcan el campo que corresponde.
   ========================================================================== */
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useAccionAdmin } from "@/components/panel/usar-accion-admin";
import { CampoMonto } from "@/components/panel/campo-monto";
import { CampoToken } from "@/components/panel/campo-token";
import { colones } from "@/components/panel/ui";
import {
  BTN_PRIMARIO,
  BTN_SECUNDARIO,
  CAMPO,
  ETIQUETA,
  MensajeAccion,
  Selector,
} from "@/components/admin/admin-ui";
import { BotonCopiar } from "@/components/admin/boton-copiar";
import { useEnvio } from "@/components/admin/usar-envio";
import { DIAS_HORARIO, CONFIG_AGENDA_POR_DEFECTO } from "@/lib/panel/agente-config";
import { cn } from "@/lib/utils";

type Paso = "cuenta" | "whatsapp" | "agenda" | "listo";

export type OpcionAutomatizacion = {
  slug: string;
  nombre: string;
  /** `null` = se cotiza, no tiene precio de lista. */
  precio: number | null;
};

/** Marca un campo que el servidor rechazó. */
const CAMPO_MAL = "border-bad/60 focus:border-bad focus:ring-bad/20";

function claveAlAzar() {
  const abc = "abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ2345679";
  const azar = new Uint32Array(12);
  crypto.getRandomValues(azar);
  return Array.from(azar, (n) => abc[n % abc.length]).join("");
}

function Campo({
  label,
  name,
  requerido,
  tipo = "text",
  placeholder,
  ayuda,
  mal,
  inputMode,
}: {
  label: string;
  name: string;
  requerido?: boolean;
  tipo?: string;
  placeholder?: string;
  ayuda?: string;
  mal?: boolean;
  inputMode?: "text" | "email" | "tel" | "numeric" | "url";
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className={ETIQUETA}>
        {label} {requerido ? <span className="text-ink-faint">*</span> : null}
      </span>
      <input
        name={name}
        type={tipo}
        required={requerido}
        placeholder={placeholder}
        autoComplete="off"
        autoCapitalize={tipo === "email" ? "none" : undefined}
        inputMode={inputMode}
        aria-invalid={mal || undefined}
        className={cn(CAMPO, mal && CAMPO_MAL)}
      />
      {ayuda ? <span className="text-[11.5px] leading-snug text-ink-faint">{ayuda}</span> : null}
    </label>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5">
      <h3 className="font-mono text-[10.5px] font-medium tracking-[0.14em] text-ink-faint uppercase">{titulo}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/** Los pasos, con su numerito y si ya quedaron atrás. En celular solo el actual lleva nombre. */
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
    <ol className="flex items-center gap-2" aria-label="Progreso del alta">
      {pasos.map((p, i) => (
        <li
          key={p.id}
          aria-current={i === iActual ? "step" : undefined}
          className={cn("flex items-center gap-2", i < pasos.length - 1 && "flex-1")}
        >
          <span
            className={cn(
              "grid h-7 w-7 flex-none place-items-center rounded-full text-[12px] font-medium",
              i < iActual
                ? "bg-ok text-paper"
                : i === iActual
                  ? "bg-[var(--panel-acento,#7c5cff)] text-white"
                  : "bg-surface-3 text-ink-faint"
            )}
          >
            {i < iActual ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="m5 12 5 5 9-9" />
              </svg>
            ) : (
              p.n
            )}
          </span>
          <span
            className={cn(
              "text-[12.5px]",
              i === iActual ? "font-medium text-ink" : "hidden text-ink-faint sm:inline"
            )}
          >
            {p.texto}
          </span>
          {i < pasos.length - 1 ? <span className="h-px min-w-4 flex-1 bg-line-strong" aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}

/** Reinicia todo el flujo con solo cambiar la `key`: cada paso tiene su propio estado. */
export function AltaGuiada({ automatizaciones }: { automatizaciones: OpcionAutomatizacion[] }) {
  const [ronda, setRonda] = useState(0);
  return (
    <FlujoAlta key={ronda} automatizaciones={automatizaciones} reiniciar={() => setRonda((n) => n + 1)} />
  );
}

function FlujoAlta({
  automatizaciones,
  reiniciar,
}: {
  automatizaciones: OpcionAutomatizacion[];
  reiniciar: () => void;
}) {
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [clave, setClave] = useState("");
  const [auto, setAuto] = useState(
    automatizaciones.some((a) => a.slug === "agente-whatsapp") ? "agente-whatsapp" : ""
  );
  const [saltoWa, setSaltoWa] = useState(false);
  const [saltoAgenda, setSaltoAgenda] = useState(false);

  const [estadoCuenta, ejecutarCuenta, pendienteCuenta] = useAccionAdmin("crearCuentaCliente");
  const [estadoWa, ejecutarWa, pendienteWa] = useAccionAdmin("conectarWhatsapp");
  const [estadoAgenda, ejecutarAgenda, pendienteAgenda] = useAccionAdmin("sembrarAgenda");

  const envioCuenta = useEnvio(estadoCuenta, ejecutarCuenta, {
    limpiarSiOk: false,
    alEnviar: (fd) => setNombreNegocio(String(fd.get("nombreNegocio") ?? "")),
  });
  const envioWa = useEnvio(estadoWa, ejecutarWa, { limpiarSiOk: false });
  const envioAgenda = useEnvio(estadoAgenda, ejecutarAgenda, { limpiarSiOk: false });

  /* El paso se deduce de lo que ya pasó: no hay que "avisarle" a nadie. */
  const cuentaOk = estadoCuenta?.ok === true ? estadoCuenta : null;
  const datos = cuentaOk?.datos as { clienteId?: string; esAgenteWhatsapp?: boolean } | undefined;
  const clienteId = datos?.clienteId ?? "";
  const conWhatsapp = Boolean(datos?.esAgenteWhatsapp);
  const mensajeCuenta = cuentaOk?.mensaje ?? "";
  const whatsappConectado = estadoWa?.ok === true;
  const agendaSembrada = estadoAgenda?.ok === true;

  const paso: Paso = !cuentaOk
    ? "cuenta"
    : !conWhatsapp
      ? "listo"
      : !(whatsappConectado || saltoWa)
        ? "whatsapp"
        : !(agendaSembrada || saltoAgenda)
          ? "agenda"
          : "listo";

  /* El error del servidor marca el campo del que habla. "Faltan…" nombra
     varios a la vez: ahí no se marca ninguno. */
  const errorCuenta = estadoCuenta && !estadoCuenta.ok ? estadoCuenta.error : "";
  const generico = /^Faltan/.test(errorCuenta);
  const malCorreo = !generico && /correo/i.test(errorCuenta);
  const malClave = !generico && /contraseña/i.test(errorCuenta);

  const elegida = automatizaciones.find((a) => a.slug === auto);

  return (
    <div className="flex flex-col gap-5">
      <Progreso paso={paso} conWhatsapp={paso === "cuenta" ? auto === "agente-whatsapp" : conWhatsapp} />

      {/* ---------------------------------------------------------- Paso 1 */}
      {paso === "cuenta" ? (
        <form {...envioCuenta} className="flex flex-col gap-6">
          <CampoToken />
          <p className="text-[12px] text-ink-faint">Los campos con * son obligatorios.</p>

          <fieldset className="flex min-w-0 flex-col gap-6" disabled={pendienteCuenta}>
            <Grupo titulo="El negocio">
              <Campo label="Nombre del negocio" name="nombreNegocio" requerido placeholder="Farmasi · Johana" />
              <Campo label="Rubro" name="rubro" placeholder="Suplementos y cuidado personal" />
              <Campo label="Persona de contacto" name="personaContacto" placeholder="Johana Rodríguez" />
              <Campo label="WhatsApp" name="whatsapp" placeholder="+506 6079 1641" tipo="tel" inputMode="tel" />
            </Grupo>

            <Grupo titulo="Acceso al panel">
              <Campo
                label="Correo de acceso"
                name="correo"
                requerido
                tipo="email"
                inputMode="email"
                placeholder="johana@sunegocio.com"
                mal={malCorreo}
              />
              <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="alta-clave" className={ETIQUETA}>
                  Contraseña de primer acceso <span className="text-ink-faint">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="alta-clave"
                    name="clave"
                    type="text"
                    required
                    minLength={8}
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                    placeholder="Al menos 8 caracteres"
                    autoComplete="off"
                    aria-invalid={malClave || undefined}
                    aria-describedby="alta-clave-ayuda"
                    className={cn(CAMPO, malClave && CAMPO_MAL)}
                  />
                  <button
                    type="button"
                    onClick={() => setClave(claveAlAzar())}
                    className={cn(BTN_SECUNDARIO, "px-4")}
                  >
                    Generar
                  </button>
                </div>
                <span
                  id="alta-clave-ayuda"
                  aria-live="polite"
                  className={cn(
                    "text-[11.5px] leading-snug",
                    clave.length === 0 ? "text-ink-faint" : clave.length < 8 ? "text-warn" : "text-ok"
                  )}
                >
                  {clave.length === 0
                    ? "Se la pasás vos por WhatsApp. No queda guardada: el cliente la cambia desde Ajustes."
                    : clave.length < 8
                      ? `Faltan ${8 - clave.length} ${8 - clave.length === 1 ? "carácter" : "caracteres"} para llegar a 8.`
                      : "Lista. Al crear la cuenta queda a la vista para pasársela al cliente."}
                </span>
              </div>
            </Grupo>

            <Grupo titulo="Qué contrata">
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className={ETIQUETA}>Plan</span>
                <Selector name="plan" defaultValue="Básico">
                  <option>Básico</option>
                  <option>Growth</option>
                  <option>Scale</option>
                </Selector>
              </label>
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className={ETIQUETA}>Automatización</span>
                <Selector name="automatizacion" value={auto} onChange={(e) => setAuto(e.target.value)}>
                  <option value="">— asignar después —</option>
                  {automatizaciones.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.nombre}
                    </option>
                  ))}
                </Selector>
                <span className="text-[11.5px] leading-snug text-ink-faint">
                  {auto === "agente-whatsapp"
                    ? "Con el Agente de WhatsApp seguís acá mismo a conectar el número y la agenda."
                    : auto === ""
                      ? "Se la podés sumar después desde «Asignar automatización»."
                      : "Queda asignada y activa apenas se crea la cuenta."}
                </span>
              </label>
              <label className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 sm:max-w-[50%]">
                <span className={ETIQUETA}>
                  Precio mensual <span className="text-ink-faint">(₡, opcional)</span>
                </span>
                <CampoMonto
                  name="precioAsignacion"
                  placeholder={
                    elegida
                      ? elegida.precio != null
                        ? `Precio de lista: ${colones(elegida.precio)}`
                        : "Esta se cotiza"
                      : "Precio de lista"
                  }
                  className={CAMPO}
                />
                <span className="text-[11.5px] leading-snug text-ink-faint">
                  Vacío = precio de lista. Bajalo si le hacés precio de fundador.
                </span>
              </label>
            </Grupo>
          </fieldset>

          {errorCuenta ? <MensajeAccion estado={estadoCuenta} /> : null}

          <button type="submit" disabled={pendienteCuenta} className={cn(BTN_PRIMARIO, "self-start")}>
            {pendienteCuenta ? "Creando la cuenta…" : "Crear cuenta y seguir"}
          </button>
        </form>
      ) : null}

      {/* ------------------------------------------------------- Paso 2 */}
      {paso === "whatsapp" ? (
        <div className="flex flex-col gap-5">
          <ResumenCuenta nombreNegocio={nombreNegocio} mensaje={mensajeCuenta} />

          <form {...envioWa} className="flex flex-col gap-4">
            <CampoToken />
            <input type="hidden" name="clienteId" value={clienteId} />
            <div>
              <h3 className="text-[14px] font-semibold tracking-tight text-ink">Conectar el WhatsApp</h3>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-faint">
                Salen de crear el Usuario del Sistema en el Business Manager del cliente: asignale el
                activo de WhatsApp y generá el token permanente con los permisos{" "}
                <code className="rounded bg-surface-3 px-1 py-px font-mono text-[11px]">whatsapp_business_messaging</code> y{" "}
                <code className="rounded bg-surface-3 px-1 py-px font-mono text-[11px]">whatsapp_business_management</code>.
                Si todavía no lo tenés, saltalo: queda pendiente en la ficha del cliente.
              </p>
            </div>
            <fieldset className="flex min-w-0 flex-col gap-3.5" disabled={pendienteWa}>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className={ETIQUETA}>Phone Number ID</span>
                  <input name="phoneNumberId" placeholder="1316882374848089" inputMode="numeric" autoComplete="off" className={CAMPO} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className={ETIQUETA}>Endpoint (opcional)</span>
                  <input name="endpoint" placeholder="https://graph.facebook.com/v21.0" inputMode="url" autoComplete="off" className={CAMPO} />
                </label>
              </div>
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className={ETIQUETA}>Token permanente</span>
                <input name="token" type="password" autoComplete="off" className={CAMPO} />
              </label>
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className={ETIQUETA}>WABA ID (opcional)</span>
                <input name="wabaId" placeholder="102938475610234" inputMode="numeric" autoComplete="off" className={CAMPO} />
                <span className="text-[11.5px] leading-snug text-ink-faint">
                  Sirve para armar la plantilla de recordatorios.
                </span>
              </label>
            </fieldset>

            <MensajeAccion estado={estadoWa && !estadoWa.ok ? estadoWa : null} />

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={pendienteWa} className={BTN_PRIMARIO}>
                {pendienteWa ? "Comprobando con Meta…" : "Conectar y seguir"}
              </button>
              <button
                type="button"
                disabled={pendienteWa}
                onClick={() => setSaltoWa(true)}
                className={BTN_SECUNDARIO}
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

          <form {...envioAgenda} className="flex flex-col gap-4">
            <CampoToken />
            <input type="hidden" name="clienteId" value={clienteId} />
            <div>
              <h3 className="text-[14px] font-semibold tracking-tight text-ink">Agenda y horario</h3>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-faint">
                Punto de partida para que el agente pueda agendar desde el primer mensaje real. El cliente
                lo puede seguir editando después desde su propio panel; esto solo evita que arranque en
                «capacidad 1, sin horario». Si preferís que lo defina el cliente, saltalo.
              </p>
            </div>

            <fieldset className="flex min-w-0 flex-col gap-4" disabled={pendienteAgenda}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[13px] text-ink-soft">
                <input
                  type="checkbox"
                  name="activa"
                  defaultChecked={CONFIG_AGENDA_POR_DEFECTO.activa}
                  className="h-5 w-5 flex-none accent-[var(--panel-acento,#7c5cff)]"
                />
                Agendamiento automático activo
              </label>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className={ETIQUETA}>Capacidad</span>
                  <input type="number" name="capacidad" min={1} max={20} inputMode="numeric" defaultValue={CONFIG_AGENDA_POR_DEFECTO.capacidad} className={CAMPO} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className={ETIQUETA}>Colchón (min)</span>
                  <input type="number" name="colchonMin" min={0} max={120} inputMode="numeric" defaultValue={CONFIG_AGENDA_POR_DEFECTO.colchonMin} className={CAMPO} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className={ETIQUETA}>Anticipación (min)</span>
                  <input type="number" name="anticipacionMin" min={0} max={1440} inputMode="numeric" defaultValue={CONFIG_AGENDA_POR_DEFECTO.anticipacionMin} className={CAMPO} />
                </label>
                <label className="flex min-w-0 flex-col gap-1.5">
                  <span className={ETIQUETA}>Días adelante</span>
                  <input type="number" name="maximoDiasAdelante" min={1} max={90} inputMode="numeric" defaultValue={CONFIG_AGENDA_POR_DEFECTO.maximoDiasAdelante} className={CAMPO} />
                </label>
              </div>

              <HorarioPorDefecto />
            </fieldset>

            <MensajeAccion estado={estadoAgenda && !estadoAgenda.ok ? estadoAgenda : null} />

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={pendienteAgenda} className={BTN_PRIMARIO}>
                {pendienteAgenda ? "Guardando…" : "Guardar y terminar"}
              </button>
              <button
                type="button"
                disabled={pendienteAgenda}
                onClick={() => setSaltoAgenda(true)}
                className={BTN_SECUNDARIO}
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
          <div className="flex items-center gap-3 text-ok">
            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-ok text-paper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="m5 12 5 5 9-9" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">{nombreNegocio || "Cliente"} quedó de alta.</span>
          </div>

          <ResumenCuenta
            nombreNegocio={nombreNegocio}
            mensaje={mensajeCuenta}
            whatsappConectado={conWhatsapp ? whatsappConectado : undefined}
            agendaSembrada={conWhatsapp ? agendaSembrada : undefined}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={clienteId ? `/panel/admin/clientes/${clienteId}` : "/panel/admin/clientes"}
              prefetch={false}
              className={BTN_PRIMARIO}
            >
              Ver ficha del cliente
            </Link>
            <button type="button" onClick={reiniciar} className={BTN_SECUNDARIO}>
              Dar de alta a otro cliente
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Los datos para pasarle al cliente: las líneas con viñeta del mensaje de la acción. */
function datosParaElCliente(mensaje: string) {
  const lineas = mensaje
    .split("\n")
    .filter((l) => l.trim().startsWith("•"))
    .map((l) => l.replace(/^\s*•\s*/, ""));
  return lineas.length > 0 ? lineas.join("\n") : mensaje;
}

/** El correo/link/contraseña del paso 1, siempre a la vista mientras se
    avanza por los siguientes pasos — es lo único de toda la alta que hay
    que copiar y pegar, y perderlo de vista a medio wizard sería un dolor
    de cabeza real (tocaría ir a buscarlo en la ficha del cliente). */
function ResumenCuenta({
  nombreNegocio,
  mensaje,
  whatsappConectado,
  agendaSembrada,
}: {
  nombreNegocio: string;
  mensaje: string;
  whatsappConectado?: boolean;
  agendaSembrada?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <p className="font-mono text-[10.5px] font-medium tracking-[0.14em] text-ink-faint uppercase">
          {nombreNegocio || "Cuenta creada"}
        </p>
        <BotonCopiar texto={datosParaElCliente(mensaje)} etiqueta="Copiar datos de acceso" />
      </div>
      <p className="mt-2.5 text-[12.5px] leading-relaxed [overflow-wrap:anywhere] whitespace-pre-line text-ink-soft">
        {mensaje}
      </p>
      {whatsappConectado !== undefined || agendaSembrada !== undefined ? (
        <ul className="mt-3 flex flex-col gap-1 border-t border-line pt-3 text-[12px]">
          {whatsappConectado !== undefined ? (
            <li className={whatsappConectado ? "text-ok" : "text-ink-faint"}>
              {whatsappConectado ? "✓ WhatsApp conectado" : "— WhatsApp: pendiente (se hace después desde la ficha)"}
            </li>
          ) : null}
          {agendaSembrada !== undefined ? (
            <li className={agendaSembrada ? "text-ok" : "text-ink-faint"}>
              {agendaSembrada ? "✓ Agenda y horario sembrados" : "— Agenda: pendiente (se hace después desde la ficha)"}
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}

/** Lunes a viernes 8-17, sábado y domingo cerrado — el punto de partida más
    común. Sin toggles de abrir/cerrar acá (eso ya lo tiene el cliente en su
    propio panel): esto es solo para no dejarlo en blanco del todo. */
function HorarioPorDefecto() {
  return (
    <div className="flex flex-col divide-y divide-line rounded-xl border border-line px-3.5">
      {DIAS_HORARIO.map(({ clave, texto }) => {
        const finde = clave === "sab" || clave === "dom";
        return (
          <div key={clave} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5 sm:flex-nowrap">
            <span className="w-full flex-none text-[13px] text-ink-soft sm:w-32">
              {texto}
              {finde ? <span className="ml-2 text-[11.5px] text-ink-faint">cerrado</span> : null}
            </span>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <input
                type="time"
                name={`ini_${clave}`}
                defaultValue={finde ? "" : "08:00"}
                disabled={finde}
                aria-label={`${texto}: abre`}
                className={cn(CAMPO, "sm:max-w-[140px]")}
              />
              <span className="text-ink-faint" aria-hidden="true">
                –
              </span>
              <input
                type="time"
                name={`fin_${clave}`}
                defaultValue={finde ? "" : "17:00"}
                disabled={finde}
                aria-label={`${texto}: cierra`}
                className={cn(CAMPO, "sm:max-w-[140px]")}
              />
            </div>
            <input type="hidden" name={`cerrado_${clave}`} value={finde ? "on" : ""} />
          </div>
        );
      })}
    </div>
  );
}

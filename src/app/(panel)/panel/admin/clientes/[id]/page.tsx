/* ==========================================================================
   Ficha de un cliente para el admin: todo de un vistazo — automatizaciones,
   cobros, conexiones, actividad — y los botones para suspender/reactivar el
   servicio y registrar pagos.
   ========================================================================== */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Caja, CajaHead, Eyebrow, PageHead, Pill, colones } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import { getFichaCliente } from "@/lib/panel/admin";
import { waLinkCliente } from "@/lib/utils";
import {
  AccesoCliente,
  EliminarCliente,
  AgregarCobro,
  BotonPago,
  BotonServicio,
  EditarDatosCliente,
  PrecioAsignacion,
} from "./acciones-cliente";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const f = await getFichaCliente(id);
  return { title: f ? `${f.nombreNegocio} · Admin Hoshizora` : "Cliente · Admin" };
}

const ESTADO_CLI: Record<string, { texto: string; tono: "ok" | "warn" | "bad" | "idle" }> = {
  activo: { texto: "Activo", tono: "ok" },
  prueba: { texto: "En prueba", tono: "warn" },
  pausado: { texto: "Suspendido", tono: "bad" },
  moroso: { texto: "Moroso", tono: "bad" },
};
const ESTADO_COBRO: Record<string, { texto: string; tono: "ok" | "warn" | "bad" }> = {
  pagado: { texto: "Pagado", tono: "ok" },
  pendiente: { texto: "Pendiente", tono: "warn" },
  vencido: { texto: "Vencido", tono: "bad" },
};

export default async function FichaClientePage({ params }: Props) {
  const { id } = await params;
  const f = await getFichaCliente(id);
  if (!f) notFound();

  const suspendido = f.estado === "pausado" || f.estado === "moroso";
  const ingreso = f.automatizaciones
    .filter((a) => a.estado === "activa")
    .reduce((s, a) => s + a.precioMensual, 0);
  const cobroPendiente = f.cobros.find((c) => c.estado !== "pagado");

  return (
    <>
      <Link
        href="/panel/admin/clientes"
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-mute transition-colors hover:text-ink"
      >
        <Icono nombre="flecha" className="h-3 w-3 rotate-180" />
        Clientes
      </Link>

      <PageHead titulo={f.nombreNegocio} sub={`Cliente desde ${f.desde}`}>
        <Pill tono={ESTADO_CLI[f.estado]?.tono ?? "idle"}>
          {ESTADO_CLI[f.estado]?.texto ?? f.estado}
        </Pill>
      </PageHead>

      {suspendido ? (
        <Caja className="border-bad/30 bg-bad/5">
          <p className="text-[13px] text-bad">
            El servicio de este cliente está suspendido. No se publica nada
            hasta reactivarlo.
          </p>
        </Caja>
      ) : null}

      <section className="grid gap-[18px] lg:grid-cols-2">
        <Caja>
          <CajaHead eyebrow="Contacto" titulo="Datos">
            <EditarDatosCliente
              clienteId={f.id}
              datos={{
                nombreNegocio: f.nombreNegocio,
                personaContacto: f.personaContacto,
                whatsapp: f.whatsapp,
                rubro: f.rubro,
                plan: f.plan,
              }}
            />
          </CajaHead>
          <dl className="text-[12.5px]">
            {[
              ["Persona", f.personaContacto || "—"],
              ["Correo", f.correo],
              ["WhatsApp", f.whatsapp || "—"],
              ["Plan", f.plan],
              ["Formulario del negocio", f.onboardingCompleto ? "Completo" : "Sin llenar"],
              ["Ingreso mensual", colones(ingreso)],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                className={
                  i === arr.length - 1
                    ? "flex justify-between gap-3 py-2"
                    : "flex justify-between gap-3 border-b border-line py-2"
                }
              >
                <dt className="text-ink-mute">{k}</dt>
                <dd className="text-right font-mono text-ink-soft">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {f.whatsapp ? (
              <a
                href={waLinkCliente(f.whatsapp, `Hola ${f.personaContacto || ""}, te escribo de Hoshizora.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center rounded-full border border-line-strong px-4 text-[12px] text-ink transition-colors hover:bg-surface-2"
              >
                Escribir por WhatsApp
              </a>
            ) : null}
            <AccesoCliente clienteId={f.id} correoActual={f.correo} />
          </div>
        </Caja>

        <Caja>
          <CajaHead eyebrow="Servicio" titulo="Estado y acciones" />
          <p className="mb-3 text-[13px] text-ink-faint">
            {suspendido
              ? "Reactivá para que vuelva a publicar."
              : f.estado === "prueba"
                ? "En prueba: no entra en la facturación automática hasta que lo actives."
                : cobroPendiente
                  ? `Tiene ${colones(cobroPendiente.monto)} de ${cobroPendiente.periodo} sin pagar.`
                  : "Al día. Todo corriendo."}
          </p>
          <BotonServicio clienteId={f.id} estadoCliente={f.estado} />
        </Caja>
      </section>

      <section>
        <div className="mb-3">
          <Eyebrow>
            Puesta en marcha ·{" "}
            {f.onboarding.completo
              ? "lista"
              : `${f.onboarding.hechos} de ${f.onboarding.total}`}
          </Eyebrow>
        </div>
        <Caja className="flex flex-wrap gap-x-8 gap-y-2">
          {[
            ["Perfil del negocio", f.onboarding.perfil, true],
            ["Buffer conectado", f.onboarding.buffer, f.onboarding.total > 1],
            ["Subió contenido", f.onboarding.contenido, f.onboarding.total > 1],
          ]
            .filter(([, , aplica]) => aplica)
            .map(([texto, hecho]) => (
              <div key={texto as string} className="flex items-center gap-2 text-[12.5px]">
                <span
                  className={
                    hecho
                      ? "grid h-4 w-4 place-items-center rounded-full bg-ok/15 text-ok"
                      : "grid h-4 w-4 place-items-center rounded-full bg-warn/15 text-warn"
                  }
                  aria-hidden="true"
                >
                  {hecho ? "✓" : "·"}
                </span>
                <span className={hecho ? "text-ink-soft" : "text-ink-mute"}>
                  {texto as string}
                </span>
              </div>
            ))}
        </Caja>
      </section>

      <section>
        <div className="mb-3">
          <Eyebrow>Automatizaciones · {f.automatizaciones.length}</Eyebrow>
        </div>
        {f.automatizaciones.length === 0 ? (
          <Caja className="text-center">
            <p className="py-4 text-[13px] text-ink-faint">
              Sin automatizaciones.{" "}
              <Link
                href={`/panel/admin/asignar?cliente=${f.id}`}
                className="text-ink-mute underline underline-offset-2 hover:text-ink"
              >
                Asignar una
              </Link>
              .
            </p>
          </Caja>
        ) : (
          <div className="flex flex-col gap-2">
            {f.automatizaciones.map((a) => (
              <Caja key={a.id} className="flex flex-wrap items-center gap-4">
                <span className="flex-1 text-[13.5px] font-medium text-ink">
                  {a.nombre}
                </span>
                <Pill tono={a.estado === "activa" ? "ok" : "idle"}>
                  {a.estado === "activa" ? "Activa" : "Pausada"}
                </Pill>
                <PrecioAsignacion
                  clienteId={f.id}
                  asignacionId={a.id}
                  precio={a.precioMensual}
                />
              </Caja>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3">
          <Eyebrow>Cobros</Eyebrow>
        </div>

        <Caja className="mb-2.5">
          <CajaHead
            eyebrow="Nuevo"
            titulo="Agregar el cobro de un mes"
          />
          <p className="mb-3 text-[12px] text-ink-faint">
            El monto arranca con la suma de las automatizaciones activas
            ({colones(ingreso)}). Bajalo o ajustalo si ese mes hay promo.
          </p>
          <AgregarCobro clienteId={f.id} montoSugerido={ingreso} />
        </Caja>

        <Caja plano>
          {f.cobros.length === 0 ? (
            <p className="px-2 py-4 text-center text-[13px] text-ink-faint">
              Sin cobros registrados.
            </p>
          ) : (
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-line text-left font-mono text-[10px] tracking-wide text-ink-faint uppercase">
                  <th className="px-1.5 py-2 font-medium">Periodo</th>
                  <th className="px-1.5 py-2 font-medium">Monto</th>
                  <th className="px-1.5 py-2 font-medium">Estado</th>
                  <th className="px-1.5 py-2 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {f.cobros.map((c) => (
                  <tr key={c.id} className="border-b border-line last:border-0">
                    <td className="px-1.5 py-2.5 text-ink-soft">{c.periodo}</td>
                    <td className="px-1.5 py-2.5 font-mono text-ink-soft">
                      {colones(c.monto)}
                    </td>
                    <td className="px-1.5 py-2.5">
                      <Pill tono={ESTADO_COBRO[c.estado]?.tono ?? "warn"}>
                        {ESTADO_COBRO[c.estado]?.texto ?? c.estado}
                      </Pill>
                    </td>
                    <td className="px-1.5 py-2.5 text-right">
                      {c.estado !== "pagado" ? (
                        <BotonPago clienteId={f.id} cobroId={c.id} />
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Caja>
      </section>

      <section className="grid gap-[18px] lg:grid-cols-2">
        <Caja>
          <CajaHead eyebrow="Conexiones" titulo={`${f.conexiones.length} registradas`} />
          {f.conexiones.length === 0 ? (
            <p className="py-3 text-[13px] text-ink-faint">Ninguna todavía.</p>
          ) : (
            <ul className="flex flex-col text-[12.5px]">
              {f.conexiones.map((x) => (
                <li
                  key={x.servicio}
                  className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0"
                >
                  <span className="text-ink-soft capitalize">{x.servicio}</span>
                  <span className="font-mono text-[11px] text-ink-faint">
                    {x.estado}
                    {x.referencia ? ` · ${x.referencia}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Caja>

        <Caja>
          <CajaHead eyebrow="Actividad" titulo="Últimos movimientos" />
          {f.actividad.length === 0 ? (
            <p className="py-3 text-[13px] text-ink-faint">Sin actividad.</p>
          ) : (
            <ul className="flex flex-col text-[12px]">
              {f.actividad.map((x) => (
                <li key={x.id} className="flex gap-3 border-b border-line py-2 last:border-0">
                  <time className="w-16 flex-none font-mono text-[10.5px] text-ink-faint">
                    {x.cuando}
                  </time>
                  <span className="text-ink-soft">{x.descripcion}</span>
                </li>
              ))}
            </ul>
          )}
        </Caja>
      </section>

      <section>
        <div className="mb-3">
          <Eyebrow>Zona de peligro</Eyebrow>
        </div>
        <Caja className="border-bad/20">
          <p className="mb-3 text-[13px] text-ink-faint">
            Eliminar borra al cliente y todo lo suyo para siempre. Si sólo
            querés que deje de publicar, usá “Suspender servicio”.
          </p>
          <EliminarCliente clienteId={f.id} nombreNegocio={f.nombreNegocio} />
        </Caja>
      </section>
    </>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Copy,
  WhatsappLogo,
  ArrowLeft,
  Check,
  Megaphone,
  ChatCircleDots,
  Receipt as ReceiptIcon,
  Package,
  ChartBar,
  UsersThree,
  EnvelopeSimple,
  CalendarBlank,
  Table,
  CloudArrowUp,
  Cube,
  AddressBook,
  Storefront,
  Bank,
  CheckSquare,
  InstagramLogo,
} from "@phosphor-icons/react/dist/ssr";
import {
  planes,
  catalogo,
  herramientas,
  planPorNivel,
  type Automatizacion,
  type ProcesoSlug,
  type ToolId,
} from "@/lib/content";
import { colones, site, waLink } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ReceiptUpload } from "@/components/receipt-upload";
import { FlowStrip } from "@/components/home/flow-strip";

/* Íconos por proceso e por herramienta: los mismos glifos que ya se usan en
   /que-automatizamos y en el selector de herramientas, repetidos acá porque
   son mapas chicos y no vale la pena acoplar los componentes entre sí. */
const iconosProceso: Record<ProcesoSlug, typeof Megaphone> = {
  ventas: Megaphone,
  atencion: ChatCircleDots,
  administracion: ReceiptIcon,
  operaciones: Package,
  datos: ChartBar,
  personas: UsersThree,
};

const iconosHerramienta: Record<ToolId, typeof WhatsappLogo> = {
  whatsapp: WhatsappLogo,
  correo: EnvelopeSimple,
  calendario: CalendarBlank,
  sheets: Table,
  drive: CloudArrowUp,
  erp: Cube,
  crm: AddressBook,
  ads: Megaphone,
  tienda: Storefront,
  factura: ReceiptIcon,
  banco: Bank,
  tareas: CheckSquare,
  redes: InstagramLogo,
};

type Plan = (typeof planes)[number];

/* Los dos tipos de orden cobran distinto, a propósito:
   - "plan": es una suscripción real — se paga por SINPE o transferencia,
     con comprobante. Lleva monto y método de pago.
   - "catalogo": una automatización del catálogo NO se cobra suelta. Solo
     se dice a qué plan pertenece (con el precio real de ESE plan) y se
     confirma por WhatsApp — no hay "cómo pagar" para esto, el pago es el
     del plan. Por eso no lleva monto propio, solo el plan al que pertenece. */
type OrdenResuelta =
  | {
      tipo: "plan";
      plan: Plan;
      esAnual: boolean;
      numero: string;
      titulo: string;
      detalle: string;
      monto: number;
      montoLabel: string;
      montoRecurrente: number | null;
    }
  | {
      tipo: "catalogo";
      item: Automatizacion;
      plan: Plan;
      numero: string;
      titulo: string;
      detalle: string;
    };

function resolverOrden(id: string): OrdenResuelta | null {
  const esAnual = id.endsWith("-anual");
  const planId = esAnual ? id.replace(/-anual$/, "") : id;
  const plan = planes.find((p) => p.id === planId);
  if (plan) {
    const monto = esAnual
      ? plan.mensual * site.pago.mesesPagoAnual
      : plan.mensual;
    return {
      tipo: "plan",
      plan,
      esAnual,
      numero: `HZ-PLAN-${plan.id.toUpperCase()}${esAnual ? "-ANUAL" : ""}`,
      titulo: `Plan ${plan.nombre}${esAnual ? " · pago anual" : ""}`,
      detalle: esAnual
        ? `${colones(monto)} por el año (equivale a ${site.pago.mesesPagoAnual} meses), sin costo de instalación`
        : plan.pruebaGratuitaDias
          ? `${colones(plan.mensual)} por mes, sin costo de instalación. No se cobra hasta ${plan.pruebaGratuitaDias} días después de que tu automatización quede funcionando.`
          : `${colones(plan.mensual)} por mes, sin costo de instalación`,
      monto,
      montoLabel: esAnual ? "Pago anual" : "Primer mes",
      montoRecurrente: esAnual ? null : plan.mensual,
    };
  }
  if (id.startsWith("catalogo-")) {
    const catId = id.replace("catalogo-", "");
    const item = catalogo.find((c) => c.id === catId);
    const planDelItem = item
      ? planes.find((p) => p.nombre === planPorNivel[item.nivel])
      : undefined;
    if (item && planDelItem) {
      return {
        tipo: "catalogo",
        item,
        plan: planDelItem,
        numero: `HZ-CAT-${item.id.toUpperCase()}`,
        titulo: item.nombre,
        detalle: item.plazo,
      };
    }
  }
  return null;
}

export default async function OrdenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orden = resolverOrden(id);
  if (!orden) notFound();

  // El mensaje de WhatsApp menciona plata solo cuando hay un cobro real
  // (plan). Para una automatización del catálogo, dice a qué plan
  // pertenece — nunca un precio suelto de la automatización en sí.
  const mensaje =
    orden.tipo === "plan"
      ? `Hola, quiero contratar: ${orden.titulo}. Orden ${orden.numero}. Monto: ${colones(orden.monto)}${site.pago.ivaIncluido ? "" : " + IVA"}.`
      : `Hola, quiero contratar: ${orden.titulo}, incluida en el plan ${orden.plan.nombre} (${colones(orden.plan.mensual)}/mes). Orden ${orden.numero}.`;

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <Link
          href="/planes"
          className="inline-flex items-center gap-1.5 text-[0.875rem] text-ink-mute hover:text-ink"
        >
          <ArrowLeft size={15} />
          Volver a planes
        </Link>

        <p className="eyebrow mt-8 mb-3">
          Orden <span className="tnum">{orden.numero}</span>
        </p>

        {/* ── Producto: visual a la izquierda, descripción a la derecha ── */}
        <div className="mt-4 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="lg:order-1">
            {orden.tipo === "catalogo" ? (
              <VisualCatalogo item={orden.item} />
            ) : (
              <VisualPlan plan={orden.plan} />
            )}
          </div>

          <div className="lg:order-2">
            <h1 className="text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
              {orden.titulo}
            </h1>
            <p className="mt-2 text-[0.9375rem] text-ink-mute">
              {orden.detalle}
            </p>

            {orden.tipo === "catalogo" ? (
              <>
                <p className="mt-6 text-[0.9375rem] leading-relaxed text-ink-soft">
                  {orden.item.descripcion}
                </p>

                {orden.item.requiere.length > 0 && (
                  <div className="mt-8">
                    <p className="eyebrow mb-3">Funciona con</p>
                    <div className="flex flex-wrap gap-2">
                      {orden.item.requiere.map((toolId) => {
                        const herramienta = herramientas.find(
                          (h) => h.id === toolId
                        );
                        const Icon = iconosHerramienta[toolId];
                        if (!herramienta) return null;
                        return (
                          <span
                            key={toolId}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.8125rem] text-ink-soft"
                          >
                            <Icon size={14} className="text-ink-faint" />
                            {herramienta.nombre}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <ul className="mt-7 flex flex-col gap-3">
                {orden.plan.incluye.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      weight="bold"
                      className="mt-0.5 shrink-0 text-ink-faint"
                    />
                    <span className="text-[0.9375rem] leading-relaxed text-ink-soft">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Al final: cobro real si es un plan, o a qué plan pertenece
               si es una automatización del catálogo ──────────────────── */}
        <div className="mt-16 border-t border-line pt-16 sm:mt-20 sm:pt-20">
          <div className="mx-auto max-w-2xl">
            {orden.tipo === "plan" ? (
              <>
                <div className="rounded-2xl border border-line bg-surface p-7">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[0.875rem] text-ink-mute">
                      {orden.montoLabel}
                    </span>
                    <span className="text-[1.75rem] font-semibold tracking-tight tnum text-ink">
                      {colones(orden.monto)}
                      {!site.pago.ivaIncluido && (
                        <span className="ml-1.5 text-[0.8125rem] font-normal text-ink-faint">
                          + IVA
                        </span>
                      )}
                    </span>
                  </div>
                  {orden.montoRecurrente && (
                    <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                      <span className="text-[0.8125rem] text-ink-faint">
                        Luego, mensual
                      </span>
                      <span className="text-[0.9375rem] font-medium tnum text-ink-soft">
                        {colones(orden.montoRecurrente)} / mes
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <p className="eyebrow mb-4">Cómo pagar</p>
                  <div className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-paper">
                    <div className="flex items-center justify-between gap-4 p-5">
                      <div>
                        <p className="text-[0.8125rem] text-ink-faint">
                          SINPE Móvil
                        </p>
                        <p className="mt-0.5 text-[1.0625rem] font-medium tnum tracking-tight text-ink">
                          {site.pago.sinpeMovil}
                        </p>
                        <p className="text-[0.8125rem] text-ink-mute">
                          {site.pago.sinpeNombre}
                        </p>
                      </div>
                      <Copy size={18} className="shrink-0 text-ink-faint" />
                    </div>
                    {/* Los datos de cuenta no se publican: se mandan por
                        WhatsApp al confirmar. Ver el comentario del IBAN
                        en config/site.ts. */}
                    <div className="flex items-center justify-between gap-4 p-5">
                      <div>
                        <p className="text-[0.8125rem] text-ink-faint">
                          Transferencia bancaria
                        </p>
                        <p className="mt-0.5 text-[0.9375rem] leading-relaxed text-ink">
                          Te enviamos los datos de la cuenta por WhatsApp al
                          confirmar el pedido.
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-faint">
                    Si el monto supera el tope de tu SINPE Móvil, usá la
                    transferencia.
                  </p>
                </div>

                <div className="mt-8 rounded-2xl border border-line-strong bg-noche p-7 text-noche-texto">
                  <p className="text-[0.9375rem] leading-relaxed text-noche-texto/75">
                    Hacé el depósito por el monto exacto y confirmá por
                    WhatsApp adjuntando el comprobante. En cuanto se confirme
                    el pago te llega la factura electrónica y el checklist
                    de arranque.
                  </p>
                  <Button
                    href={waLink(mensaje)}
                    variant="secondary"
                    size="lg"
                    className="mt-6 w-full border-noche-texto/25 bg-noche-texto text-noche hover:bg-noche-texto/90"
                  >
                    <WhatsappLogo size={18} weight="fill" />
                    Confirmar por WhatsApp
                  </Button>
                </div>

                <p className="mt-6 text-center text-[0.8125rem] text-ink-faint">
                  Nunca compartas contraseñas o datos de tarjeta por
                  WhatsApp. Solo pedimos el comprobante del depósito.
                </p>

                <div className="mt-10 border-t border-line pt-10">
                  <ReceiptUpload />
                </div>
              </>
            ) : (
              /* Una automatización del catálogo no se cobra suelta: se
                 dice a qué plan pertenece, con el precio real de ESE
                 plan, y se confirma por WhatsApp. Sin SINPE ni
                 comprobante acá — eso es al contratar el plan. */
              <div className="rounded-2xl border border-acento/30 bg-acento/[0.06] p-7">
                <p className="eyebrow mb-3 text-acento">
                  Incluida en el plan
                </p>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <h2 className="text-[1.375rem] font-semibold tracking-tight text-ink">
                    {orden.plan.nombre}
                  </h2>
                  <p className="tnum text-[1.0625rem] font-medium text-ink">
                    {colones(orden.plan.mensual)}
                    <span className="text-[0.8125rem] font-normal text-ink-faint">
                      {" "}
                      / mes
                    </span>
                  </p>
                </div>
                <p className="mt-1.5 text-[0.875rem] text-ink-mute">
                  {orden.plan.para}
                </p>
                <Button
                  href={waLink(mensaje)}
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full"
                >
                  <WhatsappLogo size={17} weight="fill" />
                  Confirmar por WhatsApp
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* Panel izquierdo para una automatización del catálogo: ícono del proceso
   y el diagrama animado del flujo — el mismo componente que ya explica
   cada proceso en la home, reutilizado acá como "foto de producto". */
function VisualCatalogo({ item }: { item: Automatizacion }) {
  const Icon = iconosProceso[item.proceso];
  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line-strong bg-paper text-ink">
        <Icon size={22} />
      </div>

      {item.flujo.length > 1 ? (
        <div className="mt-10">
          <p className="eyebrow mb-5">Así funciona</p>
          <FlowStrip pasos={item.flujo} detalles={item.detalles} />
        </div>
      ) : (
        <p className="mt-10 text-[0.875rem] leading-relaxed text-ink-mute">
          {item.flujo[0]}
        </p>
      )}
    </div>
  );
}

/* Panel izquierdo para un plan: la ficha técnica (límites), como el
   "spec sheet" que tendría un producto físico. */
function VisualPlan({ plan }: { plan: Plan }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-7">
      <p className="eyebrow mb-1">{plan.nombre}</p>
      <p className="text-[0.875rem] text-ink-mute">{plan.para}</p>
      <dl className="mt-7 flex flex-col gap-3.5 border-t border-line pt-7">
        {plan.limites.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4">
            <dt className="text-[0.8125rem] text-ink-faint">{k}</dt>
            <dd className="text-[0.8125rem] font-medium tnum text-ink">
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

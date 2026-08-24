import { notFound } from "next/navigation";
import Link from "next/link";
import { Copy, WhatsappLogo, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { planes, catalogo } from "@/lib/content";
import { colones, site, waLink } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ReceiptUpload } from "@/components/receipt-upload";

function resolverOrden(id: string) {
  const plan = planes.find((p) => p.id === id);
  if (plan) {
    return {
      numero: `HZ-PLAN-${plan.id.toUpperCase()}`,
      titulo: `Plan ${plan.nombre}`,
      detalle: `Puesta en marcha ${colones(plan.setup)} + ${colones(plan.mensual)} mensuales`,
      monto: plan.setup,
      montoLabel: "Puesta en marcha (pago único)",
      montoRecurrente: plan.mensual,
    };
  }
  if (id.startsWith("catalogo-")) {
    const catId = id.replace("catalogo-", "");
    const item = catalogo.find((c) => c.id === catId);
    if (item && item.precio) {
      return {
        numero: `HZ-CAT-${item.id.toUpperCase()}`,
        titulo: item.nombre,
        detalle: `${item.plazo} · nivel ${item.nivel}`,
        monto: item.precio,
        montoLabel: "Precio del proyecto",
        montoRecurrente: null,
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

  const mensaje = `Hola, quiero contratar: ${orden.titulo}. Orden ${orden.numero}. Monto: ${colones(orden.monto)}${site.pago.ivaIncluido ? "" : " + IVA"}.`;

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-2xl px-5 py-20 sm:px-8 sm:py-28">
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
        <h1 className="text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
          {orden.titulo}
        </h1>
        <p className="mt-2 text-[0.9375rem] text-ink-mute">{orden.detalle}</p>

        <div className="mt-10 rounded-2xl border border-line bg-surface p-7">
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
                <p className="text-[0.8125rem] text-ink-faint">SINPE Móvil</p>
                <p className="mt-0.5 text-[1.0625rem] font-medium tnum tracking-tight text-ink">
                  {site.pago.sinpeMovil}
                </p>
                <p className="text-[0.8125rem] text-ink-mute">
                  {site.pago.sinpeNombre}
                </p>
              </div>
              <Copy size={18} className="shrink-0 text-ink-faint" />
            </div>
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-[0.8125rem] text-ink-faint">
                  Transferencia / IBAN — {site.pago.banco}
                </p>
                <p className="mt-0.5 text-[0.9375rem] font-medium tnum tracking-tight text-ink">
                  {site.pago.iban}
                </p>
              </div>
              <Copy size={18} className="shrink-0 text-ink-faint" />
            </div>
          </div>
          <p className="mt-3 text-[0.8125rem] text-ink-faint">
            SINPE Móvil recomendado hasta {colones(site.pago.topeSinpeMovil)}{" "}
            por el tope de la mayoría de bancos. Para montos mayores, usá la
            transferencia.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-line-strong bg-ink p-7 text-paper">
          <p className="text-[0.9375rem] leading-relaxed text-paper/75">
            Hacé el depósito por el monto exacto y confirmá por WhatsApp
            adjuntando el comprobante. En cuanto se confirme el pago te
            llega la factura electrónica, el acceso al portal y el
            checklist de arranque.
          </p>
          <Button
            href={waLink(mensaje)}
            variant="secondary"
            size="lg"
            className="mt-6 w-full border-paper/25 bg-paper text-ink hover:bg-paper/90"
          >
            <WhatsappLogo size={18} weight="fill" />
            Confirmar por WhatsApp
          </Button>
        </div>

        <p className="mt-6 text-center text-[0.8125rem] text-ink-faint">
          Nunca compartas contraseñas o datos de tarjeta por WhatsApp. Solo
          pedimos el comprobante del depósito.
        </p>

        <div className="mt-10 border-t border-line pt-10">
          <ReceiptUpload />
        </div>
      </div>
    </section>
  );
}

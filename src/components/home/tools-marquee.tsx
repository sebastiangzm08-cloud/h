const herramientas = [
  "WhatsApp Business",
  "Google Workspace",
  "Excel / Sheets",
  "HubSpot",
  "Shopify",
  "Notion",
  "Meta Ads",
  "n8n",
  "Factura electrónica",
  "OpenAI / Claude",
];

export function ToolsMarquee() {
  const track = [...herramientas, ...herramientas];
  return (
    <section
      data-tema="oscuro"
      className="border-t border-noche-texto/10 bg-noche pt-8 pb-10"
    >
      <p className="eyebrow mx-auto mb-6 max-w-7xl px-5 text-noche-texto/55 sm:px-8">
        Conectamos las herramientas que ya usás
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-noche to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-noche to-transparent sm:w-32" />
        <div className="marquee-track flex w-max items-center gap-12">
          {track.map((t, i) => (
            <span
              key={i}
              className="text-[1.05rem] font-medium tracking-tight whitespace-nowrap text-noche-texto/45"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

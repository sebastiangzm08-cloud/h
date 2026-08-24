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
    <section className="border-b border-line bg-surface py-9">
      <p className="eyebrow mx-auto mb-6 max-w-7xl px-5 sm:px-8">
        Conectamos las herramientas que ya usás
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent sm:w-32" />
        <div className="marquee-track flex w-max items-center gap-12">
          {track.map((t, i) => (
            <span
              key={i}
              className="text-[1.05rem] font-medium tracking-tight whitespace-nowrap text-ink-faint"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

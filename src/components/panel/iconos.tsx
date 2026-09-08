/* ==========================================================================
   Íconos del panel. Trazo de 1.7, 24×24, `currentColor`. Se dibujan a mano
   en vez de traer una librería entera: son doce y pesan lo que pesa el SVG.
   ========================================================================== */
export type NombreIcono =
  | "inicio"
  | "pendientes"
  | "automatizaciones"
  | "catalogo"
  | "negocio"
  | "conexiones"
  | "actividad"
  | "facturacion"
  | "ajustes"
  | "soporte"
  | "clientes"
  | "asignar"
  | "alta"
  | "ejecuciones"
  | "costos"
  | "mensajes"
  | "buscar"
  | "campana"
  | "cuenta"
  | "menu"
  | "imagen"
  | "calendario"
  | "reporte"
  | "documento"
  | "camion"
  | "flecha";

const TRAZOS: Record<NombreIcono, React.ReactNode> = {
  inicio: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </>
  ),
  pendientes: (
    <>
      <path d="M4 5h16v10H8l-4 4V5Z" />
      <path d="M9 10h6" />
    </>
  ),
  automatizaciones: <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />,
  catalogo: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M17.5 14v7M14 17.5h7" />
    </>
  ),
  negocio: (
    <>
      <path d="M3 21h18M5 21V8l7-5 7 5v13" />
      <path d="M10 21v-6h4v6" />
    </>
  ),
  conexiones: (
    <>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </>
  ),
  actividad: <path d="M3 12h4l3 8 4-16 3 8h4" />,
  facturacion: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  ajustes: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.5 12a7.5 7.5 0 0 0-.15-1.5l2-1.55-2-3.46-2.35 1a7.5 7.5 0 0 0-2.6-1.5L14 2h-4l-.4 2.49a7.5 7.5 0 0 0-2.6 1.5l-2.35-1-2 3.46 2 1.55a7.6 7.6 0 0 0 0 3l-2 1.55 2 3.46 2.35-1a7.5 7.5 0 0 0 2.6 1.5L10 22h4l.4-2.49a7.5 7.5 0 0 0 2.6-1.5l2.35 1 2-3.46-2-1.55A7.5 7.5 0 0 0 19.5 12Z" />
    </>
  ),
  soporte: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="m5.6 5.6 3.8 3.8M14.6 14.6l3.8 3.8M18.4 5.6l-3.8 3.8M9.4 14.6l-3.8 3.8" />
    </>
  ),
  clientes: (
    <>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 11a3 3 0 1 0 0-6M18 20a6.5 6.5 0 0 0-3-5.5" />
    </>
  ),
  asignar: (
    <>
      <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />
      <path d="M18 3v6M21 6h-6" />
    </>
  ),
  alta: (
    <>
      <circle cx="10" cy="8" r="3.4" />
      <path d="M3.5 20a6.5 6.5 0 0 1 13 0M19 8v6M22 11h-6" />
    </>
  ),
  ejecuciones: (
    <>
      <path d="M4 6h16M4 12h16M4 18h9" />
      <circle cx="18" cy="18" r="3" />
    </>
  ),
  costos: (
    <>
      <path d="M12 2v20" />
      <path d="M17 6.5c0-2-2.2-3-5-3s-5 .9-5 3 2.2 2.7 5 3.2 5 1.2 5 3.3-2.2 3-5 3-5-1-5-3" />
    </>
  ),
  mensajes: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />,
  buscar: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  campana: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  cuenta: (
    <>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  imagen: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 15 5-4 4 3 3-2 6 4" />
      <circle cx="9" cy="10" r="1.4" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </>
  ),
  reporte: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </>
  ),
  documento: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  camion: (
    <>
      <path d="M3 7h13v10H3zM16 10h3l2 3v4h-5z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="18" cy="18" r="1.6" />
    </>
  ),
  flecha: <path d="m9 6 6 6-6 6" />,
};

export function Icono({
  nombre,
  className,
}: {
  nombre: NombreIcono;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {TRAZOS[nombre]}
    </svg>
  );
}

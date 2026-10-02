/* ==========================================================================
   Íconos que solo usa Conversaciones y que `components/panel/iconos.tsx` no
   trae. Mismo estilo: trazo de 1.7, 24×24, `currentColor`.
   ========================================================================== */
const TRAZOS = {
  cerrar: <path d="M6 6l12 12M18 6 6 18" />,
  enviar: (
    <>
      <path d="M21 3 10.5 13.5" />
      <path d="M21 3l-6.5 18-4-7.5L3 9.5 21 3Z" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  precio: (
    <>
      <path d="M3 12.5V4h8.5L21 13.5 13.5 21 3 12.5Z" />
      <circle cx="7.6" cy="8.6" r="1.2" />
    </>
  ),
  chevronAbajo: <path d="m6 9 6 6 6-6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  telefono: (
    <path d="M5 4h3.5l1.7 4.6-2.2 1.4a11 11 0 0 0 5 5l1.4-2.2 4.6 1.7V18a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  ),
  persona: (
    <>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  chispa: (
    <>
      <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.2l-1.8-5.6L4.5 10.8 10.2 9 12 3.5Z" />
    </>
  ),
} as const;

export type NombreIconoChat = keyof typeof TRAZOS;

export function IconoChat({ nombre, className }: { nombre: NombreIconoChat; className?: string }) {
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

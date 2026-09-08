import Link from "next/link";
import type { ReactNode } from "react";
import type { Automatizacion } from "@/lib/content";
import { waLink } from "@/config/site";

/**
 * Envuelve una tarjeta del catálogo con el enlace correcto.
 *
 * `disponible: true`  → va directo al checkout (`/orden/catalogo-...`), que
 *   sí muestra el precio real: ahí es un cobro de verdad, no marketing.
 * `disponible: false` → el enlace abre WhatsApp con el nombre de la
 *   automatización, SIN precio. El único precio que se comunica antes de
 *   hablar con nosotros es el de los planes — el de construcción puntual
 *   se cotiza en la conversación, para no confundir con un número suelto
 *   sin contexto. Así se puede lanzar con pocas automatizaciones sin tener
 *   que ocultar ni borrar las demás del catálogo.
 */
export function CatalogLink({
  automatizacion,
  className,
  children,
}: {
  automatizacion: Automatizacion;
  className?: string;
  children: ReactNode;
}) {
  if (automatizacion.disponible) {
    return (
      <Link href={`/orden/catalogo-${automatizacion.id}`} className={className}>
        {children}
      </Link>
    );
  }

  const mensaje = `Hola, quiero contratar: ${automatizacion.nombre}.`;

  return (
    <a
      href={waLink(mensaje)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}

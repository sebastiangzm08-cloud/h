import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Link de WhatsApp al NÚMERO DEL CLIENTE (no confundir con `waLink()` de
 * `config/site.ts`, que siempre abre el WhatsApp de Hoshizora — esa es para
 * "escribinos" en el sitio público, no sirve para que el admin le escriba a
 * un cliente).
 *
 * Normaliza lo que haya en `clientes.whatsapp` (guardado libre, a veces con
 * "+506", espacios o guiones, a veces solo el número local de 8 dígitos):
 * se queda solo con los dígitos y, si son 8 (un local de Costa Rica sin
 * código de país), le antepone 506 — wa.me lo exige.
 */
export function waLinkCliente(numeroCliente: string, mensaje: string): string {
  const digitos = numeroCliente.replace(/\D/g, "");
  const conPais = digitos.length === 8 ? `506${digitos}` : digitos;
  return `https://wa.me/${conPais}?text=${encodeURIComponent(mensaje)}`;
}

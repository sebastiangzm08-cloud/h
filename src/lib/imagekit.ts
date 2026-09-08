/* ==========================================================================
   ImageKit — solo servidor.

   La foto se sube DIRECTO del navegador a ImageKit; nuestro servidor solo
   firma el permiso. La llave privada nunca sale de acá.

   Firma (idéntica a la del SDK oficial de ImageKit):
     signature = HMAC-SHA1(privateKey, token + expire)  → hex
   `token` es único por subida (uuid) y `expire` es epoch en segundos, a
   menos de una hora. Un token repetido lo rechaza ImageKit.
   ========================================================================== */
import { createHmac, randomUUID } from "node:crypto";

export function imagekitConfigurado(): boolean {
  return Boolean(
    process.env.IMAGEKIT_PRIVATE_KEY &&
      process.env.IMAGEKIT_PUBLIC_KEY &&
      process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
  );
}

export type ParametrosSubida = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
};

/** Un permiso de subida de un solo uso, válido 20 minutos. */
export function firmarSubida(): ParametrosSubida {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!privateKey || !publicKey || !urlEndpoint) {
    throw new Error("ImageKit sin configurar: faltan llaves en web/.env.local");
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 20 * 60;
  const signature = createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  return { token, expire, signature, publicKey, urlEndpoint };
}

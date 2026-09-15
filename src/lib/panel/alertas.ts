/* ==========================================================================
   Avisos a Sebastián cuando algo se rompe de verdad — no al cliente, a
   Hoshizora. Por correo (Resend), a propósito: si lo que falló es JUSTO la
   conexión de WhatsApp, avisar por WhatsApp sería como llamar por un
   teléfono que no tiene línea. El correo no depende de Meta para nada.

   Gratis hasta 3.000 correos al mes — de sobra para avisos de error.
   ========================================================================== */

const DE = "Hoshizora <onboarding@resend.dev>";
const PARA = process.env.ALERTA_CORREO_DESTINO || "sebastiangzm08@gmail.com";

export async function avisarPorCorreo(
  asunto: string,
  detalle: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "Falta RESEND_API_KEY en el servidor." };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: DE,
        to: [PARA],
        subject: `[Hoshizora] ${asunto}`,
        text: detalle,
      }),
    });
    if (!res.ok) {
      const cuerpo = await res.text();
      return { ok: false, error: `Resend respondió ${res.status}: ${cuerpo.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

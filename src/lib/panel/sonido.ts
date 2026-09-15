/* ==========================================================================
   Sonido de aviso — dos tonos cortos, sintetizados con Web Audio (nada de
   un archivo de audio que descargar ni licenciar). Solo se usa para "el bot
   necesita un humano" — nunca por cada mensaje, sería spam de sonido.
   ========================================================================== */
export function reproducirDing() {
  try {
    const AudioCtxCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxCtor) return;
    const ctx = new AudioCtxCtor();
    const ahora = ctx.currentTime;
    // A5 → E6: un intervalo limpio y corto, como un timbre discreto.
    const notas = [880, 1318.5];
    notas.forEach((frecuencia, i) => {
      const osc = ctx.createOscillator();
      const ganancia = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frecuencia;
      const inicio = ahora + i * 0.11;
      ganancia.gain.setValueAtTime(0, inicio);
      ganancia.gain.linearRampToValueAtTime(0.18, inicio + 0.015);
      ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.32);
      osc.connect(ganancia).connect(ctx.destination);
      osc.start(inicio);
      osc.stop(inicio + 0.34);
    });
    setTimeout(() => ctx.close(), 700);
  } catch {
    /* Si el navegador bloquea audio sin interacción previa (autoplay), no
       pasa nada grave — el correo y la pastilla del panel igual avisan. */
  }
}

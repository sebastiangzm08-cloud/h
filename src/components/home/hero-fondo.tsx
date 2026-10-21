"use client";

import { useEffect, useRef } from "react";

/* ==========================================================================
   Fondo animado del hero: "circuito en sobrecarga" (elegido por Sebastian
   el 2026-10-20).

   Pistas tipo placa de circuito (tramos rectos con esquinas a 45°) que
   llegan a un chip: el agente. Por ellas corren pulsos —cada uno es un
   mensaje que entra— cada vez más seguido, hasta que el chip "descarga":
   se llena de blanco, todas las pistas se engrosan un instante y salen dos
   ondas. Después el ciclo vuelve a empezar. Tensión → descarga → calma.

   Solo blanco y negro: la jerarquía va por GROSOR, no por gris. Las pistas
   en reposo son finas y sólidas; los pulsos y la descarga, gruesos.

   - El circuito vive a la derecha (escritorio) o abajo (celular): ninguna
     pista cruza el bloque del título, así siempre se lee.
   - Es canvas 2D, no un archivo de video: pesa unos KB.
   - Se pausa fuera de pantalla y con la pestaña oculta.
   - Con "reducir movimiento" se dibuja un solo cuadro quieto.
   ========================================================================== */

type Punto = { x: number; y: number };
type Pista = { puntos: Punto[]; acum: number[]; total: number };
type Pulso = { pista: Pista; d: number; vel: number };
type Onda = { t: number };

const GRID = 28;
/** Grosor base de los pulsos (px). Las pistas en reposo van a 1 px. */
const GROSOR = 2.5;
/** Duración de un ciclo completo de carga → descarga (s). */
const CICLO = 5;

/* Pseudoaleatorio con semilla: el mismo dibujo en cada visita. */
function semilla(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const enGrilla = (v: number) => Math.round(v / GRID) * GRID;

/** Ruta tipo PCB desde `a` hasta `b`: recto, diagonal de 45° y recto. */
function ruta(a: Punto, b: Punto, horizontalPrimero: boolean, rand: () => number): Punto[] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const sx = Math.sign(dx) || 1;
  const sy = Math.sign(dy) || 1;
  let puntos: Punto[];
  if (horizontalPrimero) {
    const diag = Math.min(Math.abs(dx), Math.abs(dy)) * (0.5 + rand() * 0.3);
    const recto = (Math.abs(dx) - diag) * (0.35 + rand() * 0.3);
    const p1 = { x: a.x + sx * recto, y: a.y };
    const p2 = { x: p1.x + sx * diag, y: a.y + sy * diag };
    puntos = [a, p1, p2, { x: b.x, y: p2.y }, b];
  } else {
    const diag = Math.min(Math.abs(dx), Math.abs(dy)) * (0.5 + rand() * 0.3);
    const recto = (Math.abs(dy) - diag) * (0.35 + rand() * 0.3);
    const p1 = { x: a.x, y: a.y + sy * recto };
    const p2 = { x: a.x + sx * diag, y: p1.y + sy * diag };
    puntos = [a, p1, p2, { x: p2.x, y: b.y }, b];
  }
  return puntos.filter(
    (p, i, arr) => i === 0 || Math.hypot(p.x - arr[i - 1].x, p.y - arr[i - 1].y) > 0.5
  );
}

function medir(puntos: Punto[]): Pista {
  const acum = [0];
  for (let i = 1; i < puntos.length; i++) {
    acum.push(acum[i - 1] + Math.hypot(puntos[i].x - puntos[i - 1].x, puntos[i].y - puntos[i - 1].y));
  }
  return { puntos, acum, total: acum[acum.length - 1] };
}

function enPista(p: Pista, d: number): Punto {
  for (let i = 1; i < p.puntos.length; i++) {
    if (d <= p.acum[i]) {
      const a = p.puntos[i - 1];
      const b = p.puntos[i];
      const f = (d - p.acum[i - 1]) / (p.acum[i] - p.acum[i - 1] || 1);
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
  }
  return p.puntos[p.puntos.length - 1];
}

export function HeroFondo() {
  const ref = useRef<HTMLDivElement>(null);
  const fijoRef = useRef<HTMLCanvasElement>(null);
  const vivoRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const raiz = ref.current;
    const canvasFijo = fijoRef.current;
    const canvas = vivoRef.current;
    if (!raiz || !canvasFijo || !canvas) return;
    const ctxFijo = canvasFijo.getContext("2d");
    const ctx = canvas.getContext("2d");
    if (!ctxFijo || !ctx) return;

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let caja = { x: 0, y: 0, w: 0, h: 0 };
    /* Zona que de verdad ocupa el circuito (en coordenadas del hero). Los dos
       lienzos miden solo esto, no todo el hero: menos de la mitad de píxeles
       que repintar en cada cuadro (2026-10-21, la web se sentía pesada). */
    let zona = { x: 0, y: 0, w: 0, h: 0 };
    let pistas: Pista[] = [];
    let pulsos: Pulso[] = [];
    let ondas: Onda[] = [];
    let raf = 0;
    let ultimo = 0;
    let reloj = 0; // segundos de animación (no corre en pausa)
    let proximo = 0;
    let ultimaDescarga = -10;
    let visible = true;

    function armar() {
      const r = raiz!.getBoundingClientRect();
      w = r.width;
      h = r.height;

      const rand = semilla(11);
      const ancho = w >= 1024;
      pistas = [];
      pulsos = [];
      ondas = [];

      // El "chip" es el analizador del hero (marcado con data-hero-chip):
      // las pistas se enchufan a sus bordes y él tapa lo que queda adentro.
      const destino = raiz!.parentElement?.querySelector<HTMLElement>("[data-hero-chip]");
      const d = destino?.getBoundingClientRect();
      caja = d
        ? { x: d.left - r.left, y: d.top - r.top, w: d.width, h: d.height }
        : { x: w * 0.6, y: h * 0.3, w: w * 0.3, h: h * 0.4 };
      const margen = 18; // las pistas no llegan a las esquinas redondeadas

      const conectar = (o: Punto, fin: Punto, horizontal: boolean) =>
        pistas.push(medir(ruta(o, fin, horizontal, rand)));

      if (ancho) {
        // Escritorio: entran por arriba, por abajo y por la derecha, y se
        // enchufan al borde del analizador del mismo lado. Ninguna cruza la
        // columna del título.
        const n = 6;
        for (let i = 0; i < n; i++) {
          const f = (i + 0.5) / n;
          const xBorde = caja.x + margen + (caja.w - margen * 2) * f;
          const xOrigen = enGrilla(caja.x - GRID * 2 + (w - caja.x + GRID) * f);
          conectar({ x: xOrigen, y: -GRID }, { x: xBorde, y: caja.y }, false);
          conectar({ x: enGrilla(xOrigen + GRID), y: h + GRID }, { x: xBorde, y: caja.y + caja.h }, false);
        }
        for (let i = 0; i < 5; i++) {
          const f = (i + 0.5) / 5;
          const yBorde = caja.y + margen + (caja.h - margen * 2) * f;
          conectar({ x: w + GRID, y: enGrilla(h * (0.08 + 0.84 * f)) }, { x: caja.x + caja.w, y: yBorde }, true);
        }
        // Por la izquierda: bajan/suben por el pasillo entre el título y el
        // analizador y doblan hacia su borde. Así lo rodean por los 4 lados.
        const pasillo = [caja.x - GRID, caja.x - GRID * 2];
        for (let i = 0; i < 4; i++) {
          const f = (i + 0.5) / 4;
          const yBorde = caja.y + margen + (caja.h - margen * 2) * f;
          const x = enGrilla(pasillo[i % 2]);
          conectar({ x, y: i < 2 ? -GRID : h + GRID }, { x: caja.x, y: yBorde }, false);
        }
      } else {
        // Celular: el analizador va debajo de los botones; las pistas entran
        // por los dos costados y por abajo.
        for (let i = 0; i < 3; i++) {
          const f = (i + 0.5) / 3;
          const yBorde = caja.y + margen + (caja.h - margen * 2) * f;
          conectar({ x: -GRID, y: enGrilla(yBorde + (i - 1) * GRID * 2) }, { x: caja.x, y: yBorde }, true);
          conectar({ x: w + GRID, y: enGrilla(yBorde - (i - 1) * GRID * 2) }, { x: caja.x + caja.w, y: yBorde }, true);
          const xBorde = caja.x + margen + (caja.w - margen * 2) * f;
          conectar({ x: enGrilla(xBorde + (i - 1) * GRID * 2), y: h + GRID }, { x: xBorde, y: caja.y + caja.h }, false);
        }
      }

      // Zona del circuito: todas las pistas + el alcance de las ondas
      // alrededor del analizador, recortada al hero.
      const ALCANCE_ONDA = 140;
      let x0 = caja.x - ALCANCE_ONDA;
      let y0 = caja.y - ALCANCE_ONDA;
      let x1 = caja.x + caja.w + ALCANCE_ONDA;
      let y1 = caja.y + caja.h + ALCANCE_ONDA;
      for (const p of pistas) {
        for (const q of p.puntos) {
          x0 = Math.min(x0, q.x);
          y0 = Math.min(y0, q.y);
          x1 = Math.max(x1, q.x);
          y1 = Math.max(y1, q.y);
        }
      }
      x0 = Math.max(0, Math.floor(x0 - 4));
      y0 = Math.max(0, Math.floor(y0 - 4));
      x1 = Math.min(w, Math.ceil(x1 + 4));
      y1 = Math.min(h, Math.ceil(y1 + 4));
      zona = { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };

      // Escala tope 1,25: en líneas finas no se nota y es mucho menos trabajo
      // para la tarjeta gráfica que 1,5 o 2.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      for (const [lienzo, c] of [
        [canvasFijo!, ctxFijo!],
        [canvas!, ctx!],
      ] as const) {
        lienzo.style.left = `${zona.x}px`;
        lienzo.style.top = `${zona.y}px`;
        lienzo.style.width = `${zona.w}px`;
        lienzo.style.height = `${zona.h}px`;
        lienzo.width = Math.round(zona.w * dpr);
        lienzo.height = Math.round(zona.h * dpr);
        // Se dibuja en coordenadas del hero; la transformación lo corre a la zona.
        c.setTransform(dpr, 0, 0, dpr, -zona.x * dpr, -zona.y * dpr);
        c.fillStyle = "#ffffff";
        c.strokeStyle = "#ffffff";
        c.lineCap = "round";
        c.lineJoin = "round";
      }

      dibujarFijo();
    }

    function linea(c: CanvasRenderingContext2D, p: Pista) {
      c.beginPath();
      c.moveTo(p.puntos[0].x, p.puntos[0].y);
      for (let i = 1; i < p.puntos.length; i++) c.lineTo(p.puntos[i].x, p.puntos[i].y);
      c.stroke();
    }

    function punto(x: number, y: number, r: number) {
      ctx!.beginPath();
      ctx!.arc(x, y, r, 0, Math.PI * 2);
      ctx!.fill();
    }

    /** Capa fija: las pistas en reposo y sus pads. Se dibuja UNA vez (y al
        cambiar el tamaño), nunca en cada cuadro. */
    function dibujarFijo() {
      ctxFijo!.clearRect(zona.x, zona.y, zona.w, zona.h);
      ctxFijo!.lineWidth = 1;
      for (const p of pistas) {
        linea(ctxFijo!, p);
        const fin = p.puntos[p.puntos.length - 1];
        ctxFijo!.fillRect(fin.x - 2, fin.y - 2, 4, 4); // pad de soldadura
      }
    }

    /** Capa viva: solo lo que se mueve (pulsos, descarga y ondas). */
    function dibujar(dt: number) {
      ctx!.clearRect(zona.x, zona.y, zona.w, zona.h);

      // Descarga: 0..1, se apaga en 0,6 s.
      const descarga = Math.max(0, 1 - (reloj - ultimaDescarga) / 0.6);

      // Durante la descarga las pistas se engrosan: se pintan gruesas encima
      // de la capa fija solo esos 0,6 s.
      if (descarga > 0) {
        ctx!.lineWidth = 1 + descarga * GROSOR * 1.4;
        for (const p of pistas) linea(ctx!, p);
      }

      // Descarga del chip (el analizador): un marco grueso pegado a su borde.
      if (descarga > 0) {
        ctx!.globalAlpha = descarga;
        ctx!.lineWidth = GROSOR * 2;
        ctx!.beginPath();
        ctx!.roundRect(caja.x - 6, caja.y - 6, caja.w + 12, caja.h + 12, 20);
        ctx!.stroke();
        ctx!.globalAlpha = 1;
      }

      // Ondas de la descarga: el marco se agranda y se apaga.
      for (const o of ondas) o.t += dt / 1300;
      ondas = ondas.filter((o) => o.t < 1);
      ctx!.lineWidth = GROSOR * 1.4;
      for (const o of ondas) {
        if (o.t < 0) continue;
        const e = (1 - Math.pow(1 - o.t, 3)) * 120;
        ctx!.globalAlpha = 1 - o.t;
        ctx!.beginPath();
        ctx!.roundRect(caja.x - 6 - e, caja.y - 6 - e, caja.w + 12 + e * 2, caja.h + 12 + e * 2, 20 + e / 3);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;

      // Pulsos: cabeza gruesa con estela de puntos que se achica.
      const ESTELA = 7;
      for (const pu of pulsos) {
        pu.d += (pu.vel * dt) / 1000;
        for (let s = 0; s < ESTELA; s++) {
          const d = pu.d - s * 8;
          if (d < 0 || d > pu.pista.total) continue;
          const pt = enPista(pu.pista, d);
          ctx!.globalAlpha = 1 - s / ESTELA;
          punto(pt.x, pt.y, GROSOR * (s === 0 ? 1.6 : 0.9));
        }
      }
      ctx!.globalAlpha = 1;
      pulsos = pulsos.filter((pu) => pu.d - 60 < pu.pista.total);
    }

    function avanzar(dt: number) {
      reloj += dt / 1000;
      const fase = reloj % CICLO;
      // Cada vez más seguido a medida que avanza el ciclo: de ~620 ms a 55 ms.
      // Tope de pulsos a la vez: en el pico de la "sobrecarga" no se dispara.
      if (reloj >= proximo && pistas.length && pulsos.length < 22) {
        const pista = pistas[Math.floor(Math.random() * pistas.length)];
        pulsos.push({ pista, d: 0, vel: 170 + Math.random() * 70 + fase * 40 });
        proximo = reloj + Math.max(0.055, 0.62 - fase * 0.12);
      }
      if (fase < dt / 1000 && reloj - ultimaDescarga > 1) {
        ultimaDescarga = reloj;
        ondas.push({ t: 0 }, { t: -0.25 });
      }
    }

    function cuadro(ahora: number) {
      const dt = ultimo ? Math.min(ahora - ultimo, 50) : 16;
      ultimo = ahora;
      avanzar(dt);
      dibujar(dt);
      raf = requestAnimationFrame(cuadro);
    }

    function arrancar() {
      if (quieto || raf || !visible || document.hidden) return;
      ultimo = 0;
      raf = requestAnimationFrame(cuadro);
    }
    function parar() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    function cuadroQuieto() {
      // Algunos mensajes "en camino", sin movimiento.
      pulsos = pistas.slice(0, 6).map((p, i) => ({ pista: p, d: p.total * (0.3 + i * 0.1), vel: 0 }));
      dibujar(0);
    }

    armar();
    if (quieto) cuadroQuieto();
    else arrancar();

    const ro = new ResizeObserver(() => {
      armar();
      if (quieto) cuadroQuieto();
    });
    ro.observe(raiz);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) arrancar();
      else parar();
    });
    io.observe(raiz);

    const alCambiarPestana = () => (document.hidden ? parar() : arrancar());
    document.addEventListener("visibilitychange", alCambiarPestana);

    return () => {
      parar();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", alCambiarPestana);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* Fija: pistas en reposo (se dibuja una vez). Viva: pulsos y descarga. */}
      <canvas ref={fijoRef} className="absolute" />
      <canvas ref={vivoRef} className="absolute" />
    </div>
  );
}

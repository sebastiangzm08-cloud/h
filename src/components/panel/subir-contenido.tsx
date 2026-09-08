"use client";

/* ==========================================================================
   Subir contenido para Redes sociales.

   El archivo va DIRECTO del navegador a ImageKit — no pasa por nuestro
   servidor. El flujo por pieza:
     1. pedir una firma de un uso a /api/imagekit/auth
     2. POST del archivo a ImageKit con esa firma
     3. juntar { url, fileId, instruccion } de todas
     4. registrarPiezas() las mete en la fila (tabla `cola`)

   Cada foto lleva su propio retoque (Ninguno / Mejorar calidad / Quitar
   fondo / Fondo blanco). El "contexto" de abajo es común a toda la tanda y
   alimenta el texto del post. n8n levanta la fila; acá no se publica nada.
   ========================================================================== */
import { useCallback, useRef, useState } from "react";
import { Icono } from "@/components/panel/iconos";
import {
  registrarPiezas,
  type PiezaSubida,
} from "@/lib/panel/contenido-acciones";
import { cn } from "@/lib/utils";

type Retoque = "no" | "calidad" | "sin_fondo" | "fondo_blanco";

type Elegido = {
  id: string;
  file: File;
  preview: string | null;
  esVideo: boolean;
  retoque: Retoque;
};

/* La frase que entiende el retocador de n8n. Va adelante de la instrucción
   de la pieza; el texto del post la ignora (es un pedido de imagen). */
const FRASE_RETOQUE: Record<Retoque, string> = {
  no: "",
  calidad: "mejorala",
  sin_fondo: "quitale el fondo",
  fondo_blanco: "fondo blanco",
};

const OPCIONES_RETOQUE: { valor: Retoque; texto: string; corto: string }[] = [
  { valor: "no", texto: "Sin retoque", corto: "Ninguno" },
  { valor: "calidad", texto: "Mejorar calidad", corto: "Calidad" },
  { valor: "sin_fondo", texto: "Quitar fondo", corto: "Sin fondo" },
  { valor: "fondo_blanco", texto: "Fondo blanco", corto: "Blanco" },
];

const UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const MAX_MB = 25;
const MAX_PIEZAS = 20;

/* El retocador (kie.ai) rechaza extensiones raras: ".jfif", ".jpe", ".bmp",
   nombres sin extensión… aunque los bytes sean un JPEG válido. Windows guarda
   muchas descargas como ".jfif". Renombramos al subir a ImageKit para que la
   URL termine en algo que kie.ai y Buffer sí aceptan. No re-codifica: un
   .jfif ya ES un JPEG, sólo cambia el nombre. */
function nombreSeguro(nombre: string, tipo: string): string {
  const base = nombre.replace(/\.[^./\\]+$/, "").trim() || "foto";
  const ext =
    tipo === "image/png"
      ? "png"
      : tipo === "image/webp"
        ? "webp"
        : tipo === "image/gif"
          ? "gif"
          : "jpg";
  return `${base}.${ext}`;
}

const campo =
  "w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[13.5px] text-ink " +
  "placeholder:text-ink-faint transition-colors focus:border-line-strong " +
  "focus:bg-surface-3 focus:outline-none";

export function SubirContenido({
  clienteId,
  redesDisponibles,
}: {
  clienteId: string;
  redesDisponibles: { valor: string; nombre: string }[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [elegidos, setElegidos] = useState<Elegido[]>([]);
  const [contexto, setContexto] = useState("");
  const [modo, setModo] = useState<"individual" | "carrusel">("individual");
  const [redes, setRedes] = useState<string[]>(
    redesDisponibles.map((r) => r.valor)
  );
  const [fecha, setFecha] = useState("");

  const [arrastrando, setArrastrando] = useState(false);
  const [progreso, setProgreso] = useState<{ hecho: number; total: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const agregar = useCallback((files: FileList | File[]) => {
    setError(null);
    setOk(null);
    const nuevos: Elegido[] = [];
    for (const file of Array.from(files)) {
      const esImg = file.type.startsWith("image/");
      const esVid = file.type.startsWith("video/");
      if (esVid) {
        setError("Los reels llegan pronto. Por ahora subí solo fotos.");
        continue;
      }
      if (!esImg) continue;
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`"${file.name}" pesa más de ${MAX_MB} MB.`);
        continue;
      }
      nuevos.push({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        esVideo: esVid,
        retoque: "no",
      });
    }
    setElegidos((prev) => [...prev, ...nuevos].slice(0, MAX_PIEZAS));
  }, []);

  function quitar(id: string) {
    setElegidos((prev) => {
      const found = prev.find((e) => e.id === id);
      if (found?.preview) URL.revokeObjectURL(found.preview);
      return prev.filter((e) => e.id !== id);
    });
  }

  function fijarRetoque(id: string, retoque: Retoque) {
    setElegidos((prev) => prev.map((e) => (e.id === id ? { ...e, retoque } : e)));
  }

  function retoqueTodas(retoque: Retoque) {
    setElegidos((prev) => prev.map((e) => ({ ...e, retoque })));
  }

  function toggleRed(valor: string) {
    setRedes((prev) =>
      prev.includes(valor) ? prev.filter((r) => r !== valor) : [...prev, valor]
    );
  }

  async function subirUna(e: Elegido): Promise<PiezaSubida> {
    const authRes = await fetch("/api/imagekit/auth", { cache: "no-store" });
    if (!authRes.ok) {
      const body = await authRes.json().catch(() => ({}));
      throw new Error(body.error ?? "No se pudo pedir permiso de subida.");
    }
    const { token, expire, signature, publicKey } = await authRes.json();

    const nombre = nombreSeguro(e.file.name, e.file.type);
    const fd = new FormData();
    fd.append("file", e.file, nombre);
    fd.append("fileName", nombre);
    fd.append("publicKey", publicKey);
    fd.append("signature", signature);
    fd.append("expire", String(expire));
    fd.append("token", token);
    fd.append("useUniqueFileName", "true");
    fd.append("folder", `/hoshizora/${clienteId}`);
    fd.append("tags", "panel,redes");

    const up = await fetch(UPLOAD_URL, { method: "POST", body: fd });
    if (!up.ok) {
      const body = await up.json().catch(() => ({}));
      throw new Error(body?.message ?? `ImageKit rechazó "${nombre}".`);
    }
    const data = await up.json();

    // Cada foto lleva SU retoque (frase que entiende n8n).
    const frase = FRASE_RETOQUE[e.retoque];
    // Individual: retoque + contexto en la instrucción de la pieza.
    // Carrusel: la instrucción de la fila es sólo el contexto; el retoque de
    // cada foto viaja aparte, en `retoque`.
    const instruccion = esCarrusel
      ? contexto.trim()
      : [frase, contexto.trim()].filter(Boolean).join(". ");

    return {
      url: data.url,
      fileId: data.fileId,
      nombre: data.name ?? nombre,
      esVideo: e.file.type.startsWith("video/"),
      instruccion,
      retoque: frase,
    };
  }

  async function subirTodo() {
    if (elegidos.length === 0) return;
    setError(null);
    setOk(null);
    setProgreso({ hecho: 0, total: elegidos.length });

    const subidas: PiezaSubida[] = [];
    try {
      for (const e of elegidos) {
        subidas.push(await subirUna(e));
        setProgreso({ hecho: subidas.length, total: elegidos.length });
      }
    } catch (err) {
      setProgreso(null);
      setError(err instanceof Error ? err.message : "Falló la subida.");
      return;
    }

    const res = await registrarPiezas(subidas, {
      redes,
      programadaPara: fecha,
      carrusel: modo === "carrusel",
    });
    setProgreso(null);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    for (const e of elegidos) if (e.preview) URL.revokeObjectURL(e.preview);
    setElegidos([]);
    setContexto("");
    setFecha("");
    setModo("individual");
    setOk(res.mensaje);
  }

  const subiendo = progreso !== null;
  const esCarrusel = modo === "carrusel" && elegidos.length > 1;
  const conRetoque = elegidos.filter((e) => e.retoque !== "no").length;

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {/* Zona de soltar / elegir */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          agregar(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
          arrastrando
            ? "border-ink-faint bg-white/[0.04]"
            : "border-line-strong bg-white/[0.02] hover:border-ink-faint"
        )}
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-3 text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
          <Icono nombre="imagen" className="h-5 w-5" />
        </span>
        <span className="text-[13.5px] font-medium text-ink">
          Arrastrá tus fotos, o tocá para elegir
        </span>
        <span className="text-[11.5px] text-ink-faint">
          Hasta {MAX_PIEZAS} por tanda · máx {MAX_MB} MB · reels próximamente
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) agregar(e.target.files);
            e.target.value = "";
          }}
        />
      </button>

      {/* Elegidas */}
      {elegidos.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {/* Modo: una por foto o carrusel */}
          {elegidos.length > 1 ? (
            <div className="flex gap-1.5">
              {(
                [
                  ["individual", "Una publicación por foto"],
                  ["carrusel", "Todas en un carrusel"],
                ] as const
              ).map(([valor, texto]) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setModo(valor)}
                  disabled={subiendo}
                  className={cn(
                    "flex-1 rounded-xl border px-3 py-2 text-[12px] transition-colors disabled:opacity-50",
                    modo === valor
                      ? "border-line-strong bg-surface-3 text-ink"
                      : "border-line text-ink-mute hover:bg-surface-2 hover:text-ink-soft"
                  )}
                >
                  {texto}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-medium text-ink-mute">
              {esCarrusel
                ? `Carrusel de ${elegidos.length} fotos`
                : `${elegidos.length} ${elegidos.length === 1 ? "foto" : "fotos"}`}
              {conRetoque > 0 ? ` · ${conRetoque} con retoque` : ""}
            </span>
            {elegidos.length > 1 && !subiendo ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] text-ink-faint">A todas:</span>
                {OPCIONES_RETOQUE.map((o) => (
                  <button
                    key={o.valor}
                    type="button"
                    onClick={() => retoqueTodas(o.valor)}
                    className="rounded-full border border-line px-2 py-0.5 text-[10.5px] text-ink-mute transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    {o.texto}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {elegidos.map((e) => (
              <div
                key={e.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface-2"
              >
                <div className="relative aspect-square">
                  {e.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.preview}
                      alt={e.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10.5px] text-ink-faint">
                      Archivo
                    </span>
                  )}
                  {e.retoque !== "no" ? (
                    <span className="absolute top-1 left-1 rounded-full bg-ink/85 px-1.5 py-px text-[9.5px] font-medium text-paper backdrop-blur-sm">
                      ✨ {OPCIONES_RETOQUE.find((o) => o.valor === e.retoque)?.texto}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => quitar(e.id)}
                    disabled={subiendo}
                    aria-label={`Quitar ${e.file.name}`}
                    className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-paper/80 text-ink-soft opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 disabled:hidden"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3 w-3">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-col gap-1 border-t border-line p-1.5">
                  <span className="text-[9px] tracking-wide text-ink-faint uppercase">
                    Retoque
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {OPCIONES_RETOQUE.map((o) => (
                      <button
                        key={o.valor}
                        type="button"
                        onClick={() => fijarRetoque(e.id, o.valor)}
                        disabled={subiendo}
                        aria-pressed={e.retoque === o.valor}
                        className={cn(
                          "rounded-md px-1.5 py-1 text-[10px] leading-none transition-colors disabled:opacity-50",
                          e.retoque === o.valor
                            ? "bg-ink font-medium text-paper"
                            : "bg-surface-3 text-ink-mute hover:text-ink"
                        )}
                      >
                        {o.corto}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {esCarrusel ? (
            <p className="text-[11px] text-ink-faint">
              Las {elegidos.length} fotos salen en un solo post, en este orden,
              con una sola descripción. El retoque lo elegís por foto (o con
              «A todas»).
              {conRetoque > 0
                ? ` ${conRetoque} ${
                    conRetoque === 1 ? "va" : "van"
                  } con retoque y ${
                    conRetoque === 1 ? "cuenta" : "cuentan"
                  } para tu tope del mes.`
                : ""}
            </p>
          ) : conRetoque > 0 ? (
            <p className="text-[11px] text-ink-faint">
              Las {conRetoque} con retoque pasan por la IA antes de publicarse y
              cuentan para tu tope de fotos mejoradas del mes.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Contexto de la tanda */}
      {elegidos.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11.5px] font-medium text-ink-mute">
              Contexto para estas fotos <span className="text-ink-faint">(opcional)</span>
            </span>
            <textarea
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              rows={2}
              placeholder="Ej.: es la promo de setiembre, 20% en la segunda unidad, hasta el viernes"
              className={cn(campo, "resize-none")}
            />
            <span className="text-[11px] text-ink-faint">
              Un dato real (oferta, fecha, evento) que la IA use al escribir el
              texto. El retoque de la imagen se elige arriba, en cada foto.
            </span>
          </label>

          {redesDisponibles.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11.5px] font-medium text-ink-mute">Dónde publicar</span>
              <div className="flex flex-wrap gap-2">
                {redesDisponibles.map((r) => {
                  const activa = redes.includes(r.valor);
                  return (
                    <button
                      key={r.valor}
                      type="button"
                      onClick={() => toggleRed(r.valor)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-[12px] transition-colors",
                        activa
                          ? "border-ink-faint bg-white/10 text-ink"
                          : "border-line-strong text-ink-mute hover:text-ink-soft"
                      )}
                    >
                      {r.nombre}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className="text-[11.5px] font-medium text-ink-mute">
              Día de publicación <span className="text-ink-faint">(opcional)</span>
            </span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={cn(campo, "max-w-[200px]")}
            />
            <span className="text-[11px] text-ink-faint">
              Sin fecha, salen en el próximo turno libre.
            </span>
          </label>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-lg bg-bad/10 px-3.5 py-3 text-[12.5px] text-bad">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p role="status" className="rounded-lg bg-ok/10 px-3.5 py-3 text-[12.5px] text-ok">
          {ok}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={subirTodo}
          disabled={elegidos.length === 0 || subiendo}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[13.5px] font-medium text-paper",
            "transition-all duration-200 ease-out hover:bg-ink-soft active:scale-[0.98]",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        >
          {subiendo ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-paper/40 border-t-paper" />
              Subiendo {progreso?.hecho} de {progreso?.total}…
            </>
          ) : esCarrusel ? (
            `Enviar carrusel de ${elegidos.length} fotos`
          ) : (
            `Enviar ${elegidos.length || ""} ${elegidos.length === 1 ? "foto" : "fotos"}`.trim()
          )}
        </button>
        {elegidos.length > 0 && !subiendo ? (
          <button
            type="button"
            onClick={() => {
              for (const e of elegidos) if (e.preview) URL.revokeObjectURL(e.preview);
              setElegidos([]);
            }}
            className="text-[12px] text-ink-faint transition-colors hover:text-ink-mute"
          >
            Limpiar
          </button>
        ) : null}
      </div>
    </div>
  );
}

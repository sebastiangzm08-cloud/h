"use client";

import { useRef, useState, type DragEvent } from "react";
import { UploadSimple, FileImage, CheckCircle, X } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

type Estado = "vacio" | "cargado" | "enviando" | "enviado";

export function ReceiptUpload() {
  const [estado, setEstado] = useState<Estado>("vacio");
  const [arrastrando, setArrastrando] = useState(false);
  const [archivo, setArchivo] = useState<{ nombre: string; url: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aceptar = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") return;
    setArchivo({ nombre: file.name, url: URL.createObjectURL(file) });
    setEstado("cargado");
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    aceptar(e.dataTransfer.files?.[0]);
  };

  const enviar = () => {
    setEstado("enviando");
    // Prototipo: acá va la subida real al backend, asociada al número de orden.
    setTimeout(() => setEstado("enviado"), 900);
  };

  if (estado === "enviado") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-6">
        <CheckCircle size={22} weight="fill" className="mt-0.5 shrink-0 text-ok" />
        <div>
          <p className="text-[0.9375rem] font-medium tracking-tight text-ink">
            Comprobante recibido
          </p>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-mute">
            Lo revisamos y confirmamos el pago dentro del mismo día hábil.
            También podés escribirnos por WhatsApp si tenés prisa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow mb-3">O subí el comprobante directo</p>

      {!archivo ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            arrastrando
              ? "border-ink bg-surface-2"
              : "border-line-strong bg-surface hover:border-ink-mute"
          )}
        >
          <UploadSimple size={22} className="text-ink-faint" />
          <div>
            <p className="text-[0.875rem] font-medium text-ink-soft">
              Arrastrá la captura del comprobante acá
            </p>
            <p className="mt-1 text-[0.75rem] text-ink-faint">
              o hacé clic para elegir un archivo · JPG, PNG o PDF
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => aceptar(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-2">
              <FileImage size={18} className="text-ink-mute" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.875rem] font-medium text-ink">
                {archivo.nombre}
              </p>
              <p className="text-[0.75rem] text-ink-faint">Listo para enviar</p>
            </div>
            <button
              onClick={() => {
                setArchivo(null);
                setEstado("vacio");
              }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-surface-3 hover:text-ink"
              aria-label="Quitar archivo"
            >
              <X size={14} />
            </button>
          </div>
          <button
            onClick={enviar}
            disabled={estado === "enviando"}
            className="mt-4 h-10 w-full rounded-full bg-ink text-[0.875rem] font-medium text-paper transition-opacity disabled:opacity-50"
          >
            {estado === "enviando" ? "Enviando…" : "Enviar comprobante"}
          </button>
        </div>
      )}
    </div>
  );
}

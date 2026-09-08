"use client";

/* ==========================================================================
   Campo de contraseña con el ojito para mostrar/ocultar. Mismo ancho que
   los demás campos: el botón vive dentro del input, no le come espacio.
   Se usa en Entrar y en Nueva contraseña.
   ========================================================================== */
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

const campo =
  "h-11 w-full rounded-xl border border-line bg-surface-2 pr-11 pl-3.5 text-[14px] text-ink " +
  "placeholder:text-ink-faint transition-colors " +
  "focus:border-line-strong focus:bg-surface-3 focus:outline-none";

function OjoAbierto({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function OjoTachado({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6 0 9.5 6.5 9.5 6.5a15.8 15.8 0 0 1-2.35 3.32M6.6 6.6A15.9 15.9 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.06-.93" />
      <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

export function CampoClave({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  name,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete: string;
  name?: string;
  required?: boolean;
}) {
  const [ver, setVer] = useState(false);
  const id = useId();

  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-[11.5px] font-medium text-ink-mute">{label}</span>
      <div className="relative">
        <input
          id={id}
          type={ver ? "text" : "password"}
          name={name}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={campo}
        />
        <button
          type="button"
          onClick={() => setVer((v) => !v)}
          aria-label={ver ? "Ocultar la contraseña" : "Mostrar la contraseña"}
          aria-pressed={ver}
          tabIndex={-1}
          className={cn(
            "absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-faint",
            "transition-colors hover:text-ink-mute"
          )}
        >
          {ver ? (
            <OjoTachado className="h-[18px] w-[18px]" />
          ) : (
            <OjoAbierto className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
    </label>
  );
}

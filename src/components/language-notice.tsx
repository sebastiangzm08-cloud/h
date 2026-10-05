"use client";

/* ==========================================================================
   Aviso discreto "Switch to English" — SOLO en las páginas en español.

   NO redirige a nadie. Si el visitante parece de EE. UU. le ofrece, una vez,
   cambiar al inglés. Señales (todas locales: ningún dato sale del sitio y no
   se llama a ningún servicio de geolocalización):
     1. El primer idioma del navegador es inglés (`navigator.languages`).
     2. La zona horaria es de EE. UU. (`Intl.DateTimeFormat`). Costa Rica y
        México NO cuentan.
     3. La cookie `hz-pais=US`, que `proxy.ts` pone si el servidor recibe una
        cabecera de país (`cf-ipcountry`, `x-vercel-ip-country`, `x-country`)
        con valor US. Hoy esas cabeceras no existen; queda lista.

   La decisión (cambiar o descartar) se recuerda en localStorage y en una
   cookie, las dos con try/catch, para no repetir el aviso. Respeta
   `prefers-reduced-motion` y se cierra con Escape.
   ========================================================================== */
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Translate, X } from "@phosphor-icons/react/dist/ssr";
import { getCopy } from "@/lib/copy";
import {
  COOKIE_PAIS,
  guardarPreferenciaIdioma,
  leerPreferenciaIdioma,
  rutaEquivalente,
} from "@/lib/i18n";

/** Zonas horarias de EE. UU. (sin Puerto Rico ni otros territorios). */
const ZONAS_EEUU = new Set([
  "America/New_York",
  "America/Detroit",
  "America/Chicago",
  "America/Menominee",
  "America/Denver",
  "America/Boise",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Juneau",
  "America/Sitka",
  "America/Metlakatla",
  "America/Yakutat",
  "America/Nome",
  "America/Adak",
  "Pacific/Honolulu",
  "US/Eastern",
  "US/Central",
  "US/Mountain",
  "US/Pacific",
  "US/Alaska",
  "US/Hawaii",
  "US/Arizona",
  "US/Michigan",
  "US/East-Indiana",
  "US/Aleutian",
  "US/Indiana-Starke",
]);

function esZonaEeuu(zona: string) {
  return (
    ZONAS_EEUU.has(zona) ||
    zona.startsWith("America/Indiana/") ||
    zona.startsWith("America/Kentucky/") ||
    zona.startsWith("America/North_Dakota/")
  );
}

function parecePersonaDeEeuu(): boolean {
  try {
    const idioma = (navigator.languages?.[0] ?? navigator.language ?? "").toLowerCase();
    if (idioma === "en" || idioma.startsWith("en-")) return true;
  } catch {
    /* sin idioma legible: se prueba con las otras señales */
  }
  try {
    const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zona && esZonaEeuu(zona)) return true;
  } catch {
    /* sin Intl */
  }
  try {
    if (new RegExp(`(?:^|; )${COOKIE_PAIS}=US(?:;|$)`).test(document.cookie)) {
      return true;
    }
  } catch {
    /* sin cookies */
  }
  return false;
}

export function LanguageNotice() {
  const t = getCopy("en").aviso;
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (leerPreferenciaIdioma()) return; // ya decidió antes: no se repite
    if (!parecePersonaDeEeuu()) return;
    // Un momento después de cargar, para no competir con lo primero que se ve.
    const id = window.setTimeout(() => setVisible(true), 1400);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        guardarPreferenciaIdioma("es");
        setVisible(false);
      }
    };
    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label={t.aria}
      lang="en"
      className="aviso-idioma fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-line-strong bg-surface-2 p-4 shadow-[0_18px_50px_-18px_rgba(0,0,0,0.6)] motion-reduce:animate-none sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[23rem]"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-paper text-ink">
          <Translate size={16} weight="bold" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.875rem] leading-snug text-ink-soft">{t.texto}</p>
          <div className="mt-3 flex items-center gap-2">
            <a
              href={rutaEquivalente(pathname, "en")}
              hrefLang="en"
              onClick={() => guardarPreferenciaIdioma("en")}
              className="inline-flex h-9 items-center justify-center rounded-full bg-gradient-to-b from-acento-claro to-acento px-4 text-[0.8125rem] font-medium tracking-tight text-noche-texto transition-all duration-200 ease-out hover:from-acento hover:to-acento-oscuro active:scale-[0.97]"
            >
              {t.cambiar}
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            guardarPreferenciaIdioma("es");
            setVisible(false);
          }}
          aria-label={t.cerrar}
          className="-mt-1 -mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-mute transition-colors hover:text-ink"
        >
          <X size={16} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

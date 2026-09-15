"use client";

/* ==========================================================================
   Campo de plata con separador de miles (50.000, no 50000) — pedido de
   Sebastián: escribir un monto en un `<input type="number">` puro es
   incómodo, no hay forma de leer de un vistazo si son 50 mil o 500 mil.

   Muestra el número formateado en un input de texto y manda el valor CRUDO
   (solo dígitos) por un input oculto con el `name` real — así el servidor
   sigue recibiendo exactamente lo mismo que antes, sin tocar las acciones.
   ========================================================================== */
import { useState } from "react";

function soloDigitos(v: string) {
  return v.replace(/\D/g, "");
}

function conPuntos(digitos: string) {
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function CampoMonto({
  name,
  defaultValue,
  placeholder,
  className,
  autoFocus,
  required,
}: {
  name: string;
  defaultValue?: number | string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  /** Va en el input VISIBLE, nunca en el oculto — un campo oculto inválido
      no se puede enfocar, y el navegador se queda trabado sin avisar por qué. */
  required?: boolean;
}) {
  const [texto, setTexto] = useState(() => conPuntos(soloDigitos(String(defaultValue ?? ""))));

  return (
    <div className="min-w-0">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        required={required}
        value={texto}
        onChange={(e) => setTexto(conPuntos(soloDigitos(e.target.value)))}
        placeholder={placeholder}
        className={className}
      />
      <input type="hidden" name={name} value={soloDigitos(texto)} />
    </div>
  );
}

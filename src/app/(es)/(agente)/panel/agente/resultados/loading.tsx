import { Cabecera, Cuerpo } from "@/components/panel/agente-ui";

/* Esqueleto mientras se leen mensajes, citas y conversaciones. Pone la
   cabecera de una vez y las cajas con su forma final, para que nada salte. */
function Bloque({ alto }: { alto: string }) {
  return <div className={`animate-pulse rounded-2xl border border-line bg-surface-2 ${alto}`} aria-hidden="true" />;
}

export default function CargandoResultados() {
  return (
    <>
      <Cabecera
        eyebrow="Resultados"
        titulo="Lo que tu agente te deja"
        descripcion="Dónde se pierden clientes, cuánto vendiste, a quién le falta una cita y cómo volver a escribirle. Casi todo sale solo de tus conversaciones y citas; para «Asistieron» y las ventas hace falta que marqués las citas como «Cumplida» en Agenda."
      />
      <Cuerpo className="flex flex-col gap-5">
        <div role="status" aria-live="polite" className="sr-only">
          Cargando tus resultados…
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Bloque alto="h-[116px]" />
          <Bloque alto="h-[116px]" />
          <Bloque alto="h-[116px]" />
          <Bloque alto="h-[116px]" />
        </div>
        <div className="grid items-start gap-5 xl:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Bloque alto="h-[460px]" />
            <Bloque alto="h-[300px]" />
          </div>
          <div className="flex flex-col gap-5">
            <Bloque alto="h-[380px]" />
            <Bloque alto="h-[320px]" />
          </div>
        </div>
      </Cuerpo>
    </>
  );
}

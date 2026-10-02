import Link from "next/link";
import { Cabecera, Cuerpo, AvisoEjemplo } from "@/components/panel/agente-ui";
import { SeccionConocimiento } from "@/components/panel/conocimiento/seccion-conocimiento";
import { enModoEjemplo, getConocimiento } from "@/lib/panel/agente";

/* ==========================================================================
   Conocimiento: lo único que el agente sabe contestar.

   Tres listas — servicios con precio, datos del negocio y reglas de lo que
   nunca debe decir — y cada una se edita en su lugar: agregar, apagar sin
   perder, borrar con confirmación. El agente usa lo que se guarda acá desde
   la siguiente conversación.
   ========================================================================== */
export default async function ConocimientoPage() {
  const [items, ejemplo] = await Promise.all([getConocimiento(), enModoEjemplo()]);

  const servicios = items.filter((i) => i.tipo === "servicio");
  const datos = items.filter((i) => i.tipo === "dato");
  const reglas = items.filter((i) => i.tipo === "regla");

  const atajos = [
    { href: "#servicios", texto: "Servicios", n: servicios.length },
    { href: "#datos", texto: "Datos", n: datos.length },
    { href: "#reglas", texto: "Reglas", n: reglas.length },
  ];

  return (
    <>
      <Cabecera
        eyebrow="El agente"
        titulo="Conocimiento"
        descripcion="El agente contesta únicamente con lo que está en esta pantalla. Si algo no está acá, no lo inventa: te lo pregunta a vos."
      />
      <AvisoEjemplo visible={ejemplo} />

      <Cuerpo className="flex flex-col gap-[18px]">
        {/* Atajos para saltar entre las tres listas en el celular. En pantalla
            ancha las tres caben a la vista y sobran. */}
        <nav aria-label="Secciones de Conocimiento" className="-mt-1 flex flex-wrap gap-2 lg:hidden">
          {atajos.map((a) => (
            <a
              key={a.href}
              href={a.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface-2 px-4 text-[13px] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
            >
              {a.texto}
              <span className="font-mono text-[11px] text-ink-mute tabular-nums">{a.n}</span>
            </a>
          ))}
        </nav>

        <div className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <SeccionConocimiento
            id="servicios"
            tipo="servicio"
            eyebrow="Catálogo"
            titulo="Servicios y precios"
            descripcion="Lo que ofrecés y cuánto cuesta. Con esto el agente da precios y agenda las citas."
            icono="catalogo"
            vacioTitulo="Todavía no cargaste servicios"
            vacioTexto="Sin servicios el agente no puede dar precios ni agendar. Empezá con los 3 a 5 que más te piden."
            items={servicios}
          />

          <div className="flex min-w-0 flex-col gap-[18px]">
            <SeccionConocimiento
              id="datos"
              tipo="dato"
              eyebrow="Negocio"
              titulo="Horario y datos del negocio"
              descripcion={
                <>
                  Dirección, formas de pago y lo básico que la gente pregunta. El horario con el que agenda se ajusta en{" "}
                  <Link
                    href="/panel/agente/como-responde#horario"
                    className="text-ink-mute underline underline-offset-2 hover:text-ink"
                  >
                    Configuración
                  </Link>
                  .
                </>
              }
              icono="negocio"
              vacioTitulo="Faltan los datos básicos"
              vacioTexto="Cargá la dirección y las formas de pago para que el agente las pueda dar."
              items={datos}
            />

            <SeccionConocimiento
              id="reglas"
              tipo="regla"
              eyebrow="Límites"
              titulo="Qué nunca decir"
              descripcion="Límites duros: el agente no los cruza."
              icono="pendientes"
              vacioTitulo="No hay reglas cargadas"
              vacioTexto="Ej.: «No dar diagnósticos» o «No prometer resultados»."
              items={reglas}
            />
          </div>
        </div>
      </Cuerpo>
    </>
  );
}

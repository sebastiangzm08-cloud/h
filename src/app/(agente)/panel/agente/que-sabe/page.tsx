import { Cabecera, Cuerpo, Bloque, AvisoEjemplo, Vacio } from "@/components/panel/agente-ui";
import { colones } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import {
  AccionesConocimiento,
  FormaAgregarConocimiento,
} from "@/components/panel/agente-conocimiento-form";
import { enModoEjemplo, getConocimiento, type ItemConocimiento } from "@/lib/panel/agente";
import { cn } from "@/lib/utils";

function FilaConocimiento({
  k,
  v,
  item,
}: {
  k: React.ReactNode;
  v: React.ReactNode;
  item: ItemConocimiento;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-line px-4 py-2.5 [&+&]:border-t",
        !item.activo && "opacity-45"
      )}
    >
      <span className="min-w-0 flex-1 truncate text-[13px] text-ink-soft">{k}</span>
      <span className="flex-none font-mono text-[13px] text-ink tabular-nums">{v}</span>
      <AccionesConocimiento id={item.id} activo={item.activo} />
    </div>
  );
}

export default async function QueSabePage() {
  const [items, ejemplo] = await Promise.all([getConocimiento(), enModoEjemplo()]);

  const servicios = items.filter((i) => i.tipo === "servicio");
  const datos = items.filter((i) => i.tipo === "dato");
  const reglas = items.filter((i) => i.tipo === "regla");

  return (
    <>
      <Cabecera
        eyebrow="El agente"
        titulo="Qué sabe"
        descripcion="El agente contesta únicamente con lo que está en esta pantalla. Si algo no está acá, no lo inventa: te lo pregunta a vos."
      />
      <AvisoEjemplo visible={ejemplo} />

      <Cuerpo className="flex flex-col gap-4">
        <Bloque
          titulo="Servicios y precios"
          sub={`${servicios.length} cargados`}
        >
          {servicios.length === 0 ? (
            <Vacio>Todavía no hay servicios cargados. Sin esto el agente no puede dar precios.</Vacio>
          ) : (
            servicios.map((s) => (
              <FilaConocimiento
                key={s.id}
                item={s}
                k={
                  <>
                    {s.clave}
                    {s.duracionMin ? (
                      <span className="ml-2 text-ink-faint">{s.duracionMin} min</span>
                    ) : null}
                  </>
                }
                v={s.monto === 0 ? "Gratis" : s.monto != null ? colones(s.monto) : "A consultar"}
              />
            ))
          )}
          <FormaAgregarConocimiento tipo="servicio" />
        </Bloque>

        <Bloque titulo="Horario y datos del negocio" sub="Con esto agenda y responde lo básico">
          {datos.length === 0 ? (
            <Vacio>Falta cargar horario y dirección.</Vacio>
          ) : (
            datos.map((d) => <FilaConocimiento key={d.id} item={d} k={d.clave} v={d.valor || "—"} />)
          )}
          <FormaAgregarConocimiento tipo="dato" />
        </Bloque>

        <Bloque titulo="Qué nunca decir" sub="Límites duros: el agente no los cruza">
          {reglas.length === 0 ? (
            <Vacio>No hay reglas cargadas todavía.</Vacio>
          ) : (
            reglas.map((r) => (
              <FilaConocimiento
                key={r.id}
                item={r}
                k={
                  <span className="flex items-start gap-2.5">
                    <Icono nombre="flecha" className="mt-0.5 h-3.5 w-3.5 flex-none rotate-45 text-bad" />
                    {r.clave}
                  </span>
                }
                v=""
              />
            ))
          )}
          <FormaAgregarConocimiento tipo="regla" />
        </Bloque>
      </Cuerpo>
    </>
  );
}

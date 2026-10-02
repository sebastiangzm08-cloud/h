/* ==========================================================================
   Mensajes: las consultas que abren los clientes desde su pantalla de
   Soporte. Se responden dentro del panel, sin correo.

   Lo que espera tu respuesta va arriba. El filtro es un enlace (?f=…): la
   pantalla se arma en el servidor.
   ========================================================================== */
import Link from "next/link";
import { Pill } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import {
  AdminHead,
  Avatar,
  Cifras,
  TarjetaCifra,
  Vacio,
  claseChip,
  fechaHora,
} from "@/components/admin/admin-ui";
import { getConsultasAdmin } from "@/lib/panel/admin";
import type { EstadoConsulta } from "@/lib/panel/tipos";
import { cn } from "@/lib/utils";

const ESTADO: Record<EstadoConsulta, { texto: string; tono: "warn" | "ok" | "idle" }> = {
  sin_responder: { texto: "Sin responder", tono: "warn" },
  respondida: { texto: "Respondida", tono: "ok" },
  resuelta: { texto: "Resuelta", tono: "idle" },
};

type Filtro = "todas" | "espera" | "respondida" | "resuelta";

export default async function MensajesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ f?: string }>;
}) {
  const { f } = await searchParams;
  const filtro: Filtro = f === "espera" || f === "respondida" || f === "resuelta" ? f : "todas";

  const consultas = await getConsultasAdmin();

  /* Espera si el turno es de Hoshizora: sin responder, o con la última línea
     del cliente. Una ya resuelta nunca espera. */
  const espera = (c: (typeof consultas)[number]) =>
    c.estado !== "resuelta" && (c.estado === "sin_responder" || c.ultimaDe === "cliente");

  const esperan = consultas.filter(espera);
  const respondidas = consultas.filter((c) => c.estado === "respondida" && !espera(c));
  const resueltas = consultas.filter((c) => c.estado === "resuelta");

  const visibles = (
    filtro === "espera"
      ? esperan
      : filtro === "respondida"
        ? respondidas
        : filtro === "resuelta"
          ? resueltas
          : [...consultas].sort((a, b) => Number(espera(b)) - Number(espera(a)))
  ) as typeof consultas;

  const FILTROS: { valor: Filtro; texto: string; n: number; href: string }[] = [
    { valor: "todas", texto: "Todas", n: consultas.length, href: "/panel/admin/mensajes" },
    { valor: "espera", texto: "Te toca responder", n: esperan.length, href: "/panel/admin/mensajes?f=espera" },
    { valor: "respondida", texto: "Respondidas", n: respondidas.length, href: "/panel/admin/mensajes?f=respondida" },
    { valor: "resuelta", texto: "Resueltas", n: resueltas.length, href: "/panel/admin/mensajes?f=resuelta" },
  ];

  return (
    <>
      <AdminHead
        titulo="Mensajes"
        sub={`${consultas.length} en total`}
        descripcion={
          consultas.length === 0
            ? "Las consultas que tus clientes abren desde Soporte."
            : esperan.length > 0
              ? `${esperan.length} ${esperan.length === 1 ? "espera" : "esperan"} tu respuesta.`
              : "Nada pendiente de responder."
        }
      />

      {consultas.length === 0 ? (
        <Vacio icono="mensajes" titulo="Ningún cliente ha escrito todavía">
          Cuando un cliente abra una consulta desde su pantalla de Soporte, aparece acá y la contestás sin
          salir del panel.
        </Vacio>
      ) : (
        <>
          <Cifras columnas={4} etiqueta="Resumen de mensajes">
            <TarjetaCifra icono="mensajes" etiqueta="Consultas" valor={consultas.length} pie="Todas las que se abrieron" />
            <TarjetaCifra
              icono="pendientes"
              etiqueta="Te toca responder"
              valor={esperan.length}
              pie={esperan.length > 0 ? "Esperan tu respuesta" : "Bandeja al día"}
              tono={esperan.length > 0 ? "warn" : "normal"}
            />
            <TarjetaCifra icono="soporte" etiqueta="Respondidas" valor={respondidas.length} pie="Esperan al cliente" />
            <TarjetaCifra icono="actividad" etiqueta="Resueltas" valor={resueltas.length} pie="Cerradas" />
          </Cifras>

          <nav aria-label="Filtrar mensajes" className="flex flex-wrap gap-2">
            {FILTROS.map((x) => (
              <Link
                key={x.valor}
                href={x.href}
                prefetch={false}
                aria-current={filtro === x.valor ? "true" : undefined}
                className={claseChip(filtro === x.valor)}
              >
                {x.texto}
                <span className="font-mono text-[10.5px] opacity-70 tabular-nums">{x.n}</span>
              </Link>
            ))}
          </nav>

          {visibles.length === 0 ? (
            <Vacio icono="mensajes" titulo="Nada en esta lista">
              Ninguna consulta está en este estado ahora mismo.
            </Vacio>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {visibles.map((c) => {
                const toca = espera(c);
                return (
                  <li key={c.id}>
                    <Link
                      href={`/panel/admin/mensajes/${c.id}`}
                      prefetch={false}
                      className={cn(
                        "group flex min-h-[72px] items-center gap-3.5 rounded-2xl border bg-surface-2 p-4 transition-[border-color,background-color,transform] duration-150 hover:border-line-strong hover:bg-surface-3/60 active:scale-[0.995]",
                        toca ? "border-warn/40" : "border-line"
                      )}
                    >
                      <Avatar nombre={c.cliente ?? "?"} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-medium break-words text-ink">{c.asunto}</span>
                        <span className="mt-0.5 block truncate text-[11.5px] text-ink-faint">
                          {c.cliente} · {c.creadaEn ? fechaHora(c.creadaEn) : c.cuando}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-1.5 sm:hidden">
                          {toca ? (
                            <Pill tono="warn">Te toca responder</Pill>
                          ) : (
                            <Pill tono={ESTADO[c.estado].tono}>{ESTADO[c.estado].texto}</Pill>
                          )}
                        </span>
                      </span>
                      <span className="hidden flex-none flex-wrap items-center justify-end gap-1.5 sm:flex">
                        {toca ? (
                          <Pill tono="warn">Te toca responder</Pill>
                        ) : (
                          <Pill tono={ESTADO[c.estado].tono}>{ESTADO[c.estado].texto}</Pill>
                        )}
                      </span>
                      <Icono
                        nombre="flecha"
                        className="h-3.5 w-3.5 flex-none text-ink-faint transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}

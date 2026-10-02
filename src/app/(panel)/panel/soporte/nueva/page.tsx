/* ==========================================================================
   Nueva consulta de soporte. Al enviarla, el Server Action redirige al hilo.
   ========================================================================== */
import Link from "next/link";
import { Seccion } from "@/components/panel/configuracion/seccion";
import { PageHead } from "@/components/panel/ui";
import { FormNuevaConsulta } from "./form-nueva-consulta";

export default function NuevaConsultaPage() {
  return (
    <>
      {/* 44 px de alto de toque: un enlace de 12 px de letra es casi imposible de acertar con el pulgar. */}
      <Link
        href="/panel/soporte"
        className="-my-2 inline-flex min-h-11 items-center gap-1.5 self-start pr-3 text-[12.5px] text-ink-mute transition-colors hover:text-ink"
      >
        ‹ Soporte
      </Link>

      <PageHead titulo="Nueva consulta" descripcion="Te respondemos acá mismo, dentro del panel." />

      <Seccion className="max-w-xl" eyebrow="Contanos" titulo="¿Qué necesitás?">
        <FormNuevaConsulta />
      </Seccion>
    </>
  );
}

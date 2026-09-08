/* ==========================================================================
   Nueva consulta de soporte. Al enviarla, el Server Action redirige al hilo.
   ========================================================================== */
import Link from "next/link";
import { Caja, CajaHead, PageHead } from "@/components/panel/ui";
import { FormNuevaConsulta } from "./form-nueva-consulta";

export default function NuevaConsultaPage() {
  return (
    <>
      <Link
        href="/panel/soporte"
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-mute transition-colors hover:text-ink"
      >
        ‹ Soporte
      </Link>

      <PageHead
        titulo="Nueva consulta"
        descripcion="Te respondemos acá mismo, dentro del panel."
      />

      <Caja className="max-w-xl">
        <CajaHead eyebrow="Contanos" titulo="¿Qué necesitás?" />
        <FormNuevaConsulta />
      </Caja>
    </>
  );
}

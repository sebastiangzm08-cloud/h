import Link from "next/link";
import type { Metadata } from "next";
import { ConstellationMark } from "@/components/constellation";
import { LoginForm } from "@/components/portal/login-form";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Portal de cliente — ${site.nombre}`,
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-surface px-5 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <ConstellationMark className="h-6 w-6 text-ink" />
          <span className="text-[0.95rem] font-semibold tracking-tight">
            {site.nombre}
          </span>
        </Link>

        <div className="mt-10 rounded-2xl border border-line bg-paper p-8">
          <p className="eyebrow mb-1.5">Portal de cliente</p>
          <h1 className="text-[1.375rem] font-semibold tracking-tight text-ink">
            Ingresá a tu cuenta
          </h1>
          <p className="mt-1.5 text-[0.875rem] text-ink-mute">
            El acceso se crea al contratar. Si sos cliente y no tenés
            cuenta todavía, escribinos por WhatsApp.
          </p>

          <div className="mt-7">
            <LoginForm />
          </div>
        </div>

        <p className="mt-6 text-center text-[0.8125rem] text-ink-faint">
          ¿Todavía no sos cliente?{" "}
          <Link
            href="/diagnostico"
            className="text-ink-soft underline underline-offset-4"
          >
            Agenda un diagnóstico
          </Link>
        </p>
      </div>
    </div>
  );
}

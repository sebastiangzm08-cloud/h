/* ==========================================================================
   Puerta del panel admin.

   Esconder el menú de admin es cosmético; esto es lo que de verdad frena a
   un cliente que escriba /panel/admin a mano. Se comprueba contra el perfil
   de la sesión (que respeta RLS), y si no es admin, al panel normal.
   ========================================================================== */
import { redirect } from "next/navigation";
import { getPerfil } from "@/lib/panel/datos";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await getPerfil();
  if (perfil.rol !== "admin") redirect("/panel");

  return <>{children}</>;
}

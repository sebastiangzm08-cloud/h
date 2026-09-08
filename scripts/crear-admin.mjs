/* ==========================================================================
   Crea TU cuenta de administrador. Se corre UNA sola vez.

   Es el arranque en frío del panel: no hay ningún admin todavía, así que
   nadie puede crear al primer admin desde adentro. Este script lo hace con
   la llave `service_role`, que se salta las reglas.

   Uso (desde la carpeta web/):
     node scripts/crear-admin.mjs  tu-correo@ejemplo.com  "TuContraseña"

   La contraseña: mínimo 8, ponele algo que no uses en otro lado. La vas a
   escribir vos en la pantalla de acceso; no se guarda en ningún archivo.
   ========================================================================== */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const [correo, clave] = process.argv.slice(2);
if (!correo || !clave) {
  console.error('Uso: node scripts/crear-admin.mjs correo@ejemplo.com "Contraseña"');
  process.exit(1);
}
if (clave.length < 8) {
  console.error("La contraseña debe tener al menos 8 caracteres.");
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// 1. ¿Ya existe esa cuenta? (por si se corre dos veces)
const { data: lista, error: errLista } = await supabase.auth.admin.listUsers();
if (errLista) {
  console.error("No se pudo consultar usuarios:", errLista.message);
  process.exit(1);
}
let usuario = lista.users.find((u) => u.email?.toLowerCase() === correo.toLowerCase());

if (usuario) {
  console.log("• La cuenta ya existía. Le actualizo la contraseña.");
  const { error } = await supabase.auth.admin.updateUserById(usuario.id, {
    password: clave,
  });
  if (error) {
    console.error("No se pudo actualizar la contraseña:", error.message);
    process.exit(1);
  }
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email: correo,
    password: clave,
    email_confirm: true, // sin correo de confirmación: entra ya
  });
  if (error) {
    console.error("No se pudo crear la cuenta:", error.message);
    process.exit(1);
  }
  usuario = data.user;
  console.log("• Cuenta creada.");
}

// 2. Perfil de admin. Sin cliente_id (la restricción de la tabla lo exige).
const { error: errPerfil } = await supabase
  .from("perfiles")
  .upsert(
    { id: usuario.id, rol: "admin", cliente_id: null, nombre: "Sebastian" },
    { onConflict: "id" }
  );
if (errPerfil) {
  console.error("No se pudo escribir el perfil:", errPerfil.message);
  process.exit(1);
}

console.log("\n✓ Listo. Entrá en /acceso con:");
console.log("   correo:     " + correo);
console.log("   contraseña: la que pusiste en este comando");

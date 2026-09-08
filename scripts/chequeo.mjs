/* Chequeo temporal: valida el .env.local y la conexión con Supabase.
   Nunca imprime el valor de una llave, solo si está y cuánto mide. */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

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

const necesarias = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "N8N_WEBHOOK_SECRET",
];

console.log("--- Variables ---");
let faltan = 0;
for (const k of necesarias) {
  const v = env[k];
  if (!v) {
    console.log(`  ✗ ${k} — FALTA`);
    faltan++;
  } else if (v.startsWith("<")) {
    console.log(`  ✗ ${k} — quedó el marcador sin reemplazar`);
    faltan++;
  } else {
    const pista = k.includes("URL") ? v : `${v.length} caracteres`;
    console.log(`  ✓ ${k} — ${pista}`);
  }
}
if (faltan) {
  console.log(`\n${faltan} variable(s) por completar. Paro acá.`);
  process.exit(1);
}

console.log("\n--- Conexión con la base ---");
const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data, error } = await sb
  .from("catalogo_automatizaciones")
  .select("slug, nombre, estado")
  .order("nombre");

if (error) {
  console.log(`  ✗ ${error.message}`);
  if (/does not exist|schema cache/i.test(error.message)) {
    console.log("\n  → Las llaves sirven, pero el schema.sql todavía no se corrió.");
  } else {
    console.log("\n  → Revisá que la URL y la service_role sean del proyecto correcto.");
  }
  process.exit(1);
}

console.log(`  ✓ Conectado. ${data.length} automatizaciones en el catálogo:`);
for (const a of data) console.log(`      ${a.estado === "publicada" ? "●" : "○"} ${a.nombre}`);

const { count } = await sb
  .from("clientes")
  .select("*", { count: "exact", head: true });
console.log(`\n  Clientes en la base: ${count ?? 0}`);
console.log("\nTodo en orden.");

/* Borra el cliente DEMO (demo-farmasi@hoshizora.local) y todo lo suyo.
   node scripts/borrar-demo.mjs */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(fs.readFileSync(".env.local","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>{const i=l.indexOf("=");return[l.slice(0,i).trim(),l.slice(i+1).trim()]}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} });
const CORREO = "demo-farmasi@hoshizora.local";
const {data:l}=await sb.auth.admin.listUsers();
for (const u of l.users) { if(u.email!==CORREO) continue;
  const {data:p}=await sb.from("perfiles").select("cliente_id").eq("id",u.id).maybeSingle();
  await sb.from("perfiles").delete().eq("id",u.id);
  if(p?.cliente_id) await sb.from("clientes").delete().eq("id",p.cliente_id);
  await sb.auth.admin.deleteUser(u.id); console.log("demo borrado"); }
await sb.from("clientes").delete().eq("correo",CORREO);

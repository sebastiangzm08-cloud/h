/* Crea un cliente DEMO con el panel lleno (actividad, cobros, conexión,
   piezas, perfil del negocio) para mirar cómo lo ve un cliente de verdad.
   Entrás con:  demo-farmasi@hoshizora.local  /  demo1234
   Se borra con: node scripts/borrar-demo.mjs
   Uso: node scripts/crear-demo.mjs */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
const env = Object.fromEntries(fs.readFileSync(".env.local","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>{const i=l.indexOf("=");return[l.slice(0,i).trim(),l.slice(i+1).trim()]}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false} });
const D = { correo:"demo-farmasi@hoshizora.local", clave:"demo1234" };

const { data: l } = await sb.auth.admin.listUsers();
let id = l.users.find(z=>z.email===D.correo)?.id;
if (!id) { const { data, error } = await sb.auth.admin.createUser({ email:D.correo, password:D.clave, email_confirm:true }); if (error) throw error; id = data.user.id; }

const { data: cli } = await sb.from("clientes").upsert({
  correo:D.correo, nombre_negocio:"Farmasi · Johana (DEMO)", rubro:"Cosméticos y suplementos",
  descripcion_corta:"Colágeno, cremas y suplementos Farmasi por catálogo", persona_contacto:"Johana Rodríguez",
  whatsapp:"+506 6079 1641", plan:"Básico", estado:"activo", onboarding_completo:true,
  tono_base:"divertido, trato de vos", que_nunca_decir:"No prometer resultados médicos",
  horario:{ texto:"Lun a vie, 8 a.m. – 6 p.m." },
  perfil_negocio:{ queVendes:"Colágeno, cremas y suplementos Farmasi por catálogo", quienCompra:"Mujeres 25-45, compran por recomendación", queTeDiferencia:"Atención por WhatsApp y envíos en el día", voz:"divertido", trato:"vos", queNuncaDecir:"No prometer resultados médicos", promosActivas:"20% en la segunda unidad en setiembre", ejemplosTexto:"Amiga, esto te va a encantar 💛", links:"instagram.com/farmasi.johana" },
}, { onConflict:"correo" }).select("id").single();

await sb.from("perfiles").upsert({ id, rol:"cliente", cliente_id:cli.id, nombre:"Johana Rodríguez" }, { onConflict:"id" });
const { data: cat } = await sb.from("catalogo_automatizaciones").select("id").eq("slug","redes-sociales").single();
const { data: asg } = await sb.from("asignaciones").upsert({ cliente_id:cli.id, automatizacion_id:cat.id, estado:"activa", precio_mensual:50000, limites:{ publicacionesDia:10, publicacionesMes:300, fotosMejoradasMes:30 }, config:{ tono:"Cercano y tico, sin tecnicismos.", hashtags:true, textoPorRed:true } }, { onConflict:"cliente_id,automatizacion_id" }).select("id").single();

const now = Date.now(), dia = 86400000;
await sb.from("actividad").delete().eq("cliente_id", cli.id);
const filas = [];
for (let d=13; d>=0; d--) { const n = 1 + ((d*7)%5); for (let k=0;k<n;k++) filas.push({ cliente_id:cli.id, asignacion_id:asg.id, tipo:"publicacion", descripcion:`Publicado en Instagram — pieza ${d}-${k}`, resultado:"ok", creada_en:new Date(now-d*dia-k*3600000).toISOString() }); }
filas.push({ cliente_id:cli.id, asignacion_id:asg.id, tipo:"revision", descripcion:"2 textos esperan tu visto bueno", resultado:"atencion", creada_en:new Date(now-2*3600000).toISOString() });
await sb.from("actividad").insert(filas);
await sb.from("conexiones").delete().eq("cliente_id", cli.id);
await sb.from("conexiones").insert({ cliente_id:cli.id, servicio:"instagram", estado:"conectada", referencia_externa:"@farmasi.johana" });
await sb.from("cobros").delete().eq("cliente_id", cli.id);
await sb.from("cobros").insert([
  { cliente_id:cli.id, periodo:"Agosto 2026", monto:50000, estado:"pagado", metodo:"SINPE Móvil", pagado_en:new Date(now-20*dia).toISOString() },
  { cliente_id:cli.id, periodo:"Setiembre 2026", monto:50000, estado:"pendiente" },
]);
await sb.from("cola").delete().eq("cliente_id", cli.id);
await sb.from("cola").insert([
  { cliente_id:cli.id, asignacion_id:asg.id, tipo:"imagen", url_imagekit:"https://ik.imagekit.io/demo/img/image1.jpeg", instruccion:"promo de setiembre, mencionar 20%", redes:["instagram","facebook"], estado:"publicada", creada_en:new Date(now-3*dia).toISOString() },
  { cliente_id:cli.id, asignacion_id:asg.id, tipo:"imagen", url_imagekit:"https://ik.imagekit.io/demo/img/image2.jpeg", instruccion:"mejorala y quitale el fondo", redes:["instagram"], estado:"en_retoque", creada_en:new Date(now-2*3600000).toISOString() },
  { cliente_id:cli.id, asignacion_id:asg.id, tipo:"imagen", url_imagekit:"https://ik.imagekit.io/demo/img/image3.jpg", instruccion:"", redes:["instagram","facebook"], estado:"pendiente", creada_en:new Date(now-600000).toISOString() },
]);
console.log("DEMO listo →", D.correo, "/", D.clave);

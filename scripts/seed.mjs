// @ts-check
/**
 * Seed de datos de prueba para SIGA.
 *
 * Crea usuarios de auth (Admin API) y puebla las 8 tablas usando el cliente
 * service_role (saltea RLS). Es idempotente: los usuarios se crean o reutilizan
 * y las tablas de dominio se vacían y recargan en cada corrida.
 *
 *   npm run seed
 *   # o: node --env-file=.env.local scripts/seed.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { WebSocket } from "ws";

// supabase-js inicializa un cliente Realtime al construirse y en Node < 22 no
// hay WebSocket nativo. Lo proveemos (no llegamos a usar Realtime en el seed).
globalThis.WebSocket = globalThis.WebSocket ?? WebSocket;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Corré: node --env-file=.env.local scripts/seed.mjs",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** Password común para todos los usuarios de prueba. */
const PASSWORD = "Siga.2026!";

const USUARIOS = [
  { email: "admin@siga.test", full_name: "Ada Admin", role: "administrador" },
  { email: "docente1@siga.test", full_name: "Diego Docente", role: "docente" },
  { email: "docente2@siga.test", full_name: "Dora Docente", role: "docente" },
  { email: "estudiante1@siga.test", full_name: "Esteban Estudiante", role: "estudiante" },
  { email: "estudiante2@siga.test", full_name: "Elena Estudiante", role: "estudiante" },
  { email: "estudiante3@siga.test", full_name: "Emilio Estudiante", role: "estudiante" },
];

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 1000;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u) => u.email === email);
    if (found) return found;
    if (data.users.length < perPage) return null;
    page++;
  }
}

async function ensureUser(u) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: u.full_name },
  });
  if (!error) return data.user.id;

  // Si ya existe, lo reutilizamos.
  const existing = await findUserByEmail(u.email);
  if (!existing) {
    throw new Error(`No se pudo crear ni encontrar ${u.email}: ${error.message}`);
  }
  return existing.id;
}

async function clearTable(table) {
  const { error } = await supabase
    .from(table)
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(`No se pudo limpiar ${table}: ${error.message}`);
}

async function insertMany(table, rows) {
  const { data, error } = await supabase.from(table).insert(rows).select("*");
  if (error) throw new Error(`Insert en ${table}: ${error.message}`);
  return data;
}

async function main() {
  console.log("→ Creando/actualizando usuarios...");
  const id = {}; // email -> uuid
  for (const u of USUARIOS) {
    const uid = await ensureUser(u);
    id[u.email] = uid;
    const { error } = await supabase
      .from("profiles")
      .update({ role: u.role, full_name: u.full_name })
      .eq("id", uid);
    if (error) throw new Error(`Update profile ${u.email}: ${error.message}`);
    console.log(`   ✓ ${u.email} (${u.role})`);
  }

  console.log("→ Limpiando tablas de dominio...");
  for (const t of [
    "entregas",
    "notas",
    "trabajos_practicos",
    "inscripciones",
    "eventos_calendario",
    "avisos",
    "materias",
  ]) {
    await clearTable(t);
  }

  console.log("→ Materias...");
  const materias = await insertMany("materias", [
    { codigo: "MAT101", nombre: "Análisis Matemático I", descripcion: "Límites, derivadas e integrales.", docente_id: id["docente1@siga.test"], cupo: 40, periodo: "2026-1" },
    { codigo: "FIS101", nombre: "Física I", descripcion: "Mecánica clásica.", docente_id: id["docente1@siga.test"], cupo: 35, periodo: "2026-1" },
    { codigo: "PRG101", nombre: "Programación I", descripcion: "Fundamentos de programación.", docente_id: id["docente2@siga.test"], cupo: 50, periodo: "2026-1" },
    { codigo: "BD101", nombre: "Bases de Datos", descripcion: "Modelo relacional y SQL.", docente_id: id["docente2@siga.test"], cupo: 45, periodo: "2026-1" },
  ]);
  const mat = Object.fromEntries(materias.map((m) => [m.codigo, m]));

  console.log("→ Inscripciones...");
  const inscripciones = await insertMany("inscripciones", [
    { materia_id: mat.MAT101.id, estudiante_id: id["estudiante1@siga.test"] },
    { materia_id: mat.PRG101.id, estudiante_id: id["estudiante1@siga.test"] },
    { materia_id: mat.MAT101.id, estudiante_id: id["estudiante2@siga.test"] },
    { materia_id: mat.FIS101.id, estudiante_id: id["estudiante2@siga.test"] },
    { materia_id: mat.PRG101.id, estudiante_id: id["estudiante3@siga.test"] },
    { materia_id: mat.BD101.id, estudiante_id: id["estudiante3@siga.test"] },
  ]);
  const ins = (codigo, email) => {
    const found = inscripciones.find(
      (i) => i.materia_id === mat[codigo].id && i.estudiante_id === id[email],
    );
    if (!found) throw new Error(`Inscripción no encontrada: ${codigo}/${email}`);
    return found.id;
  };

  console.log("→ Notas...");
  await insertMany("notas", [
    { inscripcion_id: ins("MAT101", "estudiante1@siga.test"), descripcion: "Parcial 1", valor: 8.5, docente_id: id["docente1@siga.test"] },
    { inscripcion_id: ins("MAT101", "estudiante2@siga.test"), descripcion: "Parcial 1", valor: 6.0, docente_id: id["docente1@siga.test"] },
    { inscripcion_id: ins("PRG101", "estudiante1@siga.test"), descripcion: "TP Integrador", valor: 9.0, docente_id: id["docente2@siga.test"] },
    { inscripcion_id: ins("PRG101", "estudiante3@siga.test"), descripcion: "TP Integrador", valor: 7.25, docente_id: id["docente2@siga.test"] },
  ]);

  console.log("→ Trabajos prácticos...");
  const tps = await insertMany("trabajos_practicos", [
    { materia_id: mat.MAT101.id, titulo: "TP1 - Límites y continuidad", consigna: "Resolver la guía 1.", fecha_entrega: "2026-07-01T23:59:00Z" },
    { materia_id: mat.PRG101.id, titulo: "TP1 - Variables y tipos", consigna: "Ejercicios 1 a 10.", fecha_entrega: "2026-07-05T23:59:00Z" },
  ]);
  const tpPrg = tps.find((t) => t.materia_id === mat.PRG101.id);

  console.log("→ Entregas...");
  await insertMany("entregas", [
    {
      trabajo_practico_id: tpPrg.id,
      estudiante_id: id["estudiante1@siga.test"],
      archivo_path: `${id["estudiante1@siga.test"]}/${tpPrg.id}/tp1.pdf`,
      comentario: "Entrega del TP1.",
      calificacion: 8.0,
      feedback: "Buen trabajo, revisar el ejercicio 7.",
      corregido_at: new Date().toISOString(),
    },
    {
      trabajo_practico_id: tpPrg.id,
      estudiante_id: id["estudiante3@siga.test"],
      archivo_path: `${id["estudiante3@siga.test"]}/${tpPrg.id}/tp1.pdf`,
      comentario: "Mi resolución.",
    },
  ]);

  console.log("→ Eventos del calendario...");
  await insertMany("eventos_calendario", [
    { titulo: "Inicio de clases", descripcion: "Comienzo del cuatrimestre 2026-1.", fecha_inicio: "2026-03-10T12:00:00Z", materia_id: null, creado_por: id["admin@siga.test"] },
    { titulo: "Parcial 1 - Análisis", descripcion: "Aula 204.", fecha_inicio: "2026-05-15T12:00:00Z", fecha_fin: "2026-05-15T14:00:00Z", materia_id: mat.MAT101.id, creado_por: id["docente1@siga.test"] },
  ]);

  console.log("→ Avisos...");
  await insertMany("avisos", [
    { titulo: "Bienvenidos a SIGA", contenido: "El sistema ya está disponible para todos.", materia_id: null, autor_id: id["admin@siga.test"] },
    { titulo: "Cambio de aula", contenido: "Programación I se dicta en el laboratorio 3.", materia_id: mat.PRG101.id, autor_id: id["docente2@siga.test"] },
  ]);

  console.log("\n✅ Seed completo.\n");
  console.log("Usuarios de prueba (password para todos): " + PASSWORD);
  for (const u of USUARIOS) console.log(`   - ${u.email}  [${u.role}]`);
}

main().catch((err) => {
  console.error("\n✗ Error en el seed:", err.message);
  process.exit(1);
});

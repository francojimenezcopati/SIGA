// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

import { getAuthContext } from "@/server/lib/auth";
import * as repo from "@/server/repositories/materias.repository";
import { GET, POST } from "./route";

// Mockeamos el borde (Supabase/cookies y auth); controller + service +
// route + manejo de errores corren de verdad. Esto verifica respuestas y
// permisos de los endpoints sin necesidad de una base real.
vi.mock("@/server/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({})),
}));
vi.mock("@/server/lib/auth", () => ({
  getAuthContext: vi.fn(),
}));
vi.mock("@/server/repositories/materias.repository", () => ({
  listMaterias: vi.fn(),
  findMateriaByCodigo: vi.fn(),
  insertMateria: vi.fn(),
}));

const URL_BASE = "http://localhost/api/materias";

function makeRequest(url: string, init?: RequestInit) {
  return new Request(url, init) as unknown as NextRequest;
}

function postBody(body: unknown) {
  return makeRequest(URL_BASE, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/materias", () => {
  it("responde 401 sin sesión", async () => {
    vi.mocked(getAuthContext).mockResolvedValue(null);

    const res = await GET(makeRequest(URL_BASE));

    expect(res.status).toBe(401);
  });

  it("responde 200 con la lista para un usuario autenticado", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      userId: "e-1",
      email: "e@siga.test",
      role: "estudiante",
    });
    vi.mocked(repo.listMaterias).mockResolvedValue([
      { id: "m-1", codigo: "X1" } as repo.Materia,
    ]);

    const res = await GET(makeRequest(`${URL_BASE}?search=x`));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([{ id: "m-1", codigo: "X1" }]);
  });
});

describe("POST /api/materias", () => {
  it("responde 401 sin sesión", async () => {
    vi.mocked(getAuthContext).mockResolvedValue(null);

    const res = await POST(postBody({ codigo: "A1", nombre: "Materia" }));

    expect(res.status).toBe(401);
  });

  it("responde 403 si el rol es estudiante", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      userId: "e-1",
      email: "e@siga.test",
      role: "estudiante",
    });

    const res = await POST(postBody({ codigo: "A1", nombre: "Materia" }));

    expect(res.status).toBe(403);
  });

  it("responde 400 si el body es inválido (falta nombre)", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      userId: "d-1",
      email: "d@siga.test",
      role: "docente",
    });

    const res = await POST(postBody({ codigo: "A1" }));

    expect(res.status).toBe(400);
  });

  it("responde 201 al crear como docente", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      userId: "d-1",
      email: "d@siga.test",
      role: "docente",
    });
    vi.mocked(repo.findMateriaByCodigo).mockResolvedValue(null);
    vi.mocked(repo.insertMateria).mockResolvedValue({
      id: "m-1",
      codigo: "A1",
      nombre: "Materia",
    } as repo.Materia);

    const res = await POST(postBody({ codigo: "A1", nombre: "Materia" }));

    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toMatchObject({ id: "m-1" });
  });

  it("responde 409 si el código ya existe y no inserta", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      userId: "d-1",
      email: "d@siga.test",
      role: "docente",
    });
    vi.mocked(repo.findMateriaByCodigo).mockResolvedValue({
      id: "dup",
    } as repo.Materia);

    const res = await POST(postBody({ codigo: "A1", nombre: "Materia" }));

    expect(res.status).toBe(409);
    expect(repo.insertMateria).not.toHaveBeenCalled();
  });
});

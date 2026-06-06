// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/server/lib/api-error";
import type { AuthContext } from "@/server/lib/auth";
import type { SupabaseServerClient } from "@/server/lib/supabase/server";
import * as repo from "@/server/repositories/materias.repository";
import { createMateria, getMaterias } from "./materias.service";

vi.mock("@/server/repositories/materias.repository", () => ({
  listMaterias: vi.fn(),
  findMateriaByCodigo: vi.fn(),
  insertMateria: vi.fn(),
}));

// El repositorio está mockeado, así que el cliente no se usa realmente.
const supabase = {} as unknown as SupabaseServerClient;

const docente: AuthContext = {
  userId: "doc-1",
  email: "d@siga.test",
  role: "docente",
};
const admin: AuthContext = {
  userId: "adm-1",
  email: "a@siga.test",
  role: "administrador",
};

const baseInput = {
  codigo: "MAT900",
  nombre: "Materia Test",
  descripcion: null,
  cupo: 30,
  periodo: "2026-1",
  docente_id: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(repo.insertMateria).mockImplementation(
    async (_supabase, values) =>
      ({ id: "m-1", created_at: "", updated_at: "", ...values }) as repo.Materia,
  );
});

describe("createMateria", () => {
  it("asigna al docente actual como docente a cargo cuando lo crea un docente", async () => {
    vi.mocked(repo.findMateriaByCodigo).mockResolvedValue(null);

    await createMateria(supabase, { ...baseInput, docente_id: "otro-id" }, docente);

    expect(repo.insertMateria).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({ docente_id: "doc-1" }),
    );
  });

  it("respeta el docente_id provisto cuando lo crea un admin", async () => {
    vi.mocked(repo.findMateriaByCodigo).mockResolvedValue(null);

    await createMateria(supabase, { ...baseInput, docente_id: "doc-9" }, admin);

    expect(repo.insertMateria).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({ docente_id: "doc-9" }),
    );
  });

  it("lanza 409 y no inserta si el código ya existe", async () => {
    vi.mocked(repo.findMateriaByCodigo).mockResolvedValue({
      id: "existing",
    } as repo.Materia);

    await expect(
      createMateria(supabase, baseInput, docente),
    ).rejects.toBeInstanceOf(ApiError);
    await expect(
      createMateria(supabase, baseInput, docente),
    ).rejects.toMatchObject({ status: 409 });

    expect(repo.insertMateria).not.toHaveBeenCalled();
  });
});

describe("getMaterias", () => {
  it("delega en el repositorio pasando el search", async () => {
    vi.mocked(repo.listMaterias).mockResolvedValue([
      { id: "m-1" } as repo.Materia,
    ]);

    const result = await getMaterias(supabase, { search: "alg" });

    expect(repo.listMaterias).toHaveBeenCalledWith(supabase, { search: "alg" });
    expect(result).toEqual([{ id: "m-1" }]);
  });
});

import type { NextRequest } from "next/server";

import {
  createMateriaController,
  listMateriasController,
} from "@/server/controllers/materias.controller";
import { handleApiError, ok } from "@/server/lib/http";

/**
 * Route handler "delgado": delega en los controllers y deja el manejo de
 * errores a `handleApiError`. Sin lógica de negocio acá.
 */

export async function GET(request: NextRequest) {
  try {
    const materias = await listMateriasController(request);
    return ok(materias);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const materia = await createMateriaController(request);
    return ok(materia, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

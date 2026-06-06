import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ApiError } from "@/server/lib/api-error";

/** Respuesta JSON de éxito. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

/**
 * Manejo centralizado de errores: convierte cualquier excepción en una
 * respuesta JSON con el código HTTP adecuado, sin filtrar detalles internos.
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details ?? null },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Datos inválidos", details: error.issues },
      { status: 400 },
    );
  }

  console.error("[api] Error inesperado:", error);
  return NextResponse.json(
    { error: "Error interno del servidor" },
    { status: 500 },
  );
}

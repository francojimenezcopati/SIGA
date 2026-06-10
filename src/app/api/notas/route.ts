import type { NextRequest } from "next/server";
import {
  createNotaController,
  listNotasController,
} from "@/server/controllers/nota.controller";
import { handleApiError, ok } from "@/server/lib/http";

export async function GET(request: NextRequest) {
  try {
    const data = await listNotasController(request);
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await createNotaController(request);
    return ok(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

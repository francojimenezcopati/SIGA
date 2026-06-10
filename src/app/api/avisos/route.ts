import type { NextRequest } from "next/server";
import {
  createAvisoController,
  listAvisosController,
} from "@/server/controllers/aviso.controller";
import { handleApiError, ok } from "@/server/lib/http";

export async function GET(request: NextRequest) {
  try {
    const data = await listAvisosController(request);
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await createAvisoController(request);
    return ok(data, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

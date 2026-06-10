import type { NextRequest } from "next/server";
import { listUsuariosController } from "@/server/controllers/usuario.controller";
import { handleApiError, ok } from "@/server/lib/http";

export async function GET(request: NextRequest) {
  try {
    const data = await listUsuariosController(request);
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

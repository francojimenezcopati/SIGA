import type { NextRequest } from "next/server";
import { patchUsuarioRoleController } from "@/server/controllers/usuario.controller";
import { handleApiError, ok } from "@/server/lib/http";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const data = await patchUsuarioRoleController(request, { params: { id } });
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

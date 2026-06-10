import type { NextRequest } from "next/server";
import { patchNotaController } from "@/server/controllers/nota.controller";
import { handleApiError, ok } from "@/server/lib/http";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const data = await patchNotaController(request, { params: { id } });
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

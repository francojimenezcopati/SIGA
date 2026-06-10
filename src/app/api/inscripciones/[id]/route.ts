import { NextRequest } from "next/server";
import { InscripcionController } from "@/server/controllers/inscripcion.controller";

const controller = new InscripcionController();

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return controller.delete(request, { params: { id } });
}

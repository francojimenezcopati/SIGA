import { NextRequest } from "next/server";
import { TpController } from "@/server/controllers/tp.controller";

const controller = new TpController();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return controller.getEntregas(request, { params: { id } });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return controller.createEntrega(request, { params: { id } });
}

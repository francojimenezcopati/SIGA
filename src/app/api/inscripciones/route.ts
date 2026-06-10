import { NextRequest } from "next/server";
import { InscripcionController } from "@/server/controllers/inscripcion.controller";

const controller = new InscripcionController();

export async function GET(request: NextRequest) {
  return controller.getAll(request);
}

export async function POST(request: NextRequest) {
  return controller.create(request);
}
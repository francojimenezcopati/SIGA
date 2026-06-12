import { NextRequest } from "next/server";
import { TpController } from "@/server/controllers/tp.controller";

const controller = new TpController();

export async function GET(request: NextRequest) {
  return controller.getTps(request);
}

export async function POST(request: NextRequest) {
  return controller.createTp(request);
}

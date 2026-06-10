import { NextRequest } from "next/server";
import { getAuthContext } from "@/server/lib/auth";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { InscripcionService } from "../services/inscripcion.service";
import { createInscripcionSchema } from "../schemas/inscripcion.schema";
import { badRequest, unauthorized } from "@/server/lib/api-error";
import { handleApiError, ok } from "@/server/lib/http";

export class InscripcionController {
  constructor(private service = new InscripcionService()) {}

  async getAll(req: NextRequest) {
    try {
      const supabase = await createSupabaseServerClient();
      const auth = await getAuthContext(supabase);
      if (!auth) throw unauthorized();

      const data = await this.service.getInscripcionesForUser(auth.userId, auth.role);
      return ok(data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async create(req: NextRequest) {
    try {
      const supabase = await createSupabaseServerClient();
      const auth = await getAuthContext(supabase);
      if (!auth) throw unauthorized();

      let body: unknown;
      try {
        body = await req.json();
      } catch {
        throw badRequest("El cuerpo debe ser JSON válido");
      }

      const parsed = createInscripcionSchema.safeParse(body);
      if (!parsed.success) {
        throw badRequest(parsed.error.issues[0].message);
      }

      const data = await this.service.enrollEstudiante(auth.userId, auth.role, parsed.data);
      return ok(data, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async delete(req: NextRequest, context: { params: { id: string } }) {
    try {
      const supabase = await createSupabaseServerClient();
      const auth = await getAuthContext(supabase);
      if (!auth) throw unauthorized();

      const { id } = context.params;
      if (!id) throw badRequest("Missing enrollment ID");

      await this.service.unenrollEstudiante(id, auth.userId, auth.role);
      return ok({ success: true });
    } catch (error) {
      return handleApiError(error);
    }
  }
}
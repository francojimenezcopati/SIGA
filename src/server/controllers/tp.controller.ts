import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthContext } from "@/server/lib/auth";
import { createSupabaseServerClient } from "@/server/lib/supabase/server";
import { getTps, createTp, getEntregas, createEntrega } from "../services/tp.service";
import { createTpSchema, createEntregaSchema } from "../schemas/tp.schema";
import { badRequest, unauthorized } from "@/server/lib/api-error";
import { handleApiError, ok } from "@/server/lib/http";

export class TpController {
  async getTps(req: NextRequest) {
    try {
      const supabase = await createSupabaseServerClient();
      const auth = await getAuthContext(supabase);
      if (!auth) throw unauthorized();

      const { searchParams } = new URL(req.url);
      const materiaId = searchParams.get("materia_id") || undefined;
      
      if (materiaId) {
        const parsed = z.string().uuid().safeParse(materiaId);
        if (!parsed.success) {
          throw badRequest("materia_id inválido");
        }
      }

      const data = await getTps(supabase, auth, materiaId);
      return ok(data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async createTp(req: NextRequest) {
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

      const parsed = createTpSchema.safeParse(body);
      if (!parsed.success) {
        throw badRequest(parsed.error.issues[0].message);
      }

      const data = await createTp(supabase, parsed.data, auth);
      return ok(data, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getEntregas(req: NextRequest, context: { params: { id: string } }) {
    try {
      const supabase = await createSupabaseServerClient();
      const auth = await getAuthContext(supabase);
      if (!auth) throw unauthorized();

      const { id: tpId } = context.params;
      const parsedTpId = z.string().uuid({ message: "ID de TP inválido" }).safeParse(tpId);
      if (!parsedTpId.success) {
        throw badRequest(parsedTpId.error.issues[0].message);
      }

      const data = await getEntregas(supabase, parsedTpId.data, auth);
      return ok(data);
    } catch (error) {
      return handleApiError(error);
    }
  }

  async createEntrega(req: NextRequest, context: { params: { id: string } }) {
    try {
      const supabase = await createSupabaseServerClient();
      const auth = await getAuthContext(supabase);
      if (!auth) throw unauthorized();

      const { id: tpId } = context.params;
      const parsedTpId = z.string().uuid({ message: "ID de TP inválido" }).safeParse(tpId);
      if (!parsedTpId.success) {
        throw badRequest(parsedTpId.error.issues[0].message);
      }

      let body: unknown;
      try {
        body = await req.json();
      } catch {
        throw badRequest("El cuerpo debe ser JSON válido");
      }

      const parsed = createEntregaSchema.safeParse(body);
      if (!parsed.success) {
        throw badRequest(parsed.error.issues[0].message);
      }

      const data = await createEntrega(supabase, parsedTpId.data, parsed.data, auth);
      return ok(data, { status: 201 });
    } catch (error) {
      return handleApiError(error);
    }
  }
}

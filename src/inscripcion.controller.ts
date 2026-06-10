import { NextRequest } from 'next/server';
import { getAuthContext } from '../lib/auth';
import { InscripcionService } from '../services/inscripcion.service';
import { createInscripcionSchema } from '../schemas/inscripcion.schema';
import { ApiError } from '../lib/api-error';
import { sendJsonResponse } from '../lib/http';

export class InscripcionController {
  constructor(private service = new InscripcionService()) {}

  async getAll(req: NextRequest) {
    try {
      const { user, role } = await getAuthContext(req);
      const data = await this.service.getInscripcionesForUser(user.id, role);
      return sendJsonResponse(200, data);
    } catch (error) {
      return ApiError.handle(error);
    }
  }

  async create(req: NextRequest) {
    try {
      const { user, role } = await getAuthContext(req);
      const body = await req.json();
      
      const parsed = createInscripcionSchema.safeParse(body);
      if (!parsed.success) {
        throw ApiError.BadRequest(parsed.error.errors[0].message);
      }

      const data = await this.service.enrollEstudiante(user.id, role, parsed.data);
      return sendJsonResponse(201, data);
    } catch (error) {
      return ApiError.handle(error);
    }
  }

  async delete(req: NextRequest, context: { params: { id: string } }) {
    try {
      const { user, role } = await getAuthContext(req);
      const { id } = context.params;

      if (!id) throw ApiError.BadRequest('Missing enrollment ID');

      await this.service.unenrollEstudiante(id, user.id, role);
      return sendJsonResponse(200, { success: true });
    } catch (error) {
      return ApiError.handle(error);
    }
  }
}
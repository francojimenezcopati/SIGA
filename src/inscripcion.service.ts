import { InscripcionRepository } from '../repositories/inscripcion.repository';
import { CreateInscripcionDto } from '../schemas/inscripcion.schema';
import { ApiError } from '../lib/api-error';

export class InscripcionService {
  constructor(private repo = new InscripcionRepository()) {}

  async getInscripcionesForUser(userId: string, role: string) {
    if (role === 'admin') {
      return this.repo.findAll();
    }
    if (role === 'docente') {
      return this.repo.findByDocenteMaterias(userId);
    }
    if (role === 'estudiante') {
      return this.repo.findByEstudianteId(userId);
    }
    throw ApiError.Forbidden('Invalid or unauthorized role context');
  }

  async enrollEstudiante(userId: string, role: string, dto: CreateInscripcionDto) {
    if (role !== 'estudiante') {
      throw ApiError.Forbidden('Only students can enroll in classes');
    }

    const materiaExists = await this.repo.checkMateriaExists(dto.materia_id);
    if (!materiaExists) {
      throw ApiError.NotFound('The requested class (materia) does not exist');
    }

    const existing = await this.repo.findExisting(userId, dto.materia_id);
    if (existing) {
      throw ApiError.Conflict('You are already enrolled in this class');
    }

    return this.repo.create(userId, dto);
  }

  async unenrollEstudiante(id: string, userId: string, role: string) {
    const record = await this.repo.findById(id);
    if (!record) {
      throw ApiError.NotFound('Enrollment record not found');
    }

    // RBAC + Ownership verification
    if (role !== 'admin' && record.estudiante_id !== userId) {
      throw ApiError.Forbidden('You do not have permission to delete this enrollment');
    }

    return this.repo.delete(id);
  }
}
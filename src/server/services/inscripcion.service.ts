import { InscripcionRepository } from '../repositories/inscripcion.repository';
import { CreateInscripcionDto } from '../schemas/inscripcion.schema';
import { forbidden, notFound, conflict } from '@/server/lib/api-error';

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
    throw forbidden('Invalid or unauthorized role context');
  }

  async enrollEstudiante(userId: string, role: string, dto: CreateInscripcionDto) {
    if (role !== 'estudiante') {
      throw forbidden('Only students can enroll in classes');
    }

    const materiaExists = await this.repo.checkMateriaExists(dto.materia_id);
    if (!materiaExists) {
      throw notFound('The requested class (materia) does not exist');
    }

    const existing = await this.repo.findExisting(userId, dto.materia_id);
    if (existing) {
      throw conflict('You are already enrolled in this class');
    }

    return this.repo.create(userId, dto);
  }

  async unenrollEstudiante(id: string, userId: string, role: string) {
    const record = await this.repo.findById(id);
    if (!record) {
      throw notFound('Enrollment record not found');
    }

    // RBAC + Ownership verification
    if (role !== 'admin' && record.estudiante_id !== userId) {
      throw forbidden('You do not have permission to delete this enrollment');
    }

    return this.repo.delete(id);
  }
}
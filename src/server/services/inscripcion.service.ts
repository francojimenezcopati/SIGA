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
    throw forbidden('Rol no válido o sin permisos para esta operación');
  }

  async enrollEstudiante(userId: string, role: string, dto: CreateInscripcionDto) {
    if (role !== 'estudiante') {
      throw forbidden('Solo los estudiantes pueden inscribirse a materias');
    }

    const materiaExists = await this.repo.checkMateriaExists(dto.materia_id);
    if (!materiaExists) {
      throw notFound('La materia solicitada no existe');
    }

    const existing = await this.repo.findExisting(userId, dto.materia_id);
    if (existing) {
      throw conflict('Ya estás inscripto en esta materia');
    }

    return this.repo.create(userId, dto);
  }

  async unenrollEstudiante(id: string, userId: string, role: string) {
    const record = await this.repo.findById(id);
    if (!record) {
      throw notFound('La inscripción no fue encontrada');
    }

    // Verificación de RBAC y ownership
    if (role !== 'admin' && record.estudiante_id !== userId) {
      throw forbidden('No tenés permiso para eliminar esta inscripción');
    }

    return this.repo.delete(id);
  }
}
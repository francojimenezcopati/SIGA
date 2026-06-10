import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InscripcionService } from '../../server/services/inscripcion.service';
import { InscripcionRepository } from '../../server/repositories/inscripcion.repository';
import { ApiError } from '../../server/lib/api-error';

vi.mock('../../server/repositories/inscripcion.repository');

describe('InscripcionService', () => {
  let service: InscripcionService;
  let mockRepo: vi.Mocked<InscripcionRepository>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = new InscripcionRepository() as vi.Mocked<InscripcionRepository>;
    service = new InscripcionService(mockRepo);
  });

  describe('getInscripcionesForUser', () => {
    it('should route to findAll for admins', async () => {
      mockRepo.findAll.mockResolvedValueOnce([{ id: '1' }]);
      const res = await service.getInscripcionesForUser('user-id', 'admin');
      expect(mockRepo.findAll).toHaveBeenCalled();
      expect(res).toEqual([{ id: '1' }]);
    });

    it('should route to findByEstudianteId for students', async () => {
      mockRepo.findByEstudianteId.mockResolvedValueOnce([{ id: '2' }]);
      const res = await service.getInscripcionesForUser('user-id', 'estudiante');
      expect(mockRepo.findByEstudianteId).toHaveBeenCalledWith('user-id');
      expect(res).toEqual([{ id: '2' }]);
    });
  });

  describe('enrollEstudiante', () => {
    it('should throw an error if role is not estudiante', async () => {
      await expect(
        service.enrollEstudiante('user-id', 'docente', { materia_id: 'materia-id' })
      ).rejects.toThrow(ApiError);
    });

    it('should throw a NotFound error if the materia does not exist', async () => {
      mockRepo.checkMateriaExists.mockResolvedValueOnce(false);
      await expect(
        service.enrollEstudiante('user-id', 'estudiante', { materia_id: 'materia-id' })
      ).rejects.toThrow(ApiError);
    });

    it('should throw a Conflict error if enrollment already exists', async () => {
      mockRepo.checkMateriaExists.mockResolvedValueOnce(true);
      mockRepo.findExisting.mockResolvedValueOnce({ id: 'existing-id' });
      
      await expect(
        service.enrollEstudiante('user-id', 'estudiante', { materia_id: 'materia-id' })
      ).rejects.toThrow(ApiError);
    });

    it('should successfully create enrollment if validations pass', async () => {
      mockRepo.checkMateriaExists.mockResolvedValueOnce(true);
      mockRepo.findExisting.mockResolvedValueOnce(null);
      mockRepo.create.mockResolvedValueOnce({ id: 'new-id', estudiante_id: 'user-id', materia_id: 'materia-id' });

      const res = await service.enrollEstudiante('user-id', 'estudiante', { materia_id: 'materia-id' });
      expect(res.id).toBe('new-id');
    });
  });

  describe('unenrollEstudiante', () => {
    it('should throw Forbidden if a student attempts to delete another student\'s enrollment', async () => {
      mockRepo.findById.mockResolvedValueOnce({ id: 'enr-id', estudiante_id: 'other-user-id' });
      
      await expect(
        service.unenrollEstudiante('enr-id', 'my-user-id', 'estudiante')
      ).rejects.toThrow(ApiError);
    });

    it('should allow deletion if the user is an admin regardless of ownership', async () => {
      mockRepo.findById.mockResolvedValueOnce({ id: 'enr-id', estudiante_id: 'other-user-id' });
      mockRepo.delete.mockResolvedValueOnce(true);

      const res = await service.unenrollEstudiante('enr-id', 'admin-id', 'admin');
      expect(res).toBe(true);
      expect(mockRepo.delete).toHaveBeenCalledWith('enr-id');
    });
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTps, createTp, getEntregas, createEntrega } from './tp.service';
import * as repo from '../repositories/tp.repository';
import { ApiError } from '../lib/api-error';

vi.mock('../repositories/tp.repository');

describe('TpService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTp', () => {
    it('should throw forbidden if user is a student', async () => {
      const mockSupabase = {} as any;
      const auth = { userId: 'student-id', email: 's@siga.edu', role: 'estudiante' } as any;
      const input = { materia_id: 'materia-id', titulo: 'TP 1' };

      await expect(createTp(mockSupabase, input, auth)).rejects.toThrow(ApiError);
    });

    it('should allow admin to create TP without checking ownership', async () => {
      const mockSupabase = {} as any;
      const auth = { userId: 'admin-id', email: 'admin@siga.edu', role: 'administrador' } as any;
      const input = { materia_id: 'materia-id', titulo: 'TP 1', descripcion: 'Consigna' };

      const mockTp = { id: 'tp-id', ...input };
      vi.mocked(repo.createTp).mockResolvedValueOnce(mockTp as any);

      const res = await createTp(mockSupabase, input, auth);
      expect(res).toEqual(mockTp);
      expect(repo.createTp).toHaveBeenCalled();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { InscripcionController } from '@/server/controllers/inscripcion.controller';

vi.mock('@/server/controllers/inscripcion.controller', () => {
  return {
    InscripcionController: vi.fn().mockImplementation(() => ({
      getAll: vi.fn().mockResolvedValue(new Response(JSON.stringify([{ id: '1' }]), { status: 200 })),
      create: vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 201 })),
    })),
  };
});

describe('Inscripciones Router Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call controller.getAll when GET route handler is triggered', async () => {
    const request = new NextRequest('http://localhost/api/inscripciones');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual([{ id: '1' }]);
  });

  it('should call controller.create when POST route handler is triggered', async () => {
    const request = new NextRequest('http://localhost/api/inscripciones', {
      method: 'POST',
      body: JSON.stringify({ materia_id: 'some-uuid' }),
    });
    const response = await POST(request);

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});
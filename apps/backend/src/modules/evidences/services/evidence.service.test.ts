import { describe, it, expect, beforeEach } from 'vitest';
import { EvidenceService } from './evidence.service';

const asignacion_id = 'asig1';
const estudiante_id = 'est1';
const evidenciaBase = {
  asignacion_id,
  archivo: 'foto1.jpg',
  fecha: '2024-06-01',
  hora: '10:00',
  ubicacion: 'Iglesia Central',
  subido_por: estudiante_id
};

describe('EvidenceService', () => {
  let service: EvidenceService;

  beforeEach(() => {
    service = new EvidenceService();
  });

  it('debería crear evidencia válida JPG', () => {
    const ev = service.create({ ...evidenciaBase } as any);
    expect(ev).toHaveProperty('id');
    expect(ev.estado).toBe('PENDIENTE');
  });

  it('debería crear evidencia correctamente', () => {
    const ev2 = service.create({ ...evidenciaBase, archivo: 'foto2.jpg' });
    expect(ev2).toHaveProperty('id');
    expect(ev2.estado).toBe('PENDIENTE');
  });

  it('debería validar datos de entrada', () => {
    expect(() => service.create({ ...evidenciaBase, archivo: '' } as any)).toThrow();
  });

  it('permite actualizar estado a APROBADA o RECHAZADA', () => {
    const ev = service.create({ ...evidenciaBase } as any);
    const aprobada = service.updateStatus(ev.id, { status: 'APROBADA' } as any);
    expect((aprobada as any).status).toBe('APROBADA');
    const rechazada = service.updateStatus(ev.id, { status: 'RECHAZADA' } as any);
    expect((rechazada as any).status).toBe('RECHAZADA');
  });

  it('debería listar evidencias por asignación', () => {
    service.create({ ...evidenciaBase } as any);
    const list = service.findByAssignment(asignacion_id);
    expect(list.length).toBeGreaterThan(0);
  });

  it('simula sincronización offline', () => {
    const ev = service.create({ ...evidenciaBase });
    const sync = service.syncEvidence(ev.id);
    expect(sync).toHaveProperty('sincronizado', true);
  });
});
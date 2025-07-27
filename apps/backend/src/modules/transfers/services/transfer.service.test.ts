import { describe, it, expect, beforeEach } from 'vitest';
import { TransferService } from './transfer.service';

const asignacion_id = 'asig1';
const centro_anterior_id = 'centro1';
const centro_nuevo_id = 'centro2';
const motivo = 'Cambio de residencia';
const usuario_responsable = 'coord1';
const fecha = new Date('2024-02-01');

describe('TransferService', () => {
  let service: TransferService;

  beforeEach(() => {
    service = new TransferService();
  });

  it('debería registrar un traslado', () => {
    const transfer = service.create({ asignacion_id, centro_nuevo_id, motivo, usuario_responsable, fecha });
    expect(transfer).toHaveProperty('id');
    expect(transfer.asignacion_id).toBe(asignacion_id);
    expect(transfer.centro_nuevo_id).toBe(centro_nuevo_id);
    expect(transfer.motivo).toBe(motivo);
  });

  it('debería actualizar el motivo del traslado', () => {
    const transfer = service.create({ asignacion_id, centro_nuevo_id, motivo, usuario_responsable, fecha });
    const updated = service.update(transfer.id, { motivo: 'Motivo actualizado' });
    expect(updated.motivo).toBe('Motivo actualizado');
  });

  it('debería listar traslados por asignación', () => {
    service.create({ asignacion_id, centro_nuevo_id, motivo, usuario_responsable, fecha });
    const list = service.findByAssignment(asignacion_id);
    expect(Array.isArray(list)).toBe(true);
    expect(list[0].asignacion_id).toBe(asignacion_id);
  });
});
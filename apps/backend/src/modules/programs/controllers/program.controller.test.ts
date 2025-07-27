import { describe, it, expect } from 'vitest';
import { ProgramController } from './program.controller';

describe('ProgramController', () => {
  it('should be defined', () => {
    const controller = new ProgramController({} as any);
    expect(controller).toBeDefined();
  });
  // TODO: Add tests for CRUD and programId validation
});
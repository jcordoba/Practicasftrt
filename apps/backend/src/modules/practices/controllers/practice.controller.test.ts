import { describe, it, expect } from 'vitest';
import { PracticeController } from './practice.controller';

describe('PracticeController', () => {
  it('should be defined', () => {
    const controller = new PracticeController({} as any);
    expect(controller).toBeDefined();
  });
  // TODO: Add tests for CRUD and programId validation
});
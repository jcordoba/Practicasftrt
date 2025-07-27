import { describe, it, expect } from 'vitest';
import { PublicController } from './public.controller';
import { PublicService } from '../services/public.service';

describe('PublicController', () => {
  it('should be defined', () => {
    const publicService = new PublicService();
    const controller = new PublicController(publicService);
    expect(controller).toBeDefined();
  });
  // TODO: Add tests for GET /api/public/assignments, students, practices with and without programId
});
import { describe, it, expect } from 'vitest';
import { PublicService } from './public.service';

describe('PublicService', () => {
  it('should be defined', () => {
    const service = new PublicService();
    expect(service).toBeDefined();
  });
});
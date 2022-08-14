import { Test, TestingModule } from '@nestjs/testing';
import { SociosService } from './socios.service';

describe('SociosService', () => {
  let service: SociosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SociosService],
    }).compile();

    service = module.get<SociosService>(SociosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

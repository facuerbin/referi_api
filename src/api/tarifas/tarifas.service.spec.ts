import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tarifa } from './entities/tarifa.entity';
import { TarifasService } from './tarifas.service';

describe('TarifasService', () => {
  let service: TarifasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarifasService,
        {
          provide: getRepositoryToken(Tarifa),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TarifasService>(TarifasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

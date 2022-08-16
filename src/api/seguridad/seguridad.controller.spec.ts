import { Test, TestingModule } from '@nestjs/testing';
import { SeguridadController } from './seguridad.controller';
import { SeguridadService } from './seguridad.service';

describe('SegyrudadController', () => {
  let controller: SeguridadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeguridadController],
      providers: [SeguridadService],
    }).compile();

    controller = module.get<SeguridadController>(SeguridadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

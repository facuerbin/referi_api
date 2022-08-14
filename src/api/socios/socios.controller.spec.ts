import { Test, TestingModule } from '@nestjs/testing';
import { SociosController } from './socios.controller';
import { SociosService } from './socios.service';

describe('SociosController', () => {
  let controller: SociosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SociosController],
      providers: [SociosService],
    }).compile();

    controller = module.get<SociosController>(SociosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

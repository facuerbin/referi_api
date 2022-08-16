import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';

describe('UsuariosService', () => {
  let service: UsuariosService;
  const repository = Repository<Usuario>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosService],
    })
      .overrideProvider(getRepositoryToken(Usuario))
      .useValue(jest.fn())
      .compile();

    service = await module.resolve<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

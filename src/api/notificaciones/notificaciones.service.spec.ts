import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificacionesService } from './notificaciones.service';
import { Notificacion, TipoDestinatario, TipoRemitente } from './entities/notificacion.entity';
import { NotificacionUsuario } from './entities/notificaciones.usuario.entity';
import { OrganizacionesService } from '../organizaciones/organizaciones.service';
import { SociosService } from '../socios/socios.service';
import { UsuariosService } from '../usuarios/usuarios.service';

describe('NotificacionesService', () => {
  let service: NotificacionesService;
  let notifRepo: { save: jest.Mock; findOne: jest.Mock };
  let notifUserRepo: { save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let orgService: jest.Mocked<OrganizacionesService>;
  let sociosService: jest.Mocked<SociosService>;
  let usuariosService: jest.Mocked<UsuariosService>;

  const mockRemitente = { id: 'org-1', nombre: 'Club Deportivo' } as any;
  const baseDto = {
    idRemitente: 'org-1',
    tipoRemitente: TipoRemitente.ORGANIZACION,
    tipoDestinatario: TipoDestinatario.SOCIOS,
    titulo: 'Test',
    cuerpo: 'Cuerpo de prueba',
    idDestinatario: 'dest-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        {
          provide: getRepositoryToken(Notificacion),
          useValue: { save: jest.fn(), findOne: jest.fn(), find: jest.fn() },
        },
        {
          provide: getRepositoryToken(NotificacionUsuario),
          useValue: { save: jest.fn(), find: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: OrganizacionesService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: SociosService,
          useValue: {
            findByOrg: jest.fn(),
            findDeudoresByOrg: jest.fn(),
            findByActividad: jest.fn(),
            findByTurnoActividad: jest.fn(),
          },
        },
        {
          provide: UsuariosService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<NotificacionesService>(NotificacionesService);
    notifRepo = module.get(getRepositoryToken(Notificacion));
    notifUserRepo = module.get(getRepositoryToken(NotificacionUsuario));
    orgService = module.get(OrganizacionesService);
    sociosService = module.get(SociosService);
    usuariosService = module.get(UsuariosService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('enviarNotificacionSocios', () => {
    it('saves notification with TipoDestinatario.SOCIOS', async () => {
      orgService.findOne.mockResolvedValue(mockRemitente);
      sociosService.findByOrg.mockResolvedValue([{ usuario: { id: 'u-1' } }] as any);
      notifRepo.save.mockResolvedValue({ id: 'notif-1' });

      await service.enviarNotificacionSocios(baseDto);

      const saved = notifRepo.save.mock.calls[0][0];
      expect(saved.tipoDestinatario).toBe(TipoDestinatario.SOCIOS);
    });
  });

  describe('enviarNotificacionDeudores', () => {
    it('saves notification with TipoDestinatario.DEUDORES', async () => {
      orgService.findOne.mockResolvedValue(mockRemitente);
      sociosService.findDeudoresByOrg.mockResolvedValue([{ usuario: { id: 'u-1' } }] as any);
      notifRepo.save.mockResolvedValue({ id: 'notif-1', destinatarios: [] });

      await service.enviarNotificacionDeudores(baseDto);

      const saved = notifRepo.save.mock.calls[0][0];
      expect(saved.tipoDestinatario).toBe(TipoDestinatario.DEUDORES);
    });
  });

  describe('enviarNotificacionActividad', () => {
    it('saves notification with TipoDestinatario.ACTIVIDAD', async () => {
      orgService.findOne.mockResolvedValue(mockRemitente);
      sociosService.findByActividad.mockResolvedValue([{ usuario: { id: 'u-1' } }] as any);
      notifRepo.save.mockResolvedValue({ id: 'notif-1' });

      await service.enviarNotificacionActividad(baseDto);

      const saved = notifRepo.save.mock.calls[0][0];
      expect(saved.tipoDestinatario).toBe(TipoDestinatario.ACTIVIDAD);
    });

    it('returns an error when idDestinatario is missing', async () => {
      const result = await service.enviarNotificacionActividad({ ...baseDto, idDestinatario: undefined });
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('enviarNotificacionTurnoActividad', () => {
    it('saves notification with TipoDestinatario.TURNO_ACTIVIDAD', async () => {
      orgService.findOne.mockResolvedValue(mockRemitente);
      sociosService.findByTurnoActividad.mockResolvedValue([{ usuario: { id: 'u-1' } }] as any);
      notifRepo.save.mockResolvedValue({ id: 'notif-1' });

      await service.enviarNotificacionTurnoActividad(baseDto);

      const saved = notifRepo.save.mock.calls[0][0];
      expect(saved.tipoDestinatario).toBe(TipoDestinatario.TURNO_ACTIVIDAD);
    });

    it('returns an error when idDestinatario is missing', async () => {
      const result = await service.enviarNotificacionTurnoActividad({ ...baseDto, idDestinatario: undefined });
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('enviarNotificacionSocio', () => {
    it('saves notification with TipoDestinatario.SOCIO', async () => {
      orgService.findOne.mockResolvedValue(mockRemitente);
      usuariosService.findOne.mockResolvedValue({ id: 'u-1' } as any);
      notifRepo.save.mockResolvedValue({ id: 'notif-1' });

      await service.enviarNotificacionSocio(baseDto);

      const saved = notifRepo.save.mock.calls[0][0];
      expect(saved.tipoDestinatario).toBe(TipoDestinatario.SOCIO);
    });

    it('returns an error when idDestinatario is missing', async () => {
      const result = await service.enviarNotificacionSocio({ ...baseDto, idDestinatario: undefined });
      expect(result).toBeInstanceOf(Error);
    });
  });

  describe('readNotification', () => {
    it('sets fechaLectura and saves the notification', async () => {
      const mockUserNotif = { id: 'un-1', notificacion: {}, fechaLectura: null } as any;
      notifUserRepo.findOne.mockResolvedValue(mockUserNotif);
      notifUserRepo.save.mockResolvedValue({ ...mockUserNotif, fechaLectura: new Date() });

      await service.readNotification('un-1');

      expect(notifUserRepo.save).toHaveBeenCalled();
      const saved = notifUserRepo.save.mock.calls[0][0];
      expect(saved.fechaLectura).toBeInstanceOf(Date);
    });
  });
});

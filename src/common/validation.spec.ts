import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { UpdateUsuarioDto } from '../api/usuarios/dto/update.usuario.dto';
import { EnviarNotificacionDto } from '../api/notificaciones/dto/enviar.notificacion.dto';
import { VerifyEmailDto } from '../api/seguridad/dto/verify.email.dto';
import { RegistrarPagoDto } from '../api/pagos/dto/registrar.pago.dto';
import { LoginDto } from '../api/seguridad/dto/login.dto';

// Mirrors main.ts, so these assertions describe what the running API does.
const pipe = new ValidationPipe({ whitelist: true, transform: true });
const metaFor = (metatype): ArgumentMetadata => ({ type: 'body', metatype });

const uuid = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
const otherUuid = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

describe('global ValidationPipe', () => {
  it('strips properties the DTO does not declare', async () => {
    const result = await pipe.transform(
      {
        nombre: 'Ana',
        password: 'should-not-get-through',
        verificado: true,
        dni: 99999999,
        fechaBaja: null,
      },
      metaFor(UpdateUsuarioDto),
    );

    expect(result).toEqual({ nombre: 'Ana' });
  });

  it('strips an incoming domicilio id, so the write cannot be redirected', async () => {
    const result = await pipe.transform(
      { domicilio: { id: otherUuid, calle: 'Corrientes', numero: 1234 } },
      metaFor(UpdateUsuarioDto),
    );

    expect(result.domicilio).not.toHaveProperty('id');
    expect(result.domicilio.calle).toBe('Corrientes');
  });

  it('coerces a numeric string from an HTML form into a number', async () => {
    const result = await pipe.transform(
      { domicilio: { numero: '1234' } },
      metaFor(UpdateUsuarioDto),
    );

    expect(result.domicilio.numero).toBe(1234);
  });

  it('rejects a malformed email', async () => {
    await expect(
      pipe.transform({ email: 'not-an-email' }, metaFor(UpdateUsuarioDto)),
    ).rejects.toThrow();
  });

  it('accepts the empty idDestinatario the panel sends for Socios/Deudores', async () => {
    const result = await pipe.transform(
      {
        idRemitente: uuid,
        tipoRemitente: 'Organizacion',
        idDestinatario: '',
        tipoDestinatario: 'Socios',
        titulo: 'Aviso',
        cuerpo: 'Cuerpo',
      },
      metaFor(EnviarNotificacionDto),
    );

    expect(result.idDestinatario).toBe('');
  });

  it('rejects a recipient type outside the enum', async () => {
    await expect(
      pipe.transform(
        {
          idRemitente: uuid,
          tipoRemitente: 'Organizacion',
          tipoDestinatario: 'Cualquiera',
          titulo: 'Aviso',
          cuerpo: 'Cuerpo',
        },
        metaFor(EnviarNotificacionDto),
      ),
    ).rejects.toThrow();
  });

  it('keeps the verification code numeric, as both clients send it', async () => {
    const result = await pipe.transform(
      { email: 'a@b.com', code: 123456 },
      metaFor(VerifyEmailDto),
    );

    expect(result.code).toBe(123456);
  });

  it('rejects a payment method outside MedioDePago', async () => {
    await expect(
      pipe.transform(
        { medioDePago: 'TRANSFERENCIA', idsCuota: [uuid] },
        metaFor(RegistrarPagoDto),
      ),
    ).rejects.toThrow();
  });

  it('rejects an empty cuota list', async () => {
    await expect(
      pipe.transform(
        { medioDePago: 'EFECTIVO', idsCuota: [] },
        metaFor(RegistrarPagoDto),
      ),
    ).rejects.toThrow();
  });

  it('still enforces the login password length bounds', async () => {
    await expect(
      pipe.transform(
        { email: 'a@b.com', password: 'short' },
        metaFor(LoginDto),
      ),
    ).rejects.toThrow();
  });
});

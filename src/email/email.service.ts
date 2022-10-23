import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import nodemailer = require('nodemailer');
import nodemailerSendgrid = require('nodemailer-sendgrid');
import { Usuario } from 'src/api/usuarios/entities/usuario.entity';
import { config } from 'src/config/config';
import * as CacheManager from 'cache-manager';
import { UsuariosService } from 'src/api/usuarios/usuarios.service';

@Injectable()
export class EmailService {
  transport = nodemailer.createTransport(
    nodemailerSendgrid({
      apiKey: config.MAIL_API_KEY,
    }),
  );

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: CacheManager.Cache,
    private userService: UsuariosService,
  ) {}

  sendConfirmationEmail(user: Usuario) {
    const rand = this.generateConfirmationNumber(user.id);
    const content = `<h1>¡Bienvenido a Referí!</h1>
    Su código de verificación es ${rand}`;
    return this.transport
      .sendMail({
        from: 'no-reply@referiapp.com.ar',
        to: `${user.nombre} ${user.apellido} facuerbin@gmail.com`,
        subject: 'Código de confirmación - Referí',
        html: content,
      })
      .then(async () => {
        Logger.log('Email sent to user ' + user.id);
        return true;
      })
      .catch((error) => {
        Logger.error('Failed to send email to user ' + user.id);
        Logger.error(error);
        return false;
      });
  }

  generateConfirmationNumber(userId: string) {
    const rand = Math.floor(Math.random() * 9999);
    this.cacheManager.set<validateCache>(
      userId,
      { number: rand, attemps: 0 },
      300000,
    );
    return rand;
  }

  async validateConfirmationNumber(userId: string, validationNumber: string) {
    const cached = await this.cacheManager.get<validateCache>(userId);
    console.log('Cached', cached);
    if ('' + cached.number === validationNumber) {
      this.userService.verifyEmail(userId);
      return true;
    }

    cached.attemps++;
    if (cached.attemps <= 3) {
      this.cacheManager.set<validateCache>(userId, cached);
    } else {
      this.cacheManager.del(userId);
    }
    return false;
  }
}

export interface validateCache {
  number: number;
  attemps: number;
}

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path
    .resolve(__dirname, `${process.env.NODE_ENV}.env`)
    .replace('dist', 'src'),
});

export const config: Iconfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',

  HOST: process.env.HOST || 'localhost',
  PORT: Number(process.env.PORT) || 3000,

  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 5433,
  DB_NAME: process.env.DB_NAME || 'referi_dev',
  DB_USER_NAME: process.env.DB_USER_NAME || 'postgres',
  DB_USER_PASSWORD: process.env.DB_USER_PASSWORD || 'toor',

  JWT_SECRET: process.env.JWT_SECRET || 'somethingSecret',
  MAIL_API_KEY: process.env.MAIL_API_KEY || '',
  // When set, all emails are redirected to this address instead of the real recipient (debug only)
  DEBUG_EMAIL: process.env.DEBUG_EMAIL || '',
  // When true, no emails are sent — verification codes are printed to the console instead
  SKIP_EMAIL: process.env.SKIP_EMAIL === 'true',

  API_DOC_USER: process.env.API_DOC_USER || 'referiapp',
  API_DOC_PASS: process.env.API_DOC_PASS || 'SOMEPASSWORD',

  // Used only by `npm run seed` to create/update the admin login (see admin.controller.ts).
  // Leave unset to skip admin seeding.
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
};

export interface Iconfig {
  NODE_ENV: string;

  HOST: string;
  PORT: number;

  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER_NAME: string;
  DB_USER_PASSWORD: string;
  JWT_SECRET: string;
  MAIL_API_KEY: string;
  DEBUG_EMAIL: string;
  SKIP_EMAIL: boolean;

  API_DOC_USER: string;
  API_DOC_PASS: string;

  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}

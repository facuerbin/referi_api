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
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_NAME: process.env.DB_NAME || 'referi_dev',
  DB_USER_NAME: process.env.DB_USER_NAME || 'root',
  DB_USER_PASSWORD: process.env.DB_USER_PASSWORD || 'toor',

  JWT_SECRET: process.env.JWT_SECRET || 'somethingSecret',
  MAIL_API_KEY: process.env.MAIL_API_KEY || '',

  API_DOC_PASS: process.env.API_DOC_PASS || 'SOMEPASSWORD',
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

  API_DOC_PASS: string;
}

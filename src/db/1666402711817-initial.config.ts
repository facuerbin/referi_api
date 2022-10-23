import { MigrationInterface, QueryRunner } from 'typeorm';

export class initialConfig1666402711817 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('Migration');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Down Migration');
  }
}

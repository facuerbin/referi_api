import { EstadoActividad } from 'src/api/actividades/entities/estado.actividad.entity';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedEstadoActividad implements MigrationInterface {
  name = 'SeedEstadoActividad' + Date.now();

  public async up(queryRunner: QueryRunner): Promise<void> {
    const estado = await queryRunner.manager.save(
      queryRunner.manager.create<EstadoActividad>(EstadoActividad, [
        { estado: 'ACTIVO' },
        { estado: 'SIN CUPO' },
        { estado: 'FINALIZADA' },
      ]),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE * FROM estado_actividad`);
  }
}

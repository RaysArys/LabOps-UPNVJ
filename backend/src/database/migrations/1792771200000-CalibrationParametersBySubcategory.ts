import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalibrationParametersBySubcategory1792771200000
  implements MigrationInterface
{
  name = 'CalibrationParametersBySubcategory1792771200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "calibration_parameters" DROP CONSTRAINT "UQ_calibration_parameters_category_code"',
    );
    await queryRunner.query(
      'DROP INDEX "IDX_calibration_parameters_category_active"',
    );
    await queryRunner.query(
      'ALTER TABLE "calibration_parameters" ADD "subkategori_aset" character varying(160)',
    );
    await queryRunner.query(`
      ALTER TABLE "calibration_parameters"
      ALTER COLUMN "kategori_aset" TYPE "public"."assets_kategori_enum"
      USING "kategori_aset"::"public"."assets_kategori_enum"
    `);
    await queryRunner.query(`
      UPDATE "calibration_parameters"
      SET "subkategori_aset" = 'Server Unit'
      WHERE "kategori_aset" = 'server_pc' AND "kode" = 'memory_idle'
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_calibration_parameters_category_subcategory_code"
      ON "calibration_parameters" ("kategori_aset", "subkategori_aset", "kode")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_calibration_parameters_legacy_category_code"
      ON "calibration_parameters" ("kategori_aset", "kode")
      WHERE "subkategori_aset" IS NULL
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_calibration_parameters_category_active" ON "calibration_parameters" ("kategori_aset", "aktif")',
    );
    await queryRunner.query(`
      ALTER TABLE "calibration_parameters"
      ADD CONSTRAINT "FK_calibration_parameters_asset_subcategory"
      FOREIGN KEY ("kategori_aset", "subkategori_aset")
      REFERENCES "asset_subcategories" ("kategori", "nama_subkategori")
      ON UPDATE CASCADE ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "calibration_parameters" DROP CONSTRAINT "FK_calibration_parameters_asset_subcategory"',
    );
    await queryRunner.query(
      'DROP INDEX "UQ_calibration_parameters_legacy_category_code"',
    );
    await queryRunner.query(
      'DROP INDEX "IDX_calibration_parameters_category_subcategory_code"',
    );
    await queryRunner.query(
      'DROP INDEX "IDX_calibration_parameters_category_active"',
    );
    await queryRunner.query(
      'ALTER TABLE "calibration_parameters" ALTER COLUMN "kategori_aset" TYPE character varying USING "kategori_aset"::text',
    );
    await queryRunner.query(
      'ALTER TABLE "calibration_parameters" DROP COLUMN "subkategori_aset"',
    );
    await queryRunner.query(`
      ALTER TABLE "calibration_parameters"
      ADD CONSTRAINT "UQ_calibration_parameters_category_code"
      UNIQUE ("kategori_aset", "kode")
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_calibration_parameters_category_active" ON "calibration_parameters" ("kategori_aset", "aktif")',
    );
  }
}

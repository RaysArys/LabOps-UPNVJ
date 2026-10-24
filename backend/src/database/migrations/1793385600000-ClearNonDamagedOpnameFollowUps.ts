import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClearNonDamagedOpnameFollowUps1793385600000 implements MigrationInterface {
  name = 'ClearNonDamagedOpnameFollowUps1793385600000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "stock_opname_records"
       SET "status_tindak_lanjut" = NULL,
           "pic_tindak_lanjut" = NULL,
           "target_selesai" = NULL
       WHERE "kondisi_fisik" <> 'rusak'
         AND "status_tindak_lanjut" IS NOT NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "stock_opname_records"
       SET "status_tindak_lanjut" = 'open'
       WHERE "kondisi_fisik" <> 'rusak'
         AND "status_tindak_lanjut" IS NULL
         AND "status_temuan" <> 'sesuai'`,
    );
  }
}
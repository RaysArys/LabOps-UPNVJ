import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeactivateInvalidServerPcSubcategory1793299200000 implements MigrationInterface {
  name = 'DeactivateInvalidServerPcSubcategory1793299200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "asset_subcategories"
       SET "aktif" = false
       WHERE "kategori" = 'server_pc'
         AND LOWER(BTRIM("nama_subkategori")) = 'dwadwa'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "asset_subcategories"
       SET "aktif" = true
       WHERE "kategori" = 'server_pc'
         AND LOWER(BTRIM("nama_subkategori")) = 'dwadwa'`,
    );
  }
}
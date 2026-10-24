import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteClosedOpnameWorkOrders1793030400000
  implements MigrationInterface
{
  name = 'CompleteClosedOpnameWorkOrders1793030400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "stock_opname_records" AS record
      SET "status_tindak_lanjut" = 'selesai'
      FROM "work_orders" AS wo
      WHERE record."work_order_id" = wo."wo_id"::varchar
        AND wo."status_tiket" = 'closed'
        AND record."status_tindak_lanjut" IS NOT NULL
        AND record."status_tindak_lanjut" <> 'selesai'
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Completed follow-ups must not be reopened during rollback.
  }
}

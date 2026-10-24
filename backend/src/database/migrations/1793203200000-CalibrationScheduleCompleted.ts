import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalibrationScheduleCompleted1793203200000 implements MigrationInterface {
  name = 'CalibrationScheduleCompleted1793203200000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."calibration_schedules_status_kalibrasi_enum" ADD VALUE IF NOT EXISTS 'menunggu_persetujuan'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."calibration_schedules_status_kalibrasi_enum" ADD VALUE IF NOT EXISTS 'selesai'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "calibration_schedules" SET "status_kalibrasi" = 'dijadwalkan' WHERE "status_kalibrasi" IN ('selesai', 'menunggu_persetujuan')`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."calibration_schedules_status_kalibrasi_enum" RENAME TO "calibration_schedules_status_kalibrasi_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."calibration_schedules_status_kalibrasi_enum" AS ENUM('dijadwalkan', 'akan_jatuh_tempo', 'overdue', 'menunggu_perbaikan')`,
    );
    await queryRunner.query(
      `ALTER TABLE "calibration_schedules" ALTER COLUMN "status_kalibrasi" TYPE "public"."calibration_schedules_status_kalibrasi_enum" USING "status_kalibrasi"::"text"::"public"."calibration_schedules_status_kalibrasi_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."calibration_schedules_status_kalibrasi_enum_old"`,
    );
  }
}
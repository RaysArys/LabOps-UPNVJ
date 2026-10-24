import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssetSubcategories1792684800000 implements MigrationInterface {
  name = 'AssetSubcategories1792684800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "asset_subcategories" (
        "subcategory_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "kategori" "public"."assets_kategori_enum" NOT NULL,
        "nama_subkategori" character varying(160) NOT NULL,
        "aktif" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_asset_subcategories" PRIMARY KEY ("subcategory_id"),
        CONSTRAINT "UQ_asset_subcategories_kategori_nama"
          UNIQUE ("kategori", "nama_subkategori")
      )
    `);

    await queryRunner.query(`
      UPDATE "assets"
      SET "subkategori" = btrim("subkategori")
      WHERE "subkategori" IS NOT NULL AND "subkategori" <> btrim("subkategori")
    `);

    await queryRunner.query(`
      INSERT INTO "asset_subcategories" ("kategori", "nama_subkategori")
      VALUES
        ('alat_ukur', 'Multimeter & Tang Ampere'),
        ('alat_ukur', 'Oscilloscope & Signal Generator'),
        ('alat_ukur', 'Network & Cable Tester'),
        ('alat_ukur', 'Thermometer & Environment Tester'),
        ('jaringan', 'Router & Switch'),
        ('jaringan', 'Access Point & Wireless'),
        ('jaringan', 'Patch Panel & Rack Server'),
        ('jaringan', 'Kabel & Konektor (LAN/Fiber)'),
        ('server_pc', 'Server Unit'),
        ('server_pc', 'PC Desktop / Workstation'),
        ('server_pc', 'Laptop'),
        ('server_pc', 'Monitor & Peripherals'),
        ('iot_embedded', 'Development Board (Arduino, ESP32, RasPi)'),
        ('iot_embedded', 'Sensor & Modul'),
        ('iot_embedded', 'Actuator & Motor'),
        ('iot_embedded', 'Breadboard & Accessories'),
        ('kelistrikan_ups', 'UPS & Baterai'),
        ('kelistrikan_ups', 'Power Supply Unit (PSU)'),
        ('kelistrikan_ups', 'Stop Kontak & PDU'),
        ('kelistrikan_ups', 'Pipa, Cable Duct & Aksesoris Listrik'),
        ('audio_visual', 'Proyektor & Layar'),
        ('audio_visual', 'Kamera & Webcam'),
        ('audio_visual', 'Speaker & Microphone'),
        ('audio_visual', 'Converter & Kabel Display (HDMI/VGA/DP)'),
        ('sparepart_bhp', 'Komponen Elektronika (Resistor, Kapasitor, IC)'),
        ('sparepart_bhp', 'Timah, Solder & Flux'),
        ('sparepart_bhp', 'Baut, Mur & Spacer'),
        ('sparepart_bhp', 'Cable Tie & Isolasi / Heatshrink')
      ON CONFLICT ("kategori", "nama_subkategori") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "asset_subcategories" ("kategori", "nama_subkategori")
      SELECT DISTINCT "kategori", btrim("subkategori")
      FROM "assets"
      WHERE "subkategori" IS NOT NULL AND btrim("subkategori") <> ''
      ON CONFLICT ("kategori", "nama_subkategori") DO NOTHING
    `);

    await queryRunner.query(`
      ALTER TABLE "assets"
      ADD CONSTRAINT "FK_assets_asset_subcategories"
      FOREIGN KEY ("kategori", "subkategori")
      REFERENCES "asset_subcategories" ("kategori", "nama_subkategori")
      ON UPDATE CASCADE ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "assets" DROP CONSTRAINT "FK_assets_asset_subcategories"',
    );
    await queryRunner.query('DROP TABLE "asset_subcategories"');
  }
}

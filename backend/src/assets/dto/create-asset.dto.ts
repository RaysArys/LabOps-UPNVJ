import {
  IsEnum,
  IsInt,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Max,
  Min,
} from 'class-validator';
import { AssetKategori } from '../enums/asset-status.enum';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  nama_aset: string;

  @IsEnum(AssetKategori)
  kategori: AssetKategori;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  subkategori?: string;

  @IsString()
  @IsNotEmpty()
  merek?: string;

  @IsString()
  @IsNotEmpty()
  model?: string;

  @IsString()
  @IsNotEmpty()
  serial_number?: string;

  @IsOptional()
  @IsString()
  no_inventaris?: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  tahun_perolehan?: number;

  @IsNumber()
  @IsInt()
  @Min(1)
  qty_sistem?: number;

  @IsString()
  @IsNotEmpty()
  satuan?: string;

  @IsString()
  @IsIn(['Ki Hajar Dewantara'])
  gedung?: string;

  @IsString()
  @IsIn(['Lantai 1', 'Lantai 2', 'Lantai 3', 'Lantai 4'])
  lantai?: string;

  @IsString()
  @IsIn([
    'Digital Library',
    'RUANG RAPAT KI HADJAR DEWANTARA',
    'RUANGAN FIK LAB 201',
    'RUANGAN FIK LAB 202',
    'RUANGAN FIK LAB 203',
    'HEAD OF LABORATORY ROOM',
    'RUANGAN FIK LAB 301',
    'RUANGAN FIK LAB 302',
    'RUANGAN FIK LAB 303',
    'RUANGAN FIK LAB 304',
    'Robotic Room',
    'Ruangan 401',
    'LABORATORIUM ENTERPRISE',
    'LABORATORIUM E-GOVERNANCE',
  ])
  ruangan?: string;

  @IsOptional()
  @IsString()
  rak?: string;

  @IsString()
  @IsNotEmpty()
  pic_pengguna?: string;

  @IsString()
  @IsNotEmpty()
  unit_pemilik?: string;

  // Isi bebas sesuai kategori, lihat contoh struktur di asset.entity.ts
  @IsOptional()
  @IsObject()
  atribut_kategori?: Record<string, unknown>;
}

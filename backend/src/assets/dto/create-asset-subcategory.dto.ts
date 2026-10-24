import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AssetKategori } from '../enums/asset-status.enum';

export class CreateAssetSubcategoryDto {
  @IsEnum(AssetKategori)
  kategori: AssetKategori;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  nama_subkategori: string;
}

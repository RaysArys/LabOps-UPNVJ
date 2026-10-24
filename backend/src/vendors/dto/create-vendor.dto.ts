import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  nama_vendor: string;

  @IsString()
  @IsNotEmpty()
  kontak?: string;

  @IsString()
  @IsNotEmpty()
  no_akreditasi?: string;

  @IsDateString()
  @IsNotEmpty()
  tanggal_expired_akreditasi?: string;
}

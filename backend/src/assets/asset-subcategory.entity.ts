import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AssetKategori } from './enums/asset-status.enum';

@Entity('asset_subcategories')
@Unique('UQ_asset_subcategories_kategori_nama', [
  'kategori',
  'nama_subkategori',
])
export class AssetSubcategory {
  @PrimaryGeneratedColumn('uuid')
  subcategory_id: string;

  @Column({
    type: 'enum',
    enum: AssetKategori,
    enumName: 'assets_kategori_enum',
  })
  kategori: AssetKategori;

  @Column({ length: 160 })
  nama_subkategori: string;

  @Column({ default: true })
  aktif: boolean;

  @CreateDateColumn()
  created_at: Date;
}

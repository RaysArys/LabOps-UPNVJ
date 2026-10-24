import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './asset.entity';
import { AssetSubcategory } from './asset-subcategory.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, AssetSubcategory]), AuditModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService], // dipakai StockOpnameModule & CalibrationModule nanti
})
export class AssetsModule {}

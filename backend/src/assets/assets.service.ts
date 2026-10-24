import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './asset.entity';
import { AssetSubcategory } from './asset-subcategory.entity';
import { CreateAssetDto } from './dto/create-asset.dto';
import { CreateAssetSubcategoryDto } from './dto/create-asset-subcategory.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ApprovalStatus, AssetKategori } from './enums/asset-status.enum';
import {
  transitionAssetApproval,
  AssetApprovalAction,
} from './asset-approval.state-machine';
import { AuditService } from '../audit/audit.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly repo: Repository<Asset>,
    @InjectRepository(AssetSubcategory)
    private readonly subcategoryRepo: Repository<AssetSubcategory>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(): Promise<Asset[]> {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async findOne(assetId: string): Promise<Asset> {
    const asset = await this.repo.findOne({ where: { asset_id: assetId } });
    if (!asset) throw new NotFoundException(`Aset ${assetId} tidak ditemukan`);
    return asset;
  }

  async deleteUnapproved(assetId: string, user: RequestUser): Promise<void> {
    if (user.role !== Role.TATA_USAHA) {
      throw new ForbiddenException('Hanya Tata Usaha yang dapat menghapus aset.');
    }
    const asset = await this.findOne(assetId);
    if (
      ![ApprovalStatus.DRAFT, ApprovalStatus.PENDING_APPROVAL].includes(
        asset.status_approval,
      )
    ) {
      throw new BadRequestException(
        'Hanya aset draft atau menunggu persetujuan yang dapat dihapus.',
      );
    }
    await this.auditService.logChange({
      entityType: 'Asset',
      entityId: asset.asset_id,
      fieldName: 'deleted',
      fieldLama: asset.status_approval,
      fieldBaru: null,
      diubahOleh: user.userId,
      alasan: 'Dihapus Tata Usaha sebelum persetujuan.',
    });
    await this.repo.remove(asset);
  }

  async listSubcategories(kategori?: AssetKategori): Promise<AssetSubcategory[]> {
    return this.subcategoryRepo.find({
      where: { aktif: true, ...(kategori ? { kategori } : {}) },
      order: { kategori: 'ASC', nama_subkategori: 'ASC' },
    });
  }

  async addSubcategory(
    dto: CreateAssetSubcategoryDto,
  ): Promise<AssetSubcategory> {
    const namaSubkategori = dto.nama_subkategori.trim();
    if (!namaSubkategori) {
      throw new BadRequestException('Nama subkategori wajib diisi.');
    }
    const exists = await this.subcategoryRepo.findOne({
      where: { kategori: dto.kategori, nama_subkategori: namaSubkategori },
    });
    if (exists) {
      if (!exists.aktif) {
        exists.aktif = true;
        return this.subcategoryRepo.save(exists);
      }
      throw new BadRequestException('Subkategori ini sudah terdaftar.');
    }
    return this.subcategoryRepo.save(
      this.subcategoryRepo.create({
        kategori: dto.kategori,
        nama_subkategori: namaSubkategori,
      }),
    );
  }

  // FR-01/FR-05: siapa pun boleh membuat draft (Tata Usaha untuk aset baru
  // hasil pengadaan, atau Laboran saat menemukan aset belum terdaftar
  // ketika stock opname — lihat StockOpnameService). Draft ini belum aktif
  // sampai diajukan dan disetujui.
  async create(dto: CreateAssetDto, user: RequestUser): Promise<Asset> {
    const normalizedSubcategory = dto.subkategori?.trim();
    if (
      normalizedSubcategory &&
      !(await this.subcategoryRepo.findOne({
        where: {
          kategori: dto.kategori,
          nama_subkategori: normalizedSubcategory,
          aktif: true,
        },
      }))
    ) {
      throw new BadRequestException('Subkategori tidak sesuai dengan kategori.');
    }
    let noInventaris = dto.no_inventaris;
    if (normalizedSubcategory) {
      const subcategoryCode =
        normalizedSubcategory === 'Development Board (Arduino, ESP32, RasPi)'
          ? 'DEVELOPMENT_BOARD'
          : normalizedSubcategory
              .toUpperCase()
              .replace(/[^A-Z0-9]+/g, '_')
              .replace(/^_|_$/g, '');
      const prefix = `${dto.kategori}-${subcategoryCode}`;
      const existingAssets = await this.repo.find({
        select: { no_inventaris: true },
        where: { kategori: dto.kategori, subkategori: normalizedSubcategory },
      });
      const highestNumber = existingAssets.reduce((highest, existing) => {
        const match = existing.no_inventaris?.match(/-(\d{4})$/);
        return match ? Math.max(highest, Number(match[1])) : highest;
      }, 0);
      noInventaris = `${prefix}-${String(highestNumber + 1).padStart(4, '0')}`;
    }
    if (dto.lantai || dto.ruangan) {
      const roomsByFloor: Record<string, string[]> = {
        'Lantai 1': ['Digital Library', 'RUANG RAPAT KI HADJAR DEWANTARA'],
        'Lantai 2': [
          'RUANGAN FIK LAB 201',
          'RUANGAN FIK LAB 202',
          'RUANGAN FIK LAB 203',
          'HEAD OF LABORATORY ROOM',
        ],
        'Lantai 3': [
          'RUANGAN FIK LAB 301',
          'RUANGAN FIK LAB 302',
          'RUANGAN FIK LAB 303',
          'RUANGAN FIK LAB 304',
          'HEAD OF LABORATORY ROOM',
        ],
        'Lantai 4': [
          'Robotic Room',
          'Ruangan 401',
          'LABORATORIUM ENTERPRISE',
          'LABORATORIUM E-GOVERNANCE',
        ],
      };
      if (!roomsByFloor[dto.lantai ?? '']?.includes(dto.ruangan ?? '')) {
        throw new BadRequestException('Ruangan tidak sesuai dengan lantai.');
      }
    }
    const asset = this.repo.create({
      ...dto,
      subkategori: normalizedSubcategory,
      no_inventaris: noInventaris,
      status_approval: ApprovalStatus.DRAFT,
      diajukan_oleh: user.userId,
    });
    return this.repo.save(asset);
  }

  // FR-02: perubahan pada aset yang statusnya sudah APPROVED tidak langsung
  // berlaku — kembali jadi DRAFT (revisi) dan harus melalui approval lagi.
  // Aset yang masih DRAFT/REJECTED boleh diedit langsung tanpa reset status.
  async update(
    assetId: string,
    dto: UpdateAssetDto,
    user: RequestUser,
  ): Promise<Asset> {
    const asset = await this.findOne(assetId);
    const before = { ...asset };

    Object.assign(asset, dto);

    if (asset.status_approval === ApprovalStatus.APPROVED) {
      asset.status_approval = ApprovalStatus.DRAFT;
      asset.diajukan_oleh = user.userId;
      asset.disetujui_oleh = null as unknown as string;
      asset.waktu_approval = null;
    }

    const saved = await this.repo.save(asset);

    await this.auditService.logDiff(
      'Asset',
      assetId,
      before as unknown as Record<string, unknown>,
      saved as unknown as Record<string, unknown>,
      user.userId,
    );

    return saved;
  }

  // Menjalankan transisi state machine approval (ajukan/setujui/tolak/revisi).
  // RolesGuard di controller yang membatasi siapa boleh panggil aksi apa
  // (mis. hanya WAKIL_DEKAN yang boleh 'setujui'/'tolak').
  async transitionApproval(
    assetId: string,
    action: AssetApprovalAction,
    user: RequestUser,
    alasan?: string,
  ): Promise<Asset> {
    // FR-03: hanya Wakil Dekan yang boleh menyetujui/menolak. RolesGuard di
    // controller sengaja dibuka untuk semua role (karena 'ajukan'/'revisi'
    // memang boleh dilakukan role operasional), jadi pembatasan spesifik per
    // aksi ini divalidasi di sini.
    if (
      (action === 'setujui' || action === 'tolak') &&
      user.role !== Role.WAKIL_DEKAN
    ) {
      throw new ForbiddenException(
        'Hanya Wakil Dekan yang dapat menyetujui/menolak perubahan aset',
      );
    }

    const asset = await this.findOne(assetId);
    const statusLama = asset.status_approval;

    asset.status_approval = transitionAssetApproval(statusLama, action);

    if (action === 'ajukan') {
      asset.diajukan_oleh = user.userId;
    }
    if (action === 'setujui' || action === 'tolak') {
      asset.disetujui_oleh = user.userId;
      asset.waktu_approval = new Date();
    }

    const saved = await this.repo.save(asset);

    await this.auditService.logChange({
      entityType: 'Asset',
      entityId: assetId,
      fieldName: 'status_approval',
      fieldLama: statusLama,
      fieldBaru: asset.status_approval,
      diubahOleh: user.userId,
      alasan,
    });

    return saved;
  }
}

import { Body, Controller, Get, Post, UseGuards, ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { VmCoreEntity } from '../entities/vm-core.entity';
import { VmRamEntity } from '../entities/vm-ram.entity';
import { VmDiskEntity } from '../entities/vm-disk.entity';
import { VmOsEntity } from '../entities/vm-os.entity';
import { CreateOsDto } from '../../application/dtos/create-os.dto';

@ApiTags('VM Resources')
@ApiCookieAuth('access_token')
@Controller('vm-resources')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VmResourcesController {
  constructor(
    @InjectRepository(VmCoreEntity) private readonly coreRepo: Repository<VmCoreEntity>,
    @InjectRepository(VmRamEntity)  private readonly ramRepo:  Repository<VmRamEntity>,
    @InjectRepository(VmDiskEntity) private readonly diskRepo: Repository<VmDiskEntity>,
    @InjectRepository(VmOsEntity)   private readonly osRepo:   Repository<VmOsEntity>,
  ) {}

  @ApiOperation({ summary: 'Opciones de vCPUs' })
  @Get('cores')
  getCores() {
    return this.coreRepo.find({ order: { value: 'ASC' } });
  }

  @ApiOperation({ summary: 'Opciones de RAM (MB)' })
  @Get('ram')
  getRam() {
    return this.ramRepo.find({ order: { value: 'ASC' } });
  }

  @ApiOperation({ summary: 'Opciones de disco (GB)' })
  @Get('disk')
  getDisk() {
    return this.diskRepo.find({ order: { value: 'ASC' } });
  }

  @ApiOperation({ summary: 'Sistemas operativos disponibles' })
  @Get('os')
  getOs() {
    return this.osRepo.find({ order: { name: 'ASC' } });
  }

  @ApiOperation({ summary: 'Crear nuevo sistema operativo (solo Administrador)' })
  @Post('os')
  @Roles('Administrador')
  async createOs(@Body() dto: CreateOsDto) {
    const exists = await this.osRepo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException(`El OS "${dto.name}" ya existe`);
    return this.osRepo.save(this.osRepo.create({ name: dto.name, isCustom: true }));
  }
}

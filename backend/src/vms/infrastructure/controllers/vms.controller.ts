import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CreateVmDto } from '../../application/dtos/create-vm.dto';
import { UpdateVmDto } from '../../application/dtos/update-vm.dto';
import { UpdateVmStatusDto } from '../../application/dtos/update-vm-status.dto';
import { VmsQueryDto } from '../../application/dtos/vms-query.dto';
import { CreateVmUseCase } from '../../application/use-cases/create-vm.use-case';
import { DeleteVmUseCase } from '../../application/use-cases/delete-vm.use-case';
import { GetVmByIdUseCase } from '../../application/use-cases/get-vm-by-id.use-case';
import { GetVmStatsUseCase } from '../../application/use-cases/get-vm-stats.use-case';
import { ListVmsUseCase } from '../../application/use-cases/list-vms.use-case';
import { UpdateVmUseCase } from '../../application/use-cases/update-vm.use-case';
import { UpdateVmStatusUseCase } from '../../application/use-cases/update-vm-status.use-case';
import { VmsGateway } from '../gateways/vms.gateway';

@ApiTags('VMs')
@ApiCookieAuth('access_token')
@Controller('vms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VmsController {
  constructor(
    private readonly listVmsUseCase: ListVmsUseCase,
    private readonly getVmByIdUseCase: GetVmByIdUseCase,
    private readonly getVmStatsUseCase: GetVmStatsUseCase,
    private readonly createVmUseCase: CreateVmUseCase,
    private readonly updateVmUseCase: UpdateVmUseCase,
    private readonly updateVmStatusUseCase: UpdateVmStatusUseCase,
    private readonly deleteVmUseCase: DeleteVmUseCase,
    private readonly vmsGateway: VmsGateway,
  ) {}

  @ApiOperation({ summary: 'Listar VMs con paginación y filtros (Admin y Cliente)' })
  @Get()
  findAll(@Query() query: VmsQueryDto) {
    return this.listVmsUseCase.execute(query);
  }

  @ApiOperation({ summary: 'Métricas agregadas de recursos (Admin y Cliente)' })
  @Get('stats')
  getStats() {
    return this.getVmStatsUseCase.execute();
  }

  @ApiOperation({ summary: 'Obtener una VM por ID (Admin y Cliente)' })
  @ApiParam({ name: 'id', description: 'UUID de la VM' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getVmByIdUseCase.execute(id);
  }

  @ApiOperation({ summary: 'Crear una VM (solo Administrador)' })
  @Post()
  @Roles('Administrador')
  async create(@Body() dto: CreateVmDto) {
    const vm = await this.createVmUseCase.execute(dto);
    this.vmsGateway.emitVmCreated(vm);
    const stats = await this.getVmStatsUseCase.execute();
    this.vmsGateway.emitVmStats(stats);
    return vm;
  }

  @ApiOperation({ summary: 'Actualizar una VM completa (solo Administrador)' })
  @ApiParam({ name: 'id', description: 'UUID de la VM' })
  @Put(':id')
  @Roles('Administrador')
  async update(@Param('id') id: string, @Body() dto: UpdateVmDto) {
    const vm = await this.updateVmUseCase.execute(id, dto);
    this.vmsGateway.emitVmUpdated(vm);
    const stats = await this.getVmStatsUseCase.execute();
    this.vmsGateway.emitVmStats(stats);
    return vm;
  }

  @ApiOperation({ summary: 'Cambiar solo el estado de una VM (solo Administrador)' })
  @ApiParam({ name: 'id', description: 'UUID de la VM' })
  @Patch(':id/status')
  @Roles('Administrador')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateVmStatusDto) {
    const vm = await this.updateVmStatusUseCase.execute(id, dto.status);
    this.vmsGateway.emitVmUpdated(vm);
    const stats = await this.getVmStatsUseCase.execute();
    this.vmsGateway.emitVmStats(stats);
    return vm;
  }

  @ApiOperation({ summary: 'Eliminar una VM (solo Administrador)' })
  @ApiParam({ name: 'id', description: 'UUID de la VM' })
  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.deleteVmUseCase.execute(id);
    this.vmsGateway.emitVmDeleted(id);
    const stats = await this.getVmStatsUseCase.execute();
    this.vmsGateway.emitVmStats(stats);
  }
}

import { IsOptional, IsIn, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VmsQueryDto {
  @ApiPropertyOptional({ enum: ['Encendida', 'Apagada', 'Suspendida'] })
  @IsOptional()
  @IsIn(['Encendida', 'Apagada', 'Suspendida'])
  status?: 'Encendida' | 'Apagada' | 'Suspendida';

  @ApiPropertyOptional({ description: 'Busca por nombre u OS', example: 'ubuntu' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

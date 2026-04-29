import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVmStatusDto {
  @ApiProperty({ enum: ['Encendida', 'Apagada', 'Suspendida'], example: 'Encendida' })
  @IsIn(['Encendida', 'Apagada', 'Suspendida'])
  status: 'Encendida' | 'Apagada' | 'Suspendida';
}

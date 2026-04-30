import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOsDto {
  @ApiProperty({ example: 'Arch Linux 2024' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name: string;
}

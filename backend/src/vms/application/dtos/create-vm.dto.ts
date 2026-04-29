import { IsString, IsInt, IsPositive, Min, IsIn, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVmDto {
  @ApiProperty({ example: 'web-server-01', minLength: 3, maxLength: 50 })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'El nombre solo puede contener letras, números, guiones y underscores' })
  name: string;

  @ApiProperty({ example: 4, minimum: 1 })
  @IsInt()
  @IsPositive()
  cores: number;

  @ApiProperty({ example: 8192, minimum: 512, description: 'RAM en MB' })
  @IsInt()
  @Min(512)
  ram: number;

  @ApiProperty({ example: 100, minimum: 10, description: 'Disco en GB' })
  @IsInt()
  @Min(10)
  disk: number;

  @ApiProperty({ example: 'Ubuntu 22.04' })
  @IsString()
  @MinLength(2)
  os: string;

  @ApiProperty({ example: 'Encendida', enum: ['Encendida', 'Apagada', 'Suspendida'] })
  @IsIn(['Encendida', 'Apagada', 'Suspendida'])
  status: string;
}

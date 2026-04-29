import { Body, Controller, Post, Res, UseGuards, HttpCode, HttpStatus, Get } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCookieAuth } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginDto } from '../../application/dtos/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @ApiOperation({ summary: 'Iniciar sesión — establece cookie HttpOnly con JWT' })
  @ApiOkResponse({ description: 'Login exitoso. El token se guarda en cookie access_token.' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.loginUseCase.execute(dto);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { user };
  }

  @ApiOperation({ summary: 'Cerrar sesión — limpia la cookie access_token' })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Sesión cerrada' };
  }

  @ApiOperation({ summary: 'Obtener usuario autenticado actual' })
  @ApiCookieAuth('access_token')
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: unknown) {
    return { user };
  }
}

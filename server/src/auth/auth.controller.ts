import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { AdminGuard } from './guards/admin.guard';
import { JwtGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Req() req: Request & { user: { sub: number } }, @Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(req.user.sub, refreshToken);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request & { user: { sub: number } }) {
    return this.authService.logout(req.user.sub);
  }

  /** Check whether a username is still available (no auth required). */
  @Get('check-username')
  checkUsername(@Query('username') username: string) {
    return this.authService.checkUsername(username ?? '');
  }

  /** Check whether an email is still available (no auth required). */
  @Get('check-email')
  checkEmail(@Query('email') email: string) {
    return this.authService.checkEmail(email ?? '');
  }

  /** Check whether a phone number is still available (no auth required). */
  @Get('check-phone')
  checkPhone(@Query('phone') phone: string) {
    return this.authService.checkPhone(phone ?? '');
  }

  /** Return all companies for the registration form dropdown (no auth required). */
  @Get('companies')
  getCompanies() {
    return this.authService.getCompanies();
  }

  /**
   * Admin-only: approve a user account.
   * Requires a valid access token belonging to a user in the Admin table.
   */
  @UseGuards(AdminGuard)
  @Patch('approve/:userId')
  approveUser(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Req() req: Request & { user: { sub: number } },
  ) {
    return this.authService.approveUser(targetUserId, req.user.sub);
  }
}



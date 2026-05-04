import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminGuard } from './guards/admin.guard';
import { JwtGuard } from './guards/jwt.guard';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    JwtModule.register({
      // secret is provided per-call so individual sign calls can use
      // different secrets for access vs. refresh tokens.
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtGuard, AdminGuard],
  exports: [JwtGuard, AdminGuard],
})
export class AuthModule {}

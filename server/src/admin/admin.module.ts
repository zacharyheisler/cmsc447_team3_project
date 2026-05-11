import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AdminGuard } from '../auth/guards/admin.guard';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, JwtService, AdminGuard],
})
export class AdminModule {}
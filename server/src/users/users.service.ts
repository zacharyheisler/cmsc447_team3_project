import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { ProfileDto } from './dtos/profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private toProfile(user: { userId: number; username: string; email: string; phoneNumber: string; companyId: number; accountCreated: Date }): ProfileDto {
    return {
      userId: user.userId,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      companyId: user.companyId,
      accountCreated: user.accountCreated,
    };
  }

  async findAll(): Promise<ProfileDto[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => this.toProfile(u));
  }

  async findOne(userId: number): Promise<ProfileDto> {
    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    return this.toProfile(user);
  }

  async update(userId: number, data: Prisma.UserUpdateInput): Promise<ProfileDto> {
    await this.findOne(userId);
    const user = await this.prisma.user.update({ where: { userId }, data });
    return this.toProfile(user);
  }

  async remove(userId: number): Promise<ProfileDto> {
    await this.findOne(userId);
    const user = await this.prisma.user.delete({ where: { userId } });
    return this.toProfile(user);
  }
}
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

const SALT_ROUNDS = 12;
const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

type UserRole = 'user' | 'agent' | 'admin';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ── helpers ──────────────────────────────────────────────────────────

  private async determineRole(userId: number): Promise<UserRole> {
    const [admin, agent] = await Promise.all([
      this.prisma.admin.findUnique({ where: { userId } }),
      this.prisma.agent.findUnique({ where: { userId } }),
    ]);
    if (admin) return 'admin';
    if (agent) return 'agent';
    return 'user';
  }

  private async signTokens(userId: number, username: string, role: UserRole) {
    const payload = { sub: userId, username, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: ACCESS_TTL,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: REFRESH_TTL,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: number, rawToken: string) {
    const hashed = await bcrypt.hash(rawToken, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { userId },
      data: { refreshToken: hashed },
    });
  }

  // ── public endpoints ─────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const username = dto.username.trim().toLowerCase();
    const email = dto.email.trim().toLowerCase();

    // Check each unique field individually so the frontend can show field-specific errors
    const [byUsername, byEmail, byPhone] = await Promise.all([
      this.prisma.user.findUnique({ where: { username } }),
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.user.findUnique({ where: { phoneNumber: dto.phoneNumber } }),
    ]);
    if (byUsername) throw new ConflictException('Username already exists');
    if (byEmail) throw new ConflictException('Email already exists');
    if (byPhone) throw new ConflictException('Phone number already in use');

    // Resolve or create the company
    let resolvedCompanyId: number;
    if (dto.companyId) {
      resolvedCompanyId = dto.companyId;
    } else {
      const company = await this.prisma.company.upsert({
        where: { name: dto.companyName! },
        update: {},
        create: { name: dto.companyName! },
      });
      resolvedCompanyId = company.companyId;
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);
    try {
      const user = await this.prisma.user.create({
        data: {
          username,
          email,
          phoneNumber: dto.phoneNumber,
          password: hashedPassword,
          companyId: resolvedCompanyId,
          // verifiedByAdminId intentionally left null on registration
        },
      });

      const tokens = await this.signTokens(user.userId, user.username, 'user');
      await this.storeRefreshToken(user.userId, tokens.refreshToken);
      return tokens;
    } catch (e) {
      // Safety net for race conditions: map DB unique violations to readable messages
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = (e.meta?.target as string[]) ?? [];
        if (target.includes('username')) throw new ConflictException('Username already exists');
        if (target.includes('email')) throw new ConflictException('Email already exists');
        if (target.includes('phone_number')) throw new ConflictException('Phone number already in use');
        throw new ConflictException('A unique value conflict occurred. Please review your inputs.');
      }
      throw e;
    }
  }

  async login(dto: LoginDto) {
    const { emailOrUsername, password } = dto;
    const normalized = emailOrUsername.trim().toLowerCase();

    // Accept either an email address or a username (case-insensitive)
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: normalized, mode: 'insensitive' } },
          { username: { equals: normalized, mode: 'insensitive' } },
        ],
      },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    if (user.verifiedByAdminId === null) {
      throw new UnauthorizedException(
        'Your account is pending admin approval. You will be notified by email once approved.',
      );
    }

    const role = await this.determineRole(user.userId);
    const tokens = await this.signTokens(user.userId, user.username, role);
    await this.storeRefreshToken(user.userId, tokens.refreshToken);
    return tokens;
  }

  async refresh(userId: number, rawRefreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const tokenMatch = await bcrypt.compare(rawRefreshToken, user.refreshToken);
    if (!tokenMatch) throw new ForbiddenException('Access denied');

    const role = await this.determineRole(user.userId);
    const tokens = await this.signTokens(user.userId, user.username, role);
    await this.storeRefreshToken(user.userId, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { userId },
      data: { refreshToken: null },
    });
  }

  async checkUsername(username: string): Promise<{ available: boolean }> {
    const exists = await this.prisma.user.findUnique({ where: { username } });
    return { available: !exists };
  }

  async checkEmail(email: string): Promise<{ available: boolean }> {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    return { available: !exists };
  }

  async checkPhone(phone: string): Promise<{ available: boolean }> {
    const exists = await this.prisma.user.findUnique({ where: { phoneNumber: phone } });
    return { available: !exists };
  }

  async getCompanies() {
    return this.prisma.company.findMany({
      select: { companyId: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async approveUser(targetUserId: number, adminUserId: number) {
    // Verify calling user is actually an admin
    const admin = await this.prisma.admin.findUnique({
      where: { userId: adminUserId },
    });
    if (!admin) throw new ForbiddenException('Admin access required');

    const target = await this.prisma.user.findUnique({
      where: { userId: targetUserId },
    });
    if (!target) throw new NotFoundException(`User ${targetUserId} not found`);

    return this.prisma.user.update({
      where: { userId: targetUserId },
      data: { verifiedByAdminId: admin.adminId },
      select: {
        userId: true,
        username: true,
        email: true,
        verifiedByAdminId: true,
      },
    });
  }
}


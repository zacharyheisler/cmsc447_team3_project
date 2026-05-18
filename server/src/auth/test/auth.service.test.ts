import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma.service';

// ── helpers ───────────────────────────────────────────────────────────────────

function makePrisma() {
  return {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    admin: { findUnique: jest.fn() },
    agent: { findUnique: jest.fn() },
    company: { upsert: jest.fn() },
  };
}

function makeJwt() {
  return {
    signAsync: jest.fn().mockResolvedValue('signed-token'),
  };
}

// ── suite ─────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let prisma: ReturnType<typeof makePrisma>;
  let jwt: ReturnType<typeof makeJwt>;

  beforeEach(async () => {
    prisma = makePrisma();
    jwt = makeJwt();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── register ────────────────────────────────────────────────────────────────

  describe('register()', () => {
    const dto = {
      username: 'TestUser',
      email: 'test@example.com',
      phoneNumber: '555-1234',
      password: 'password123',
      companyName: 'Acme Corp',
    };

    const createdUser = { userId: 1, username: 'testuser' };
    const company = { companyId: 10, name: 'Acme Corp' };

    beforeEach(() => {
      // no duplicates by default
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.company.upsert.mockResolvedValue(company);
      prisma.user.create.mockResolvedValue(createdUser);
      prisma.user.update.mockResolvedValue(createdUser);
    });

    it('creates a user and returns tokens', async () => {
      const result = await service.register(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('normalises username and email to lower-case', async () => {
      await service.register(dto);
      const callArg = prisma.user.create.mock.calls[0][0].data;
      expect(callArg.username).toBe('testuser');
      expect(callArg.email).toBe('test@example.com');
    });

    it('throws ConflictException when username is taken', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce({ userId: 99 }) // username exists
        .mockResolvedValue(null);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when email is taken', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null)              // username free
        .mockResolvedValueOnce({ userId: 99 })   // email taken
        .mockResolvedValue(null);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when phone number is taken', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(null)              // username free
        .mockResolvedValueOnce(null)              // email free
        .mockResolvedValueOnce({ userId: 99 });   // phone taken

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });

    it('uses an existing companyId when provided', async () => {
      await service.register({ ...dto, companyId: 5, companyName: undefined });
      expect(prisma.company.upsert).not.toHaveBeenCalled();
      const callArg = prisma.user.create.mock.calls[0][0].data;
      expect(callArg.companyId).toBe(5);
    });
  });

  // ── login ───────────────────────────────────────────────────────────────────

  describe('login()', () => {
    const dto = { emailOrUsername: 'testuser', password: 'password123' };
    let hashedPassword: string;

    beforeEach(async () => {
      hashedPassword = await bcrypt.hash('password123', 12);
      prisma.admin.findUnique.mockResolvedValue(null);
      prisma.agent.findUnique.mockResolvedValue(null);
      prisma.user.update.mockResolvedValue({});
    });

    it('returns tokens for a verified user with correct credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({
        userId: 1,
        username: 'testuser',
        password: hashedPassword,
        verifiedByAdminId: 1, // verified
      });

      const result = await service.login(dto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('throws UnauthorizedException for unknown user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      prisma.user.findFirst.mockResolvedValue({
        userId: 1,
        username: 'testuser',
        password: hashedPassword,
        verifiedByAdminId: 1,
      });

      await expect(service.login({ ...dto, password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException for an unverified account', async () => {
      prisma.user.findFirst.mockResolvedValue({
        userId: 1,
        username: 'testuser',
        password: hashedPassword,
        verifiedByAdminId: null, // pending approval
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('accepts an email address as the login identifier', async () => {
      prisma.user.findFirst.mockResolvedValue({
        userId: 1,
        username: 'testuser',
        password: hashedPassword,
        verifiedByAdminId: 1,
      });

      const result = await service.login({ emailOrUsername: 'test@example.com', password: 'password123' });
      expect(result).toHaveProperty('accessToken');
    });
  });

  // ── logout ──────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('clears the stored refresh token', async () => {
      prisma.user.update.mockResolvedValue({});
      await service.logout(1);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: { refreshToken: null },
      });
    });
  });

  // ── refresh ─────────────────────────────────────────────────────────────────

  describe('refresh()', () => {
    it('returns new tokens when the refresh token matches', async () => {
      const raw = 'raw-refresh-token';
      const hashed = await bcrypt.hash(raw, 12);
      prisma.user.findUnique.mockResolvedValue({ userId: 1, username: 'u', refreshToken: hashed });
      prisma.admin.findUnique.mockResolvedValue(null);
      prisma.agent.findUnique.mockResolvedValue(null);
      prisma.user.update.mockResolvedValue({});

      const result = await service.refresh(1, raw);
      expect(result).toHaveProperty('accessToken');
    });

    it('throws ForbiddenException when user has no stored refresh token', async () => {
      prisma.user.findUnique.mockResolvedValue({ userId: 1, refreshToken: null });
      await expect(service.refresh(1, 'any')).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when the token does not match', async () => {
      const hashed = await bcrypt.hash('correct-token', 12);
      prisma.user.findUnique.mockResolvedValue({ userId: 1, username: 'u', refreshToken: hashed });
      await expect(service.refresh(1, 'wrong-token')).rejects.toThrow(ForbiddenException);
    });
  });

  // ── checkUsername / checkEmail ───────────────────────────────────────────────

  describe('checkUsername()', () => {
    it('returns { available: true } when username is free', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      expect(await service.checkUsername('free')).toEqual({ available: true });
    });

    it('returns { available: false } when username is taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ userId: 1 });
      expect(await service.checkUsername('taken')).toEqual({ available: false });
    });
  });

  describe('checkEmail()', () => {
    it('returns { available: true } when email is free', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      expect(await service.checkEmail('free@example.com')).toEqual({ available: true });
    });

    it('returns { available: false } when email is taken', async () => {
      prisma.user.findUnique.mockResolvedValue({ userId: 2 });
      expect(await service.checkEmail('taken@example.com')).toEqual({ available: false });
    });
  });
});

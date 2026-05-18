import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtGuard } from '../guards/jwt.guard';
import { AdminGuard } from '../guards/admin.guard';

// ── mock service ──────────────────────────────────────────────────────────────

const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  checkUsername: jest.fn(),
  checkEmail: jest.fn(),
  checkPhone: jest.fn(),
  getCompanies: jest.fn(),
};

// Override guards so they don't require real JWT validation in unit tests
const mockGuard = { canActivate: () => true };

// ── suite ─────────────────────────────────────────────────────────────────────

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtGuard)
      .useValue(mockGuard)
      .overrideGuard(AdminGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  // ── register ────────────────────────────────────────────────────────────────

  describe('register()', () => {
    const dto = {
      username: 'test',
      email: 'test@example.com',
      phoneNumber: '555-0000-9088',
      password: 'password123',
      companyName: 'Test Corp',
    };

    it('delegates to AuthService.register and returns tokens', async () => {
      mockAuthService.register.mockResolvedValue(mockTokens);
      const result = await controller.register(dto as any);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTokens);
    });

    it('propagates errors from AuthService.register', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Conflict'));
      await expect(controller.register(dto as any)).rejects.toThrow('Conflict');
    });
  });

  // ── login ───────────────────────────────────────────────────────────────────

  describe('login(): username', () => {
    const dto = { emailOrUsername: 'test', password: 'password123' };

    it('delegates to AuthService.login and returns tokens', async () => {
      mockAuthService.login.mockResolvedValue(mockTokens);
      const result = await controller.login(dto as any);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTokens);
    });

    it('propagates errors from AuthService.login', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Unauthorized'));
      await expect(controller.login(dto as any)).rejects.toThrow('Unauthorized');
    });
  });

    describe('login(): email', () => {
    const dto = { emailOrUsername: 'test@example.com', password: 'password123' };

    it('delegates to AuthService.login and returns tokens', async () => {
      mockAuthService.login.mockResolvedValue(mockTokens);
      const result = await controller.login(dto as any);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTokens);
    });

    it('propagates errors from AuthService.login', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Unauthorized'));
      await expect(controller.login(dto as any)).rejects.toThrow('Unauthorized');
    });
  });


  // ── logout ──────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('calls AuthService.logout with the user id from the request', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);
      const fakeReq = { user: { sub: 7 } } as any;
      await controller.logout(fakeReq);
      expect(mockAuthService.logout).toHaveBeenCalledWith(7);
    });
  });

  // ── refresh ─────────────────────────────────────────────────────────────────

  describe('refresh()', () => {
    it('calls AuthService.refresh with userId and raw refresh token', async () => {
      mockAuthService.refresh.mockResolvedValue(mockTokens);
      const fakeReq = { user: { sub: 3 } } as any;
      const result = await controller.refresh(fakeReq, 'raw-refresh-token');
      expect(mockAuthService.refresh).toHaveBeenCalledWith(3, 'raw-refresh-token');
      expect(result).toEqual(mockTokens);
    });
  });

  // ── availability checks ──────────────────────────────────────────────────────

  describe('checkUsername()', () => {
    it('returns availability result from service', async () => {
      mockAuthService.checkUsername.mockResolvedValue({ available: true });
      const result = await controller.checkUsername('freeuser');
      expect(mockAuthService.checkUsername).toHaveBeenCalledWith('freeuser');
      expect(result).toEqual({ available: true });
    });

    it('uses empty string when query param is missing', async () => {
      mockAuthService.checkUsername.mockResolvedValue({ available: false });
      // NestJS passes undefined when the query param is absent; controller falls back to ''
      await controller.checkUsername(undefined as any);
      expect(mockAuthService.checkUsername).toHaveBeenCalledWith('');
    });
  });

  describe('checkEmail()', () => {
    it('returns availability result from service', async () => {
      mockAuthService.checkEmail.mockResolvedValue({ available: false });
      const result = await controller.checkEmail('taken@example.com');
      expect(result).toEqual({ available: false });
    });
  });

  // ── companies ────────────────────────────────────────────────────────────────

  describe('getCompanies()', () => {
    it('returns company list from service', async () => {
      const companies = [{ companyId: 1, name: 'Acme' }];
      mockAuthService.getCompanies.mockResolvedValue(companies);
      const result = await controller.getCompanies();
      expect(result).toEqual(companies);
    });
  });
});

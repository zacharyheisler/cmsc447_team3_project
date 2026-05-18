import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { TicketsService } from '../../tickets/tickets.service';
import { PrismaService } from '../../prisma.service';

// ── shared fixtures ───────────────────────────────────────────────────────────

const accountCreated = new Date('2025-01-01T00:00:00.000Z');

const mockUser = {
  userId: 42,
  username: 'jdoe',
  email: 'jdoe@example.com',
  phoneNumber: '555-1234',
  companyId: 10,
  accountCreated,
  password: 'hashed',
  refreshToken: null,
  verifiedByAdminId: 1,
};

const expectedProfile = {
  userId: 42,
  username: 'jdoe',
  email: 'jdoe@example.com',
  phoneNumber: '555-1234',
  companyId: 10,
  accountCreated,
};

const openTicket = {
  ticketId: 1,
  type: 'BUG',
  description: 'Login button not working',
  status: 'OPEN',
  createdById: 42,
  assignedToId: null,
};

// ── prisma mocks ──────────────────────────────────────────────────────────────

function makePrisma() {
  return {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ticket: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ticketMessage: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    ticketStatusHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
}

// ── suite ─────────────────────────────────────────────────────────────────────

describe('User Dashboard – UsersService + TicketsService', () => {
  let usersService: UsersService;
  let ticketsService: TicketsService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(async () => {
    prisma = makePrisma();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        TicketsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    ticketsService = module.get<TicketsService>(TicketsService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── UsersService – profile ────────────────────────────────────────────────────

  describe('UsersService.findOne() – load dashboard profile', () => {
    it('returns a ProfileDto for a valid user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findOne(42);

      expect(result).toEqual(expectedProfile);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { userId: 42 } });
    });

    it('throws NotFoundException for an unknown userId', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(usersService.findOne(9999)).rejects.toThrow(NotFoundException);
    });

    it('does not expose the password or refreshToken fields', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await usersService.findOne(42);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('UsersService.findAll() – admin/agent user list', () => {
    it('returns all users as ProfileDtos', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      const result = await usersService.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expectedProfile);
    });

    it('returns an empty array when there are no users', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      const result = await usersService.findAll();
      expect(result).toEqual([]);
    });
  });

  // ── UsersService – profile updates ───────────────────────────────────────────

  describe('UsersService.update() – edit profile', () => {
    it('updates allowed fields and returns the updated ProfileDto', async () => {
      const updatedUser = { ...mockUser, phoneNumber: '555-9999' };
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await usersService.update(42, { phoneNumber: '555-9999' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { userId: 42 },
        data: { phoneNumber: '555-9999' },
      });
      expect(result.phoneNumber).toBe('555-9999');
    });

    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(usersService.update(9999, { phoneNumber: '000' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('UsersService.remove() – delete account', () => {
    it('removes the user and returns the deleted ProfileDto', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.delete.mockResolvedValue(mockUser);

      const result = await usersService.remove(42);

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { userId: 42 } });
      expect(result).toEqual(expectedProfile);
    });

    it('throws NotFoundException when the user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(usersService.remove(9999)).rejects.toThrow(NotFoundException);
    });
  });

  // ── TicketsService – user dashboard ticket operations ────────────────────────

  describe('TicketsService.createTicket() – submit a new ticket', () => {
    it('creates a BUG ticket on behalf of the user', async () => {
      prisma.ticket.create.mockResolvedValue(openTicket);

      const result = await ticketsService.createTicket({
        type: 'BUG',
        description: 'Login button not working',
        createdById: 42,
      });

      expect(prisma.ticket.create).toHaveBeenCalledWith({
        data: {
          type: 'BUG',
          description: 'Login button not working',
          createdById: 42,
          assignedToId: null,
        },
      });
      expect(result).toMatchObject({ type: 'BUG', createdById: 42, status: 'OPEN' });
    });

    it('creates a TECH_SUPPORT ticket and pre-assigns an agent', async () => {
      const assigned = { ...openTicket, type: 'TECH_SUPPORT', assignedToId: 5 };
      prisma.ticket.create.mockResolvedValue(assigned);

      const result = await ticketsService.createTicket({
        type: 'TECH_SUPPORT',
        description: 'Cannot connect to VPN',
        createdById: 42,
        assignedToId: 5,
      });

      expect(prisma.ticket.create.mock.calls[0][0].data.assignedToId).toBe(5);
      expect(result.assignedToId).toBe(5);
    });

    it('creates a BILLING ticket with no agent assigned', async () => {
      const billingTicket = { ...openTicket, type: 'BILLING', description: 'Wrong invoice amount' };
      prisma.ticket.create.mockResolvedValue(billingTicket);

      const result = await ticketsService.createTicket({
        type: 'BILLING',
        description: 'Wrong invoice amount',
        createdById: 42,
      });

      expect(result.type).toBe('BILLING');
      expect(result.assignedToId).toBeNull();
    });
  });

  describe('TicketsService.getTickets() – view my tickets', () => {
    it('returns all tickets belonging to the user', async () => {
      const tickets = [openTicket, { ...openTicket, ticketId: 2, type: 'ACCOUNT' }];
      prisma.ticket.findMany.mockResolvedValue(tickets);

      const result = await ticketsService.getTickets(42, undefined);

      expect(prisma.ticket.findMany).toHaveBeenCalledWith({ where: { createdById: 42 } });
      expect(result).toHaveLength(2);
    });

    it('returns an empty list when the user has no tickets', async () => {
      prisma.ticket.findMany.mockResolvedValue([]);
      const result = await ticketsService.getTickets(42, undefined);
      expect(result).toEqual([]);
    });
  });

  describe('TicketsService.getTicketById() – view ticket detail', () => {
    it('returns full ticket detail for a ticket the user owns', async () => {
      prisma.ticket.findUnique.mockResolvedValue(openTicket);
      const result = await ticketsService.getTicketById(1);
      expect(result).toEqual(openTicket);
    });

    it('returns null for a non-existent ticket id', async () => {
      prisma.ticket.findUnique.mockResolvedValue(null);
      const result = await ticketsService.getTicketById(9999);
      expect(result).toBeNull();
    });
  });

  describe('TicketsService.addMessage() – send a message on a ticket', () => {
    it('adds a user message to an existing ticket', async () => {
      const msg = { ticketId: 1, content: 'Any update?', userId: 42, agentId: null, isAiGenerated: false };
      prisma.ticketMessage.create.mockResolvedValue(msg);

      const result = await ticketsService.addMessage(1, { content: 'Any update?', userId: 42 });

      expect(prisma.ticketMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ticketId: 1, content: 'Any update?', userId: 42 }),
        }),
      );
      expect(result.content).toBe('Any update?');
    });
  });

  // ── Full user-dashboard workflow ──────────────────────────────────────────────

  describe('Dashboard workflow – load profile then create and view tickets', () => {
    it('simulates a user loading their dashboard, creating a ticket, and viewing it', async () => {
      // Step 1: load profile
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const profile = await usersService.findOne(42);
      expect(profile.userId).toBe(42);

      // Step 2: create a new support ticket
      prisma.ticket.create.mockResolvedValue(openTicket);
      const created = await ticketsService.createTicket({
        type: 'BUG',
        description: 'Login button not working',
        createdById: profile.userId,
      });
      expect(created.createdById).toBe(42);
      expect(created.status).toBe('OPEN');

      // Step 3: fetch ticket list (dashboard table)
      prisma.ticket.findMany.mockResolvedValue([created]);
      const tickets = await ticketsService.getTickets(profile.userId, undefined);
      expect(tickets).toHaveLength(1);
      expect(tickets[0].ticketId).toBe(1);

      // Step 4: open the ticket detail screen
      prisma.ticket.findUnique.mockResolvedValue(created);
      const detail = await ticketsService.getTicketById(created.ticketId);
      expect(detail).toMatchObject({ type: 'BUG', status: 'OPEN' });
    });
  });
});

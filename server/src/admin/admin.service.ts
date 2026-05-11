import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureNotLastAdmin(userId: number) {
    const admin = await this.prisma.admin.findUnique({
        where: { userId },
    });

    if (!admin) return;

    const adminCount = await this.prisma.admin.count();

    if (adminCount <= 1) {
        throw new ForbiddenException('Cannot modify the last remaining admin');
    }
    }

  async getUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        userId: true,
        username: true,
        email: true,
        phoneNumber: true,
        accountCreated: true,
        active: true,
        verifiedByAdminId: true,
        company: {
          select: {
            companyId: true,
            name: true,
          },
        },
        agent: {
          select: {
            agentId: true,
          },
        },
        admin: {
          select: {
            adminId: true,
          },
        },
      },
      orderBy: {
        userId: 'asc',
      },
    });

    return users.map((user) => ({
      ...user,
      role: user.admin ? 'admin' : user.agent ? 'agent' : 'user',
      isApproved: user.verifiedByAdminId !== null,
    }));
  }

  async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        username: true,
        email: true,
        phoneNumber: true,
        accountCreated: true,
        active: true,
        verifiedByAdminId: true,
        company: {
          select: {
            companyId: true,
            name: true,
          },
        },
        agent: true,
        admin: true,
        createdTickets: true,
        sentMessages: true,
        statusChanges: true,
      },
    });

    if (!user) throw new NotFoundException(`User ${userId} not found`);

    return {
      ...user,
      role: user.admin ? 'admin' : user.agent ? 'agent' : 'user',
      isApproved: user.verifiedByAdminId !== null,
    };
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
        where: { userId },
    });

    if (!user) throw new NotFoundException(`User ${userId} not found`);

    if (dto.active === false) {
        await this.ensureNotLastAdmin(userId);
    }

    return this.prisma.user.update({
        where: { userId },
        data: dto,
        select: {
        userId: true,
        username: true,
        email: true,
        phoneNumber: true,
        active: true,
        companyId: true,
        verifiedByAdminId: true,
        },
    });
    }

  async approveUser(userId: number, adminUserId: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { userId: adminUserId },
    });

    if (!admin) throw new ForbiddenException('Admin access required');

    const user = await this.prisma.user.findUnique({
      where: { userId },
    });

    if (!user) throw new NotFoundException(`User ${userId} not found`);

    return this.prisma.user.update({
      where: { userId },
      data: {
        verifiedByAdminId: admin.adminId,
      },
      select: {
        userId: true,
        username: true,
        email: true,
        active: true,
        verifiedByAdminId: true,
      },
    });
  }

  async setUserActive(userId: number, active: boolean, actorUserId?: number) {
    const user = await this.prisma.user.findUnique({
        where: { userId },
    });

    if (!user) throw new NotFoundException(`User ${userId} not found`);

    if (!active) {
        await this.ensureNotLastAdmin(userId);

        if (actorUserId === userId) {
        throw new ForbiddenException('Admins cannot deactivate their own account');
        }
    }

    return this.prisma.user.update({
        where: { userId },
        data: { active },
        select: {
        userId: true,
        username: true,
        email: true,
        active: true,
        },
    });
    }

  async updateUserRole(
  userId: number,
  role: 'user' | 'agent' | 'admin',
  actorUserId?: number,
) {
  const user = await this.prisma.user.findUnique({
    where: { userId },
    include: {
      agent: true,
      admin: true,
    },
  });

  if (!user) {
    throw new NotFoundException(`User ${userId} not found`);
    }
  if (user.admin && role !== 'admin') {
    await this.ensureNotLastAdmin(userId);

    if (actorUserId === userId) {
        throw new ForbiddenException('Admins cannot demote their own account');
    }
    }

  return this.prisma.$transaction(async (tx) => {
    if (user.agent) {
      await tx.agent.delete({
        where: { userId },
      });
    }

    if (user.admin) {
      await tx.admin.delete({
        where: { userId },
      });
    }

    if (role === 'agent') {
      await tx.agent.create({
        data: {
          userId,
        },
      });
    }

    if (role === 'admin') {
      await tx.admin.create({
        data: {
          userId,
        },
      });
    }

    const updated = await tx.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        username: true,
        email: true,
        active: true,
        verifiedByAdminId: true,
        agent: {
          select: { agentId: true },
        },
        admin: {
          select: { adminId: true },
        },
      },
    });

    return {
      ...updated,
      role,
      isApproved: updated?.verifiedByAdminId !== null,
    };
  });
}

async getTickets() {
  return this.prisma.ticket.findMany({
    include: {
      createdBy: {
        select: {
          userId: true,
          username: true,
          email: true,
        },
      },
      assignedTo: {
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              email: true,
            },
          },
        },
      },
      messages: {
        orderBy: { sentAt: 'desc' },
        take: 1,
      },
      statusHistory: {
        orderBy: { changedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async assignTicket(ticketId: number, agentId: number) {
  const ticket = await this.prisma.ticket.findUnique({
    where: { ticketId },
  });

  if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);

  const agent = await this.prisma.agent.findUnique({
    where: { agentId },
  });

  if (!agent) throw new NotFoundException(`Agent ${agentId} not found`);

  return this.prisma.ticket.update({
    where: { ticketId },
    data: { assignedToId: agentId },
    include: {
      createdBy: {
        select: {
          userId: true,
          username: true,
          email: true,
        },
      },
      assignedTo: {
        include: {
          user: {
            select: {
              userId: true,
              username: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

async updateTicketStatus(
  ticketId: number,
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'RESOLVED' | 'CLOSED',
  adminUserId: number,
) {
  const ticket = await this.prisma.ticket.findUnique({
    where: { ticketId },
  });

  if (!ticket) throw new NotFoundException(`Ticket ${ticketId} not found`);

  const admin = await this.prisma.admin.findUnique({
    where: { userId: adminUserId },
  });

  if (!admin) throw new ForbiddenException('Admin access required');

  return this.prisma.$transaction(async (tx) => {
    const updatedTicket = await tx.ticket.update({
      where: { ticketId },
      data: { status },
    });

    if (ticket.status !== status) {
      await tx.ticketStatusHistory.create({
        data: {
          ticketId,
          oldStatus: ticket.status,
          newStatus: status,
          statusChangeUserId: adminUserId,
        },
      });
    }

    return updatedTicket;
  });
}

async getDashboard() {
  const [
    totalUsers,
    activeUsers,
    pendingApprovals,
    totalAgents,
    totalAdmins,
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    unassignedTickets,
  ] = await Promise.all([
    this.prisma.user.count(),
    this.prisma.user.count({ where: { active: true } }),
    this.prisma.user.count({ where: { verifiedByAdminId: null } }),
    this.prisma.agent.count(),
    this.prisma.admin.count(),
    this.prisma.ticket.count(),
    this.prisma.ticket.count({ where: { status: 'OPEN' } }),
    this.prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
    this.prisma.ticket.count({ where: { status: 'RESOLVED' } }),
    this.prisma.ticket.count({ where: { status: 'CLOSED' } }),
    this.prisma.ticket.count({ where: { assignedToId: null } }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      pendingApprovals,
    },
    roles: {
      agents: totalAgents,
      admins: totalAdmins,
      regularUsers: totalUsers - totalAgents - totalAdmins,
    },
    tickets: {
      total: totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      unassigned: unassignedTickets,
    },
  };
}

async deleteUser(userId: number, actorUserId: number) {
  const user = await this.prisma.user.findUnique({
    where: { userId },
    include: {
      admin: true,
      agent: true,
      createdTickets: true,
      sentMessages: true,
      statusChanges: true,
    },
  });

    if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
    }
  await this.ensureNotLastAdmin(userId);

  if (actorUserId === userId) {
    throw new ForbiddenException('Admins cannot delete their own account');
  }

  const hasAuditHistory =
    user.createdTickets.length > 0 ||
    user.sentMessages.length > 0 ||
    user.statusChanges.length > 0;

  if (hasAuditHistory) {
    return this.prisma.user.update({
      where: { userId },
      data: { active: false },
      select: {
        userId: true,
        username: true,
        email: true,
        active: true,
      },
    });
  }

  return this.prisma.user.delete({
    where: { userId },
    select: {
      userId: true,
      username: true,
      email: true,
    },
  });
}

}
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) { }

  async getTickets(userId?: number, agentId?: number) {
    if (userId) {
      // user sees their own tickets
      return this.prisma.ticket.findMany({
        where: { createdById: userId },
      });
    }

    if (agentId) {
      return this.prisma.ticket.findMany({
        where: { assignedToId: agentId },
      });
    }

    return [];
  }
  async getAgentByUserId(userId: number) {
    return this.prisma.agent.findUnique({
      where: { userId },
      select: { agentId: true }
    });
  }
  async getTicketById(id: number) {
    return this.prisma.ticket.findUnique({
      where: { ticketId: id },
      include: {
        assignedTo: {
          select: {
            agentId: true,       // ← add this
            user: {
              select: { username: true }
            }
          }
        },
        messages: true,
        statusHistory: {
          include: {
            statusChangeUser: {
              select: { username: true }
            }
          }
        },
      },
    });
  }

  async createTicket(body: {
    type: any;
    description: string;
    createdById: number;
    assignedToId?: number;
  }) {
    return this.prisma.ticket.create({
      data: {
        type: body.type,
        description: body.description,
        createdById: body.createdById,
        assignedToId: body.assignedToId ?? null,
      },
    });
  }

  async addStatusHistory(ticketId: number, body: {
    oldStatus: any;
    newStatus: any;
    statusChangeUserId: number;
  }) {
    return this.prisma.ticketStatusHistory.create({
      data: {
        ticketId,
        oldStatus: body.oldStatus,
        newStatus: body.newStatus,
        statusChangeUserId: body.statusChangeUserId,
      },
    });
  }
  async updateTicket(ticketId: number, body: {
    status?: any;
    type?: any;
    description?: any;
    assignedToId?: number;
    oldStatus?: any;
    statusChangeUserId?: number;
  }) {
    const dataToUpdate: any = {};

    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.type !== undefined) dataToUpdate.type = body.type;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.assignedToId !== undefined) dataToUpdate.assignedToId = body.assignedToId;

    const updated = await this.prisma.ticket.update({
      where: { ticketId },
      data: dataToUpdate,
    });

    if (body.status && body.oldStatus && body.statusChangeUserId !== undefined) {
      await this.prisma.ticketStatusHistory.create({
        data: {
          ticketId,
          oldStatus: body.oldStatus,
          newStatus: body.status,
          statusChangeUserId: body.statusChangeUserId,
          changedAt: new Date(),
        },
      });
    }

    return updated;
  }


  async getMessages(ticketId: number) {
    return this.prisma.ticketMessage.findMany({
      where: { ticketId },
      orderBy: { sentAt: 'asc' },
    });
  }

  async addMessage(ticketId: number, body: {
    content: string;
    userId?: number;
    agentId?: number;
    isAiGenerated?: boolean;
  }) {
    return this.prisma.ticketMessage.create({
      data: {
        ticketId,
        content: body.content,
        userId: body.userId ?? null,
        agentId: body.agentId ?? null,
        isAiGenerated: body.isAiGenerated ?? false,
      },
    });
  }


  async getHistory(ticketId: number) {
    return this.prisma.ticketStatusHistory.findMany({
      where: { ticketId },
      orderBy: { changedAt: 'desc' },
    });
  }


  async deleteTicket(ticketId: number) {
    // first delete status history and messages
    await this.prisma.ticketStatusHistory.deleteMany({ where: { ticketId } });
    await this.prisma.ticketMessage.deleteMany({ where: { ticketId } });

    return this.prisma.ticket.delete({
      where: { ticketId }
    })
  }
}
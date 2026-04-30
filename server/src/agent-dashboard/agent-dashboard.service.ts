import { Injectable, NotFoundException } from '@nestjs/common';
import { Ticket, TicketStatus, TicketType } from '@prisma/client';
import { PrismaService } from '../prisma.service';

type TicketWithDashboardRelations = Ticket & {
  createdBy: {
    username: string;
  };
  messages: Array<{
    sentAt: Date;
    userId: number | null;
    agentId: number | null;
  }>;
  statusHistory: Array<{
    oldStatus: TicketStatus;
    newStatus: TicketStatus;
    changedAt: Date;
    statusChangeUser: {
      username: string;
    };
  }>;
};

@Injectable()
export class AgentDashboardService {
  constructor(private prisma: PrismaService) {}

  async getAgents() {
    return this.prisma.agent.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: { agentId: 'asc' },
    });
  }

  async getDashboard(agentId: number) {
    await this.getAgent(agentId);

    const [summaryCards, assignedTickets, teamQueue, recentActivity] =
      await Promise.all([
        this.getSummary(agentId),
        this.getAssignedTickets(agentId),
        this.getTeamQueue(),
        this.getRecentActivity(agentId),
      ]);

    const customerRepliesWaiting =
      await this.getCustomerRepliesWaiting(agentId);

    return {
      summaryCards,
      assignedTickets,
      teamQueue,
      recentActivity,
      todaysFocus: {
        firstResponseTarget: '30 min',
        customerRepliesWaiting,
      },
      priorityTicketId: assignedTickets[0]?.ticketId ?? null,
      featureRequestTicketId:
        assignedTickets.find(
          (ticket) => ticket.type === TicketType.FEATURE_REQUEST,
        )?.ticketId ?? null,
    };
  }

  async getSummary(agentId: number) {
    await this.getAgent(agentId);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const [openTickets, inProgressTickets, resolvedThisWeek] =
      await Promise.all([
        this.prisma.ticket.count({
          where: {
            assignedToId: agentId,
            status: TicketStatus.OPEN,
          },
        }),
        this.prisma.ticket.count({
          where: {
            assignedToId: agentId,
            status: TicketStatus.IN_PROGRESS,
          },
        }),
        this.prisma.ticket.count({
          where: {
            assignedToId: agentId,
            status: TicketStatus.RESOLVED,
            statusHistory: {
              some: {
                newStatus: TicketStatus.RESOLVED,
                changedAt: {
                  gte: weekStart,
                },
              },
            },
          },
        }),
      ]);

    return [
      {
        label: 'Open Tickets',
        value: String(openTickets),
        detail: `${openTickets} assigned ticket${openTickets === 1 ? '' : 's'} need attention`,
      },
      {
        label: 'In Progress',
        value: String(inProgressTickets),
        detail: `${inProgressTickets} ticket${inProgressTickets === 1 ? '' : 's'} are actively being worked`,
      },
      {
        label: 'Resolved This Week',
        value: String(resolvedThisWeek),
        detail: 'Tickets resolved in the last 7 days',
      },
    ];
  }

  async getAssignedTickets(agentId: number) {
    await this.getAgent(agentId);

    const tickets = await this.prisma.ticket.findMany({
      where: { assignedToId: agentId },
      include: {
        createdBy: {
          select: { username: true },
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          select: {
            sentAt: true,
            userId: true,
            agentId: true,
          },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
          take: 1,
          include: {
            statusChangeUser: {
              select: { username: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((ticket) => this.toDashboardTicket(ticket));
  }

  async getRecentActivity(agentId: number) {
    await this.getAgent(agentId);

    const history = await this.prisma.ticketStatusHistory.findMany({
      where: {
        ticket: {
          assignedToId: agentId,
        },
      },
      include: {
        statusChangeUser: {
          select: { username: true },
        },
        ticket: {
          select: { ticketId: true },
        },
      },
      orderBy: { changedAt: 'desc' },
      take: 5,
    });

    return history.map(
      (item) =>
        `Ticket #${item.ticket.ticketId} moved from ${item.oldStatus} to ${item.newStatus} by ${item.statusChangeUser.username}.`,
    );
  }

  private async getAgent(agentId: number) {
    const agent = await this.prisma.agent.findUnique({
      where: { agentId },
      include: {
        user: {
          select: {
            userId: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!agent) throw new NotFoundException(`Agent ${agentId} not found`);

    return agent;
  }

  private async getTeamQueue() {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const [recentUnassigned, waitingOnCustomer, oldOpenTickets] =
      await Promise.all([
        this.prisma.ticket.count({
          where: {
            assignedToId: null,
            createdAt: {
              gte: oneHourAgo,
            },
          },
        }),
        this.prisma.ticket.count({
          where: {
            status: TicketStatus.WAITING_ON_CUSTOMER,
          },
        }),
        this.prisma.ticket.count({
          where: {
            status: TicketStatus.OPEN,
            assignedToId: null,
          },
        }),
      ]);

    return [
      `${recentUnassigned} unassigned ticket${recentUnassigned === 1 ? '' : 's'} were created in the last hour.`,
      `${waitingOnCustomer} ticket${waitingOnCustomer === 1 ? '' : 's'} are waiting on customer follow-up.`,
      `${oldOpenTickets} open unassigned ticket${oldOpenTickets === 1 ? '' : 's'} need triage.`,
    ];
  }

  private async getCustomerRepliesWaiting(agentId: number) {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        assignedToId: agentId,
      },
      select: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          select: {
            userId: true,
          },
        },
      },
    });

    return tickets.filter((ticket) => ticket.messages[0]?.userId).length;
  }

  private toDashboardTicket(ticket: TicketWithDashboardRelations) {
    return {
      ticketId: ticket.ticketId,
      title: this.getTicketTitle(ticket.description),
      description: ticket.description,
      type: ticket.type,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: this.getUpdatedAt(ticket),
      customer: ticket.createdBy.username,
      assignedAgentId: ticket.assignedToId,
      priority: this.getPriority(ticket),
      messages: ticket.messages,
      statusHistory: ticket.statusHistory,
    };
  }

  private getTicketTitle(description: string) {
    const firstSentence = description.split('.')[0].trim();
    return firstSentence.length > 60
      ? `${firstSentence.slice(0, 57)}...`
      : firstSentence;
  }

  private getUpdatedAt(ticket: TicketWithDashboardRelations) {
    const messageDate = ticket.messages[0]?.sentAt;
    const historyDate = ticket.statusHistory[0]?.changedAt;
    const dates = [ticket.createdAt, messageDate, historyDate].filter(
      Boolean,
    ) as Date[];

    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }

  private getPriority(ticket: Ticket) {
    const ageInDays =
      (Date.now() - ticket.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    if (ticket.status === TicketStatus.OPEN && ageInDays >= 2) return 'High';
    if (ticket.type === TicketType.BUG || ticket.type === TicketType.ACCOUNT)
      return 'High';
    if (
      ticket.type === TicketType.BILLING ||
      ticket.status === TicketStatus.IN_PROGRESS
    )
      return 'Medium';
    return 'Low';
  }
}

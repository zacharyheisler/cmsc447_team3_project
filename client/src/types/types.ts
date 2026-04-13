export type TicketType =
  | 'BUG'
  | 'TECH_SUPPORT'
  | 'ACCOUNT'
  | 'BILLING'
  | 'FEATURE_REQUEST'
  | 'OTHER';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_ON_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority = 'Low' | 'Medium' | 'High';

export interface Ticket {
	ticketId: number;
	title: string;
	description: string;
	type: TicketType;
	status: TicketStatus;
	createdAt: string;
	updatedAt?: string;
	customer?: string;
	assignedAgentId: number | null;
	priority?: TicketPriority;
  messages: any[];
  statusHistory: any[];
}

export interface TicketFilters {
  query: string;
  statuses: TicketStatus[];
  timeRanges: Array<'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS'>;
  sortBy: 'NEWEST' | 'OLDEST' | 'STATUS';
}

export interface NewTicketInput {
  title: string;
  description: string;
  type: TicketType;
}

export type Agent = {
  id: number;
  name: string;
};

import { Link } from 'react-router-dom';
import {
  formatDate,
  getRelativeTimeLabel,
  STATUS_CLASSES,
  STATUS_LABELS,
  TYPE_ICONS,
  TYPE_LABELS,
} from '../config/dashboardConfig';
import type { Ticket } from '../types/types';

interface TicketRowProps {
  ticket: Ticket;
}

export default function TicketRow({ ticket }: Readonly<TicketRowProps>) {
  const ticketPath = `/tickets/${ticket.ticketId}`;
  const referenceDate = ticket.updatedAt || ticket.createdAt;

  return (
    <tr className="ticket-row">
      <td className="w-24 px-3 py-3 text-xs font-mono text-slate-500">
        <Link className="ticket-row-link" to={ticketPath} aria-label={`Open ticket ${ticket.ticketId}`}>
          #{ticket.ticketId}
        </Link>
      </td>

      <td className="px-3 py-3">
        <Link className="ticket-row-link" to={ticketPath}>
          <p className="line-clamp-1 text-sm font-medium text-slate-900">{ticket.title}</p>
        </Link>
      </td>

      <td className="px-3 py-3">
        <Link className="ticket-row-link" to={ticketPath}>
          <p className="line-clamp-2 text-xs text-slate-500">{ticket.description}</p>
        </Link>
      </td>

      <td className="w-40 px-3 py-3">
        <Link className="ticket-row-link" to={ticketPath}>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[ticket.status]}`}
          >
            {STATUS_LABELS[ticket.status]}
          </span>
        </Link>
      </td>

      <td className="w-40 px-3 py-3 text-xs text-slate-600">
        <Link className="ticket-row-link" to={ticketPath}>
          <span className="inline-flex items-center gap-1">
            {TYPE_ICONS[ticket.type]}
            {TYPE_LABELS[ticket.type]}
          </span>
        </Link>
      </td>

      <td className="w-40 px-3 py-3 text-xs text-slate-500">
        <Link className="ticket-row-link" to={ticketPath}>
          <p className="text-[16px]!">{formatDate(referenceDate)}</p>
          <p className="mt-1 text-[12px]! text-slate-400">{getRelativeTimeLabel(referenceDate)}</p>
        </Link>
      </td>
    </tr>
  );
}

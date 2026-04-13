import TicketRow from './TicketRow';
import { FaPlus } from 'react-icons/fa6';
import type { Ticket } from '../types/types';

interface TicketTableProps {
  tickets: Ticket[];
  currentPage: number;
  rowsPerPage: number;
  totalTickets: number;
  onPageChange: (nextPage: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onOpenCreateModal: () => void;
}

export default function TicketTable({
  tickets,
  currentPage,
  rowsPerPage,
  totalTickets,
  onPageChange,
  onRowsPerPageChange,
  onOpenCreateModal,
}: Readonly<TicketTableProps>) {
  const totalPages = Math.max(1, Math.ceil(totalTickets / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalTickets);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-sm text-slate-500">
        <p>Showing {startIndex + 1} to {Math.max(startIndex + 1, endIndex)} of {totalTickets} tickets</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <FaPlus size={11} />
            Create
          </button>
          <label htmlFor="rows-per-page" className="text-xs text-slate-500">Rows per page</label>
          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
            className="h-8 rounded-md border border-slate-200 px-2 text-xs text-slate-700 outline-none focus:border-[var(--focus-accent)]"
          >
            {[5, 10, 20].map((rows) => (
              <option key={rows} value={rows}>{rows}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="ticket-table w-full min-w-245 border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="w-24 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Ticket ID</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Title</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Description</th>
              <th className="w-40 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
              <th className="w-40 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Type</th>
              <th className="w-40 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Last Updated</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => (
              <TicketRow
                key={ticket.ticketId}
                ticket={ticket}
              />
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <p className="text-xs text-slate-500">Page {currentPage} of {totalPages}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </footer>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowsRotate, FaCircleInfo, FaPlus } from 'react-icons/fa6';
import CreateTicketModal from '../../../components/CreateTicketModal';
import TicketTable from '../../../components/TicketTable';
import TicketToolbar from '../../../components/TicketToolbar';
import { STATUS_SUMMARY_META } from '../../../config/dashboardConfig';
import { apiFetch } from '../../../utils/api';
import type { NewTicketInput, Ticket, TicketFilters, TicketStatus } from '../../../types/types';
import './UserDashboard.css';

interface ToastMessage {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'info';
}

const DEFAULT_FILTERS: TicketFilters = {
  query: '',
  statuses: [],
  timeRanges: [],
  sortBy: 'NEWEST',
};

const statusOrder: Record<TicketStatus, number> = {
  OPEN: 1,
  IN_PROGRESS: 2,
  WAITING_ON_CUSTOMER: 3,
  RESOLVED: 4,
  CLOSED: 5,
};

function shouldIncludeDate(dateIso: string, dateRange: TicketFilters['timeRanges'][number]): boolean {

  const now = new Date();
  const created = new Date(dateIso);
  const diffMs = now.getTime() - created.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (dateRange === 'TODAY') {
    return now.toDateString() === created.toDateString();
  }
  if (dateRange === 'LAST_7_DAYS') {
    return diffDays <= 7;
  }
  return diffDays <= 30;
}

function matchesAnySelectedTimeRange(
  dateIso: string,
  timeRanges: TicketFilters['timeRanges'],
): boolean {
  if (timeRanges.length === 0) {
    return true;
  }

  return timeRanges.some((range) => shouldIncludeDate(dateIso, range));
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [filters, setFilters] = useState<TicketFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, ...toast }]);
    globalThis.setTimeout(dismissToast, 5000, id);
  };

  const loadTickets = async () => {
    setLoadError(null);
    setIsLoading(true);

    try {
      const userId = sessionStorage.getItem('USER_ID');
      if (!userId) throw new Error('Not authenticated');

      const data = await apiFetch<any[]>(`/tickets?userId=${userId}`);

      const mapped: Ticket[] = data.map((t) => ({
        ticketId: t.ticketId,
        title: t.description,
        description: t.description,
        type: t.type,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.createdAt,
        assignedAgentId: t.assignedToId ?? null,
        messages: t.messages ?? [],
        statusHistory: t.statusHistory ?? [],
      }));

      setTickets(mapped);
      setLastUpdated(new Date());
    } catch {
      setLoadError('Failed to load your tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  const summaryCounts = useMemo(() => {
    return tickets.reduce(
      (acc, ticket) => {
        acc[ticket.status] += 1;
        return acc;
      },
      {
        OPEN: 0,
        IN_PROGRESS: 0,
        WAITING_ON_CUSTOMER: 0,
        RESOLVED: 0,
        CLOSED: 0,
      } as Record<TicketStatus, number>,
    );
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    const visible = tickets.filter((ticket) => {
      const matchesQuery =
        q.length === 0 ||
        ticket.title.toLowerCase().includes(q) ||
        ticket.description.toLowerCase().includes(q) ||
        String(ticket.ticketId).includes(q);

      const matchesStatus =
        filters.statuses.length === 0 || filters.statuses.includes(ticket.status);
      const matchesDate = matchesAnySelectedTimeRange(ticket.updatedAt || ticket.createdAt, filters.timeRanges);

      return matchesQuery && matchesStatus && matchesDate;
    });

    const sorted = [...visible];
    if (filters.sortBy === 'NEWEST') {
      sorted.sort((a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(),
      );
    } else if (filters.sortBy === 'OLDEST') {
      sorted.sort((a, b) =>
        new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime(),
      );
    } else {
      sorted.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }
    return sorted;
  }, [filters, tickets]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageTickets = filteredTickets.slice(pageStart, pageStart + rowsPerPage);

  const handleFilterChange = (next: Partial<TicketFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };

  const handleCreateTicket = async (payload: NewTicketInput) => {
    const userId = sessionStorage.getItem('USER_ID');
    if (!userId) throw new Error('Not authenticated');

    const created = await apiFetch<any>('/tickets', {
      method: 'POST',
      body: JSON.stringify({
        type: payload.type,
        description: payload.description,
        createdById: Number(userId),
      }),
    });

    const newTicket: Ticket = {
      ticketId: created.ticketId,
      title: created.description,
      description: created.description,
      type: created.type,
      status: created.status,
      createdAt: created.createdAt,
      updatedAt: created.createdAt,
      assignedAgentId: created.assignedToId ?? null,
      messages: [],
      statusHistory: [],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setCurrentPage(1);
    addToast({ variant: 'success', message: `Ticket #${newTicket.ticketId} created successfully.` });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTickets();
    setIsRefreshing(false);
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('USER_ROLE');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-grotesk)] text-lg font-bold tracking-tight text-slate-900">My Tickets</h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Last updated:{' '}
              {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-50"
              disabled={isRefreshing}
            >
              <FaArrowsRotate className={isRefreshing ? 'dashboard-spin' : ''} size={11} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {STATUS_SUMMARY_META.map((item) => (
            <article key={item.key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`inline-flex items-center gap-2 text-xs uppercase tracking-wide ${item.iconColorClass}`}>
                {item.icon}
                {item.label}
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{summaryCounts[item.key]}</p>
            </article>
          ))}
        </section>

        <TicketToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {isLoading && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-2">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="dashboard-skeleton-row" />
              ))}
            </div>
          </section>
        )}

        {!isLoading && loadError && (
          <section className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
            <p className="text-sm text-rose-700">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadTickets()}
              className="mt-3 rounded-lg bg-white px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-100"
            >
              Retry
            </button>
          </section>
        )}

        {!isLoading && !loadError && filteredTickets.length === 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <FaCircleInfo className="mx-auto text-slate-400" size={20} />
            <p className="mt-3 text-sm text-slate-700">No tickets found for your current search and filters.</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-(--primary-button) px-3 py-2 text-sm text-white transition hover:brightness-90"
              >
                <FaPlus size={12} />
                New Ticket
              </button>
            </div>
          </section>
        )}

        {!isLoading && !loadError && filteredTickets.length > 0 && (
          <TicketTable
            tickets={pageTickets}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            totalTickets={filteredTickets.length}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        )}
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateTicket}
      />

      <aside className="dashboard-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`dashboard-toast dashboard-toast--${toast.variant}`}>
            <span>{toast.message}</span>
            <button
              type="button"
              className="dashboard-toast__action"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              Dismiss
            </button>
          </div>
        ))}
      </aside>
    </div>
  );
}

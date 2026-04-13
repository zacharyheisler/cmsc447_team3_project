import { useEffect, useMemo, useRef, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaFilter, FaMagnifyingGlass } from 'react-icons/fa6';
import {
  SORT_OPTIONS,
} from '../config/dashboardConfig';
import type { TicketFilters, TicketStatus } from '../types/types';

interface TicketToolbarProps {
  filters: TicketFilters;
  onFilterChange: (next: Partial<TicketFilters>) => void;
}

export default function TicketToolbar({
  filters,
  onFilterChange,
}: Readonly<TicketToolbarProps>) {
  type TimeRange = TicketFilters['timeRanges'][number];

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isStatusSectionOpen, setIsStatusSectionOpen] = useState(false);
  const [isTimeSectionOpen, setIsTimeSectionOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const statusOptions = useMemo<Array<{ value: TicketStatus; label: string }>>(
    () => [
      { value: 'OPEN', label: 'Open' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'WAITING_ON_CUSTOMER', label: 'Pending' },
      { value: 'RESOLVED', label: 'Resolved' },
      { value: 'CLOSED', label: 'Closed' },
    ],
    [],
  );
  const timeOptions = useMemo<Array<{ value: TimeRange; label: string }>>(
    () => [
      { value: 'TODAY', label: 'Today' },
      { value: 'LAST_7_DAYS', label: 'Last 7 days' },
      { value: 'LAST_30_DAYS', label: 'Last 30 days' },
    ],
    [],
  );

  const activeFilterCount = filters.statuses.length + filters.timeRanges.length;

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsSortOpen(false);
        setIsFilterOpen(false);
      }
    };

    globalThis.addEventListener('mousedown', onPointerDown);
    return () => globalThis.removeEventListener('mousedown', onPointerDown);
  }, []);

  const setSort = (sortBy: TicketFilters['sortBy']) => {
    onFilterChange({ sortBy });
    setIsSortOpen(false);
  };

  const toggleStatus = (status: NonNullable<TicketFilters['statuses'][number]>) => {
    const nextStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((item) => item !== status)
      : [...filters.statuses, status];
    onFilterChange({ statuses: nextStatuses });
  };

  const toggleTimeRange = (timeRange: NonNullable<TicketFilters['timeRanges'][number]>) => {
    const nextTimeRanges = filters.timeRanges.includes(timeRange)
      ? filters.timeRanges.filter((item) => item !== timeRange)
      : [...filters.timeRanges, timeRange];
    onFilterChange({ timeRanges: nextTimeRanges });
  };

  return (
    <section ref={panelRef}>
      <div className="flex flex-col gap-3">
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative w-full lg:max-w-md">
            <span className="sr-only">Search tickets</span>
            <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input
              value={filters.query}
              onChange={(event) => onFilterChange({ query: event.target.value })}
              placeholder="Search by title, ID, or description"
              className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3.5 text-sm text-slate-800 outline-none transition focus:border-[var(--focus-accent)] focus:ring-2 focus:ring-[var(--focus-accent-soft)]"
            />
          </label>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsSortOpen((prev) => !prev);
                  setIsFilterOpen(false);
                }}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100"
              >
                {isSortOpen ? <FaChevronUp size={11} /> : <FaChevronDown size={11} />}
                Sort: {SORT_OPTIONS.find((option) => option.value === filters.sortBy)?.label ?? 'Newest first'}
              </button>

              {isSortOpen && (
                <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <ul className="space-y-1">
                    {SORT_OPTIONS.map((option) => {
                      const selected = filters.sortBy === option.value;
                      return (
                        <li key={option.value}>
                          <button
                            type="button"
                            onClick={() => setSort(option.value)}
                            className={`w-full rounded-md border px-3 py-1.5 text-left text-sm transition ${selected ? 'border-[var(--focus-accent)] bg-[var(--focus-accent-soft)] text-[color:var(--focus-accent)]' : 'border-transparent text-slate-700 hover:bg-slate-100'}`}
                          >
                            {option.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsFilterOpen((prev) => !prev);
                  setIsSortOpen(false);
                }}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-800 transition hover:border-slate-300 hover:bg-slate-100"
              >
                <FaFilter size={12} />
                Add Filter
                {activeFilterCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--focus-accent-soft)] px-1.5 text-xs font-semibold text-[color:var(--focus-accent)]">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  <div className="space-y-1.5">
                    <section className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setIsStatusSectionOpen((prev) => !prev)}
                        className="flex h-8 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left transition hover:border-slate-300 hover:bg-slate-100"
                      >
                        <span className="text-sm font-semibold leading-none text-slate-700">Status</span>
                        <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                          {filters.statuses.length > 0 ? `${filters.statuses.length} selected` : 'All'}
                          {isStatusSectionOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </span>
                      </button>
                      {isStatusSectionOpen && (
                        <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-2">
                          {statusOptions.map((option) => {
                            const selected = filters.statuses.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleStatus(option.value)}
                                className={`w-full rounded-md border px-3 py-1.5 text-left text-sm transition ${selected ? 'border-[var(--focus-accent)] bg-[var(--focus-accent-soft)] text-[color:var(--focus-accent)]' : 'border-transparent bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    <section className="space-y-1">
                      <button
                        type="button"
                        onClick={() => setIsTimeSectionOpen((prev) => !prev)}
                        className="flex h-8 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left transition hover:border-slate-300 hover:bg-slate-100"
                      >
                        <span className="text-sm font-semibold leading-none text-slate-700">Time</span>
                        <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                          {filters.timeRanges.length > 0 ? `${filters.timeRanges.length} selected` : 'All'}
                          {isTimeSectionOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </span>
                      </button>
                      {isTimeSectionOpen && (
                        <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-2">
                          {timeOptions.map((option) => {
                            const selected = filters.timeRanges.includes(option.value);
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleTimeRange(option.value)}
                                className={`w-full rounded-md border px-3 py-1.5 text-left text-sm transition ${selected ? 'border-[var(--focus-accent)] bg-[var(--focus-accent-soft)] text-[color:var(--focus-accent)]' : 'border-transparent bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    <button
                      type="button"
                      onClick={() => onFilterChange({ statuses: [], timeRanges: [] })}
                      className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

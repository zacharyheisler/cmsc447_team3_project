import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa6';
import { TYPE_LABELS } from '../config/dashboardConfig';
import type { NewTicketInput, TicketType } from '../types/types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: NewTicketInput) => Promise<void>;
}

const INITIAL_FORM: NewTicketInput = {
  title: '',
  description: '',
  type: 'BUG',
};

export default function CreateTicketModal({
  isOpen,
  onClose,
  onCreate,
}: Readonly<CreateTicketModalProps>) {
  const [form, setForm] = useState<NewTicketInput>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const hasValidTitle = form.title.trim().length >= 5;
  const hasValidDescription = form.description.trim().length >= 15;
  const isSubmitDisabled = !hasValidTitle || !hasValidDescription || isSubmitting;

  const handleModalClose = () => {
    if (isSubmitting) {
      return;
    }
    setForm(INITIAL_FORM);
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onCreate({
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
      });
      setForm(INITIAL_FORM);
      onClose();
    } catch {
      setSubmitError('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal-card">
        <header className="mb-4 border-b border-slate-200 pb-3">
          <h2 id="new-ticket-title" className="text-base font-semibold text-slate-900">Create a new ticket.</h2>
        </header>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div>
            <label htmlFor="ticket-title" className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input
              id="ticket-title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Example: Unable to upload invoice"
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--focus-accent)] focus:ring-2 focus:ring-[var(--focus-accent-soft)]"
              maxLength={120}
            />
          </div>

          <div>
            <label htmlFor="ticket-description" className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              id="ticket-description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Add details, steps to reproduce, and expected behavior."
              className="min-h-28 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-[var(--focus-accent)] focus:ring-2 focus:ring-[var(--focus-accent-soft)]"
              maxLength={1000}
            />
          </div>

          <div>
              <label htmlFor="ticket-type" className="mb-1 block text-sm font-medium text-slate-700">Type</label>
              <div className="relative">
                <select
                  id="ticket-type"
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as TicketType }))}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-800 outline-none transition hover:bg-slate-50 focus:border-[var(--focus-accent)] focus:ring-2 focus:ring-[var(--focus-accent-soft)]"
                >
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <FaChevronDown
                  size={12}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
              </div>
            </div>

          {submitError && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {submitError}
            </p>
          )}

          <footer className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="h-10 rounded-lg bg-[var(--focus-accent)] px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

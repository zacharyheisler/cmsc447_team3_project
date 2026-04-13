import type { ReactNode } from 'react';
import {
  FaBug,
  FaHeadset,
  FaUser,
  FaCreditCard,
  FaLightbulb,
  FaCircleQuestion,
  FaClock,
  FaCircleCheck,
  FaCircleXmark,
  FaFolderOpen,
  FaArrowsRotate,
} from 'react-icons/fa6';
import type { TicketStatus, TicketType } from '../types/types';

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_ON_CUSTOMER: 'Pending',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const STATUS_CLASSES: Record<TicketStatus, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  WAITING_ON_CUSTOMER: 'bg-orange-100 text-orange-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-200 text-slate-700',
};

export const TYPE_LABELS: Record<TicketType, string> = {
  BUG: 'Bug',
  TECH_SUPPORT: 'Tech Support',
  ACCOUNT: 'Account',
  BILLING: 'Billing',
  FEATURE_REQUEST: 'Feature Request',
  OTHER: 'Other',
};

export const TYPE_ICONS: Record<TicketType, ReactNode> = {
  BUG: <FaBug size={12} aria-hidden="true" />,
  TECH_SUPPORT: <FaHeadset size={12} aria-hidden="true" />,
  ACCOUNT: <FaUser size={12} aria-hidden="true" />,
  BILLING: <FaCreditCard size={12} aria-hidden="true" />,
  FEATURE_REQUEST: <FaLightbulb size={12} aria-hidden="true" />,
  OTHER: <FaCircleQuestion size={12} aria-hidden="true" />,
};

export const STATUS_FILTER_OPTIONS: Array<{ value: 'ALL' | TicketStatus; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_ON_CUSTOMER', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export const TYPE_FILTER_OPTIONS: Array<{ value: 'ALL' | TicketType; label: string }> = [
  { value: 'ALL', label: 'All types' },
  { value: 'BUG', label: 'Bug' },
  { value: 'TECH_SUPPORT', label: 'Tech Support' },
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request' },
  { value: 'OTHER', label: 'Other' },
];

export const DATE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Any time' },
  { value: 'TODAY', label: 'Today' },
  { value: 'LAST_7_DAYS', label: 'Last 7 days' },
  { value: 'LAST_30_DAYS', label: 'Last 30 days' },
] as const;

export const SORT_OPTIONS = [
  { value: 'NEWEST', label: 'Newest first' },
  { value: 'OLDEST', label: 'Oldest first' },
  { value: 'STATUS', label: 'Status' },
] as const;

export function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getRelativeTimeLabel(dateIso: string): string {
  const now = Date.now();
  const then = new Date(dateIso).getTime();
  const diffHours = Math.floor((now - then) / (1000 * 60 * 60));

  if (diffHours < 1) {
    return 'Less than an hour ago';
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export const STATUS_SUMMARY_META: Array<{
  key: TicketStatus;
  label: string;
  icon: ReactNode;
  iconColorClass: string;
}> = [
  { key: 'OPEN', label: 'Open', icon: <FaFolderOpen size={14} />, iconColorClass: 'text-blue-700' },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: <FaArrowsRotate size={14} />, iconColorClass: 'text-yellow-700' },
  { key: 'WAITING_ON_CUSTOMER', label: 'Pending', icon: <FaClock size={14} />, iconColorClass: 'text-orange-700' },
  { key: 'RESOLVED', label: 'Resolved', icon: <FaCircleCheck size={14} />, iconColorClass: 'text-emerald-700' },
  { key: 'CLOSED', label: 'Closed', icon: <FaCircleXmark size={14} />, iconColorClass: 'text-slate-700' },
];

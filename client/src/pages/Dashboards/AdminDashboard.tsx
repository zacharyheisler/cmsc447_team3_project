import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { STATUS_LABELS, TYPE_LABELS } from "../../config/dashboardConfig";
import { apiFetch } from "../../utils/api";
import type { TicketStatus, TicketType } from "../../types/types";

type AdminTicket = {
  ticketId: number;
  title: string;
  status: TicketStatus;
  priority: string;
  type: TicketType;
  assignedToId: number | null;
  updatedAt: string;
  createdBy?: {
    username?: string;
  };
};

type AdminUser = {
  userId: number;
  username: string;
  email: string;
  role: string;
  agent?: {
    agentId: number;
  } | null;
};

type AgentOption = {
  id: number;
  name: string;
};

type DashboardStats = {
  totalUsers?: number;
  totalTickets?: number;
  openTickets?: number;
  unassignedTickets?: number;
  inProgressTickets?: number;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAdminData() {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, ticketData, userData] = await Promise.all([
        apiFetch<DashboardStats>("/admin/dashboard"),
        apiFetch<AdminTicket[]>("/admin/tickets"),
        apiFetch<AdminUser[]>("/admin/users"),
      ]);

      setStats(dashboardData);
      setTickets(ticketData);

      setAgents(
        userData
          .filter((user) => user.role === "agent" && user.agent?.agentId != null)
          .map((user) => ({
            id: user.agent!.agentId,
            name: user.username,
          }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  function handleSignOut() {
    sessionStorage.removeItem("USER_ROLE");
    sessionStorage.removeItem("ACCESS_TOKEN");
    sessionStorage.removeItem("REFRESH_TOKEN");
    navigate("/login");
  }

  function getAgentName(agentId: number | null) {
    if (agentId === null) return "Unassigned";
    const match = agents.find((agent) => agent.id === agentId);
    return match ? match.name : "Unknown Agent";
  }

  async function handleAssign(ticketId: number, agentId: number | null) {
    try {
      setError("");

      const updatedTicket = await apiFetch<AdminTicket>(
        `/admin/tickets/${ticketId}/assign`,
        {
          method: "PATCH",
          body: JSON.stringify({ agentId }),
        }
      );

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.ticketId === ticketId ? updatedTicket : ticket
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign ticket.");
    }
  }

  const openTickets =
    stats?.openTickets ?? tickets.filter((ticket) => ticket.status === "OPEN").length;

  const unassignedTickets =
    stats?.unassignedTickets ??
    tickets.filter((ticket) => ticket.assignedToId === null).length;

  const inProgressTickets =
    stats?.inProgressTickets ??
    tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-800">
        <div className="mx-auto max-w-7xl">
          <p className="text-lg font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="mt-2 text-lg text-slate-600">
              Monitor ticket flow, assign work to agents, and manage user accounts.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:self-auto"
          >
            Sign out
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Open Tickets</p>
            <p className="mt-2 text-3xl font-bold">{openTickets}</p>
            <p className="mt-1 text-sm text-slate-500">
              Tickets currently awaiting resolution
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Unassigned Tickets</p>
            <p className="mt-2 text-3xl font-bold">{unassignedTickets}</p>
            <p className="mt-1 text-sm text-slate-500">
              Tickets not yet assigned to an agent
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">In Progress</p>
            <p className="mt-2 text-3xl font-bold">{inProgressTickets}</p>
            <p className="mt-1 text-sm text-slate-500">
              Tickets actively being worked on
            </p>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">All Tickets</h2>
                <p className="text-sm text-slate-500">
                  Review every ticket and assign agents as needed.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                          #{ticket.ticketId}
                        </span>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {STATUS_LABELS[ticket.status] ?? ticket.status}
                        </span>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          {ticket.priority}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold">{ticket.title}</h3>

                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-medium">Customer:</span>{" "}
                          {ticket.createdBy?.username ?? "Unknown"}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {TYPE_LABELS[ticket.type] ?? ticket.type}
                        </p>
                        <p>
                          <span className="font-medium">Assigned Agent:</span>{" "}
                          {getAgentName(ticket.assignedToId)}
                        </p>
                        <p>
                          <span className="font-medium">Last Updated:</span>{" "}
                          {new Date(ticket.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-3">
                      <label className="text-sm font-medium text-slate-700">
                        Assign to agent
                      </label>
                      <select
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={ticket.assignedToId ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleAssign(
                            ticket.ticketId,
                            value === "" ? null : Number(value)
                          );
                        }}
                      >
                        <option value="">Unassigned</option>
                        {agents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name}
                          </option>
                        ))}
                      </select>

                      <Link
                        to={`/tickets/${ticket.ticketId}`}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-700"
                      >
                        Open Ticket
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {tickets.length === 0 && (
                <p className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
                  No tickets found.
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Admin Tools</h2>
              <p className="mt-2 text-sm text-slate-500">
                Manage user accounts and monitor system activity.
              </p>

              <div className="mt-4">
                <Link
                  to="/accounts"
                  className="block rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition hover:bg-blue-500"
                >
                  Manage Accounts
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">System Snapshot</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Total Users: {stats?.totalUsers ?? "N/A"}</li>
                <li>Total Tickets: {stats?.totalTickets ?? tickets.length}</li>
                <li>Available Agents: {agents.length}</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
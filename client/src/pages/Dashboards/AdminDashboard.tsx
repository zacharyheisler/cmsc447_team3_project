import { Link } from "react-router-dom";
import { useState } from "react";

type Agent = {
  id: number;
  name: string;
};

type Ticket = {
  id: number;
  title: string;
  customer: string;
  type: string;
  priority: string;
  status: string;
  assignedAgentId: number | null;
  lastUpdated: string;
};

const agents: Agent[] = [
  { id: 1, name: "Agent Smith" },
  { id: 2, name: "Agent Johnson" },
  { id: 3, name: "Agent Lee" },
];

const initialTickets: Ticket[] = [
  {
    id: 101,
    title: "Unable to log in",
    customer: "Alice Carter",
    type: "Login",
    priority: "High",
    status: "Open",
    assignedAgentId: null,
    lastUpdated: "10 min ago",
  },
  {
    id: 102,
    title: "Billing question",
    customer: "Brian Lee",
    type: "Billing",
    priority: "Medium",
    status: "In Progress",
    assignedAgentId: 2,
    lastUpdated: "25 min ago",
  },
  {
    id: 103,
    title: "Feature request for dashboard",
    customer: "Chris Doe",
    type: "Feature Request",
    priority: "Low",
    status: "Open",
    assignedAgentId: null,
    lastUpdated: "1 hour ago",
  },
  {
    id: 104,
    title: "Account verification problem",
    customer: "Dana Fox",
    type: "Account",
    priority: "High",
    status: "Pending",
    assignedAgentId: 1,
    lastUpdated: "2 hours ago",
  },
];

function getAgentName(agentId: number | null) {
  if (agentId === null) return "Unassigned";
  const match = agents.find((agent) => agent.id === agentId);
  return match ? match.name : "Unknown Agent";
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  function handleAssign(ticketId: number, agentId: number | null) {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, assignedAgentId: agentId }
          : ticket
      )
    );
  }

  const openTickets = tickets.filter((ticket) => ticket.status === "Open").length;
  const unassignedTickets = tickets.filter(
    (ticket) => ticket.assignedAgentId === null
  ).length;
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-slate-600">
            Monitor ticket flow, assign work to agents, and manage user accounts.
          </p>
        </header>

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
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm">
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
                  key={ticket.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                          #{ticket.id}
                        </span>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                          {ticket.status}
                        </span>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                          {ticket.priority}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold">{ticket.title}</h3>

                      <div className="space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-medium">Customer:</span> {ticket.customer}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span> {ticket.type}
                        </p>
                        <p>
                          <span className="font-medium">Assigned Agent:</span>{" "}
                          {getAgentName(ticket.assignedAgentId)}
                        </p>
                        <p>
                          <span className="font-medium">Last Updated:</span>{" "}
                          {ticket.lastUpdated}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-3">
                      <label className="text-sm font-medium text-slate-700">
                        Assign to agent
                      </label>
                      <select
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={ticket.assignedAgentId ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleAssign(ticket.id, value === "" ? null : Number(value));
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
                        to={`/ticket/${ticket.id}`}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-slate-700"
                      >
                        Open Ticket
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
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
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Ticket #101 was created by Alice Carter.</li>
                <li>Ticket #102 was assigned to Agent Johnson.</li>
                <li>Ticket #104 is pending account verification follow-up.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
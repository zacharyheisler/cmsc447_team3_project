import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Ticket, TicketStatus } from "../../types/types";
import { parseJwtPayload } from "../../utils/api";

const STATUS_LABELS: Record<TicketStatus, string> = {
	OPEN: "Open",
	IN_PROGRESS: "In Progress",
	WAITING_ON_CUSTOMER: "Awaiting Reply",
	RESOLVED: "Resolved",
	CLOSED: "Closed",
};

type SummaryCard = {
	label: string;
	value: string;
	detail: string;
};

type AgentDashboardData = {
	summaryCards: SummaryCard[];
	assignedTickets: Ticket[];
	teamQueue: string[];
	recentActivity: string[];
	todaysFocus: {
		firstResponseTarget: string;
		customerRepliesWaiting: number;
	};
	priorityTicketId: number | null;
	featureRequestTicketId: number | null;
};

function getStatusClasses() {
	return "bg-(--surface-muted) text-(--headings-text)";
}

function formatDate(value?: string) {
	if (!value) return "recently";
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(value));
}

export default function AgentDashboard() {
	const navigate = useNavigate();
	const [agentName, setAgentName] = useState("Agent");
	const [dashboardData, setDashboardData] = useState<AgentDashboardData | null>(null);
	const [loadError, setLoadError] = useState("");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadDashboard() {
			try {
				setIsLoading(true);
				setLoadError("");

				const token = sessionStorage.getItem("ACCESS_TOKEN");
				const user = token ? parseJwtPayload<{
					sub: number;
					username: string;
					role: string;
				}>(token) : null;

				if (!user) throw new Error("Not logged in");

				// Get this agent's record by their userId
				const agentRes = await fetch(`http://localhost:3000/tickets/agent-by-user/${user.sub}`);
				if (!agentRes.ok) throw new Error("Unable to load agent");
				const agentData = await agentRes.json();

				setAgentName(user.username);

				const dashboardResponse = await fetch(`http://localhost:3000/agent-dashboard/${agentData.agentId}`);
				if (!dashboardResponse.ok) throw new Error("Unable to load agent dashboard");

				const data = (await dashboardResponse.json()) as AgentDashboardData;
				setDashboardData(data);
			} catch (error) {
				setLoadError(error instanceof Error ? error.message : "Unable to load agent dashboard");
			} finally {
				setIsLoading(false);
			}
		}

		void loadDashboard();
	}, []);

	function handleSignOut() {
		sessionStorage.removeItem("USER_ROLE");
		navigate("/login");
	}

	return (
		<div className="min-h-screen w-full bg-linear-to-br from-(--surface-base) via-(--surface-raised) to-(--surface-muted) px-4 py-6 md:px-6 lg:px-8">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
				<div className="flex justify-end">
					<button
						type="button"
						onClick={handleSignOut}
						className="rounded-lg border border-(--border-default) bg-(--surface-base) px-4 py-2 text-sm font-medium text-(--headings-text) transition hover:bg-(--surface-muted)"
					>
						Sign out
					</button>
				</div>
				<section className="overflow-hidden rounded-3xl border border-(--border-default) bg-(--surface-base) shadow-[0_12px_30px_rgba(31,35,40,0.08)]">
					<div className="grid lg:grid-cols-[1.4fr_0.9fr]">
						<div className="bg-(--accent-gray-blue) px-6 py-8 text-(--surface-base) md:px-8 md:py-10">
							<p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
								Agent Dashboard
							</p>
							<h2 className="mb-3 font-bold">Welcome back, Agent.</h2>
							<p className="max-w-2xl text-[1.02rem] leading-7 text-white/78">
								Here&apos;s a snapshot of your current queue, what needs attention soon,
								and the tickets you&apos;re actively driving forward today.
							</p>

							<div className="mt-6 flex flex-wrap gap-3">
								<Link
									to={`/tickets/${dashboardData?.priorityTicketId ?? ""}`}
									className="inline-flex min-h-11 items-center justify-center rounded-lg bg-(--primary-button) px-5 py-3 text-sm font-semibold text-(--surface-base) no-underline transition hover:brightness-95"
								>
									Open Priority Ticket
								</Link>
								<Link
									to={`/tickets/${dashboardData?.featureRequestTicketId ?? ""}`}
									className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/30 bg-white/8 px-5 py-3 text-sm font-semibold text-(--surface-base) no-underline transition hover:bg-white/14"
								>
									Review Feature Request
								</Link>
							</div>
						</div>

						<div className="flex flex-col justify-between gap-4 bg-(--surface-raised) px-6 py-8 md:px-8 md:py-10">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.22em] text-(--body-text)">
									Today&apos;s Focus
								</p>
								<h3 className="mt-2 text-(--headings-text)">Keep high-priority work moving, {agentName}.</h3>
							</div>

							<div className="grid gap-3">
								<div className="rounded-2xl border border-(--border-default) bg-(--surface-base) p-4">
									<p className="text-sm text-(--body-text)">First response target</p>
									<p className="mt-1 text-2xl font-bold text-(--headings-text)">
										{dashboardData?.todaysFocus.firstResponseTarget ?? "30 min"}
									</p>
								</div>
								<div className="rounded-2xl border border-(--border-default) bg-(--surface-base) p-4">
									<p className="text-sm text-(--body-text)">Customer replies waiting</p>
									<p className="mt-1 text-2xl font-bold text-(--headings-text)">
										{dashboardData?.todaysFocus.customerRepliesWaiting ?? 0}
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{isLoading && (
					<div className="rounded-2xl border border-(--border-default) bg-(--surface-base) p-5 text-sm text-(--body-text)">
						Loading agent dashboard from the database...
					</div>
				)}

				{loadError && (
					<div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
						{loadError}
					</div>
				)}

				<section className="grid gap-4 md:grid-cols-3">
					{(dashboardData?.summaryCards ?? []).map((card) => (
						<div
							key={card.label}
							className="rounded-2xl border border-(--border-default) bg-(--surface-base) p-5 shadow-[0_6px_18px_rgba(31,35,40,0.05)]"
						>
							<p className="text-sm font-medium text-(--body-text)">{card.label}</p>
							<p className="mt-2 text-4xl font-bold text-(--headings-text)">{card.value}</p>
							<p className="mt-2 text-sm text-(--body-text)">{card.detail}</p>
						</div>
					))}
				</section>

				<section className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
					<div className="rounded-3xl border border-(--border-default) bg-(--surface-base) p-6 shadow-[0_8px_24px_rgba(31,35,40,0.06)]">
						<div className="mb-5 flex items-start justify-between gap-3">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--body-text)">
									Assigned Tickets
								</p>
								<h3 className="mt-2 text-(--headings-text)">Your active work</h3>
							</div>
							<span className="rounded-full bg-(--surface-muted) px-3 py-1 text-sm font-medium text-(--headings-text)">
								{dashboardData?.assignedTickets.length ?? 0} tickets
							</span>
						</div>

						<div className="flex flex-col gap-4">
							{dashboardData?.assignedTickets.length === 0 && (
								<p className="rounded-2xl border border-(--border-default) bg-(--surface-raised) p-4 text-sm text-(--body-text)">
									No tickets are assigned to this agent yet.
								</p>
							)}

							{dashboardData?.assignedTickets.map((ticket) => (
								<Link
									key={ticket.ticketId}
									to={`/tickets/${ticket.ticketId}`}
									className="block rounded-2xl border border-(--border-default) bg-(--surface-raised) p-4 no-underline transition hover:border-(--border-hover) hover:bg-(--surface-base)"
								>
									<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
										<div>
											<p className="text-lg font-semibold text-(--headings-text)">
												#{ticket.ticketId} {ticket.title}
											</p>
											<p className="mt-1 text-sm text-(--body-text)">
												{ticket.customer} • {ticket.type} • {ticket.priority} priority
											</p>
										</div>

										<span
											className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses()}`}
										>
											{STATUS_LABELS[ticket.status] ?? ticket.status}
										</span>
									</div>

									<div className="mt-4 flex items-center justify-between text-sm text-(--body-text)">
										<span>Last updated {formatDate(ticket.updatedAt)}</span>
										<span className="font-semibold text-(--primary-button)">Open ticket</span>
									</div>
								</Link>
							))}
						</div>
					</div>

					<div className="flex flex-col gap-6">
						<div className="rounded-3xl border border-(--border-default) bg-(--surface-base) p-6 shadow-[0_8px_24px_rgba(31,35,40,0.06)]">
							<p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--body-text)">
								Team Queue
							</p>
							<h3 className="mt-2 text-(--headings-text)">Needs attention</h3>

							<div className="mt-5 flex flex-col gap-3">
								{(dashboardData?.teamQueue ?? []).map((item) => (
									<div
										key={item}
										className="rounded-2xl border border-(--border-default) bg-(--surface-raised) p-4"
									>
										<p className="text-sm leading-6 text-(--body-text)">{item}</p>
									</div>
								))}
							</div>
						</div>

						<div className="rounded-3xl border border-(--border-default) bg-(--surface-base) p-6 shadow-[0_8px_24px_rgba(31,35,40,0.06)]">
							<p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--body-text)">
								Recent Activity
							</p>
							<h3 className="mt-2 text-(--headings-text)">Latest updates</h3>

							<div className="mt-5 flex flex-col gap-3">
								{(dashboardData?.recentActivity ?? []).map((item) => (
									<div key={item} className="rounded-2xl bg-(--surface-muted) p-4">
										<p className="text-sm leading-6 text-(--body-text)">{item}</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

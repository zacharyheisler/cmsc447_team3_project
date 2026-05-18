import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/api";

type Role = "user" | "agent" | "admin";

type Account = {
  userId: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  active: boolean;
  role: Role;
  isApproved: boolean;
  company?: {
    name?: string;
  } | null;
};

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAccounts() {
    try {
      setLoading(true);
      setError("");
      const users = await apiFetch<Account[]>("/admin/users");
      setAccounts(users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function approveUser(userId: number) {
    try {
      await apiFetch(`/admin/users/${userId}/approve`, { method: "PATCH" });
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve user.");
    }
  }

  async function changeRole(userId: number, role: Role) {
    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role.");
    }
  }

  async function toggleActive(userId: number, active: boolean) {
    try {
      await apiFetch(`/admin/users/${userId}/${active ? "deactivate" : "activate"}`, {
        method: "PATCH",
      });
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account status.");
    }
  }

  const stats = useMemo(() => {
    return {
      total: accounts.length,
      admins: accounts.filter((account) => account.role === "admin").length,
      agents: accounts.filter((account) => account.role === "agent").length,
      unapproved: accounts.filter((account) => !account.isApproved).length,
    };
  }, [accounts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-800">
        <div className="mx-auto max-w-7xl">
          <p className="text-lg font-medium">Loading accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold tracking-tight">
              Account Management
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Approve users, change roles, and activate or deactivate accounts.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-10 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Accounts</p>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Admins</p>
            <p className="mt-2 text-3xl font-bold">{stats.admins}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Agents</p>
            <p className="mt-2 text-3xl font-bold">{stats.agents}</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Unapproved</p>
            <p className="mt-2 text-3xl font-bold">{stats.unapproved}</p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">All Accounts</h2>
            <p className="text-sm text-slate-500">
              Manage registered users from the live database.
            </p>
          </div>

          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.userId}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1fr_1fr] xl:items-end">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      User ID
                    </label>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                      {account.userId}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      User
                    </label>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                      <p className="font-medium">{account.username}</p>
                      <p className="text-slate-500">{account.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Role
                    </label>
                    <select
                      value={account.role}
                      onChange={(e) =>
                        changeRole(account.userId, e.target.value as Role)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="user">user</option>
                      <option value="agent">agent</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Approval
                    </label>
                    <button
                      type="button"
                      onClick={() => approveUser(account.userId)}
                      disabled={account.isApproved}
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition ${
                        account.isApproved
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      }`}
                    >
                      {account.isApproved ? "Approved" : "Approve"}
                    </button>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Status
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleActive(account.userId, account.active)}
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition ${
                        account.active
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {account.active ? "Deactivate" : "Reactivate"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {accounts.length === 0 && (
              <p className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500">
                No accounts found.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
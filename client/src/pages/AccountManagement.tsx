import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MOCK_ACCOUNTS, type Account, type AccountRole } from "../demo/mockAccounts";

type Role = AccountRole;

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>([...MOCK_ACCOUNTS]);
  const [newAccount, setNewAccount] = useState({
    userId: "",
    name: "",
    email: "",
    role: "USER" as Role,
  });

  // Persist edits back to the shared mock array so other pages reflect them
  function persistToMock(updater: (account: Account) => void, id: number) {
    const target = MOCK_ACCOUNTS.find((a) => a.id === id);
    if (target) updater(target);
  }

  function handleUserIdChange(id: number, newUserId: string) {
    persistToMock((a) => { a.userId = newUserId; }, id);
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id ? { ...account, userId: newUserId } : account
      )
    );
  }

  function handleRoleChange(id: number, newRole: Role) {
    persistToMock((a) => { a.role = newRole; }, id);
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id ? { ...account, role: newRole } : account
      )
    );
  }

  function toggleVerified(id: number) {
    persistToMock((a) => { a.verified = !a.verified; }, id);
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id
          ? { ...account, verified: !account.verified }
          : account
      )
    );
  }

  function toggleActive(id: number) {
    persistToMock((a) => { a.active = !a.active; }, id);
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id ? { ...account, active: !account.active } : account
      )
    );
  }

  const stats = useMemo(() => {
    return {
      total: accounts.length,
      admins: accounts.filter((account) => account.role === "ADMIN").length,
      agents: accounts.filter((account) => account.role === "AGENT").length,
      unverified: accounts.filter((account) => !account.verified).length,
    };
  }, [accounts]);

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
              View, create, verify, edit, and deactivate accounts.
            </p>
          </div>
        </header>

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
            <p className="text-sm font-medium text-slate-500">Unverified</p>
            <p className="mt-2 text-3xl font-bold">{stats.unverified}</p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">All Accounts</h2>
            <p className="text-sm text-slate-500">
              Edit IDs, verify users, change roles, and deactivate accounts.
            </p>
          </div>

          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="grid gap-4 xl:grid-cols-[1.2fr_1.2fr_1fr_1fr_1fr_auto] xl:items-end">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      User ID
                    </label>
                    <input
                      type="text"
                      value={account.userId}
                      onChange={(e) =>
                        handleUserIdChange(account.id, e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      User
                    </label>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                      <p className="font-medium">{account.name}</p>
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
                        handleRoleChange(account.id, e.target.value as Role)
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="USER">USER</option>
                      <option value="AGENT">AGENT</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Verification
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleVerified(account.id)}
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition ${
                        account.verified
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                      }`}
                    >
                      {account.verified ? "Verified" : "Unverified"}
                    </button>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Status
                    </label>
                    <button
                      type="button"
                      onClick={() => toggleActive(account.id)}
                      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition ${
                        account.active
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {account.active ? "Deactivate" : "Reactivate"}
                    </button>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <p>
                      <span className="font-medium">State:</span>{" "}
                      {account.active ? "Active" : "Inactive"}
                    </p>
                    <p>
                      <span className="font-medium">Verified:</span>{" "}
                      {account.verified ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
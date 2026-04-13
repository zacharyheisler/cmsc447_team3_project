import { useMemo, useState } from "react";

type Role = "USER" | "AGENT" | "ADMIN";

type Account = {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: Role;
  verified: boolean;
  active: boolean;
};

const initialAccounts: Account[] = [
  {
    id: 1,
    userId: "u1001",
    name: "Alice Carter",
    email: "alice@example.com",
    role: "USER",
    verified: false,
    active: true,
  },
  {
    id: 2,
    userId: "a2001",
    name: "Brian Lee",
    email: "brian@example.com",
    role: "AGENT",
    verified: true,
    active: true,
  },
  {
    id: 3,
    userId: "adm3001",
    name: "Chris Doe",
    email: "chris@example.com",
    role: "ADMIN",
    verified: true,
    active: true,
  },
  {
    id: 4,
    userId: "u1002",
    name: "Dana Fox",
    email: "dana@example.com",
    role: "USER",
    verified: false,
    active: false,
  },
];

export default function AccountManagement() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [newAccount, setNewAccount] = useState({
    userId: "",
    name: "",
    email: "",
    role: "USER" as Role,
  });

  function handleUserIdChange(id: number, newUserId: string) {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id ? { ...account, userId: newUserId } : account
      )
    );
  }

  function handleRoleChange(id: number, newRole: Role) {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id ? { ...account, role: newRole } : account
      )
    );
  }

  function toggleVerified(id: number) {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id
          ? { ...account, verified: !account.verified }
          : account
      )
    );
  }

  function toggleActive(id: number) {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id ? { ...account, active: !account.active } : account
      )
    );
  }

  function handleCreateAccount() {
    if (
      !newAccount.userId.trim() ||
      !newAccount.name.trim() ||
      !newAccount.email.trim()
    ) {
      return;
    }

    const createdAccount: Account = {
      id: Date.now(),
      userId: newAccount.userId.trim(),
      name: newAccount.name.trim(),
      email: newAccount.email.trim(),
      role: newAccount.role,
      verified: false,
      active: true,
    };

    setAccounts((prev) => [createdAccount, ...prev]);
    setNewAccount({
      userId: "",
      name: "",
      email: "",
      role: "USER",
    });
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
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Account Management
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            View, create, verify, edit, and deactivate accounts.
          </p>
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

        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Create Account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add a new account to the system.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <input
              type="text"
              placeholder="User ID"
              value={newAccount.userId}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, userId: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <input
              type="text"
              placeholder="Full name"
              value={newAccount.name}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, name: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <input
              type="email"
              placeholder="Email"
              value={newAccount.email}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, email: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />

            <select
              value={newAccount.role}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  role: e.target.value as Role,
                }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="USER">USER</option>
              <option value="AGENT">AGENT</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <button
              type="button"
              onClick={handleCreateAccount}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Create Account
            </button>
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
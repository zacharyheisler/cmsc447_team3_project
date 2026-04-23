export type AccountRole = "USER" | "AGENT" | "ADMIN";

export type Account = {
  id: number;
  userId: string;
  name: string;
  email: string;
  role: AccountRole;
  verified: boolean;
  active: boolean;
};

// Shared, mutable mock accounts. Pages import this same array so edits made
// in one place (e.g. registration, account management) show up everywhere.
export const MOCK_ACCOUNTS: Account[] = [
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

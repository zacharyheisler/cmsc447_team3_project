// ticketScreenAccessTest.ts

// Mock Tickets
const ticketOwnedByUser = {
  ticketId: 1,
  createdById: 10,
  assignedToId: 20,
  type: "BUG",
  status: "OPEN",
};

const ticketAssignedToAgent = {
  ticketId: 2,
  createdById: 30,
  assignedToId: 40,
  type: "ACCOUNT",
  status: "IN_PROGRESS",
};

// mock viewers
const creatorUser = {
  userId: 10,
  role: "user",
};

const assignedAgent = {
  userId: 40,
  role: "agent",
};

const adminUser = {
  userId: 999,
  role: "admin",
};

const randomUser = {
  userId: 777,
  role: "user",
};

const randomAgent = {
  userId: 888,
  role: "agent",
};

// test cases
console.log("Creator can view own ticket (expected true):", {
  result: creatorUser.userId === ticketOwnedByUser.createdById,
});

console.log("Agent can view assigned ticket (expected true):", {
  result:
    assignedAgent.role === "agent" &&
    assignedAgent.userId === ticketAssignedToAgent.assignedToId,
});

console.log("Admin can view any ticket (expected true):", {
  result: adminUser.role === "admin",
});

console.log("Random user denied (expected false):", {
  result: randomUser.userId === ticketOwnedByUser.createdById,
});

console.log("Random agent denied (expected false):", {
  result:
    randomAgent.role === "agent" &&
    randomAgent.userId === ticketOwnedByUser.assignedToId,
});
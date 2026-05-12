// assignAgentTest.ts

// CONFIG
const BASE_URL = "http://localhost:3000";

// using existing ticket with ID = 13
const TEST_TICKET_ID = 13;

// using agent id = 3 from database
const AGENT_ID = 3;

// helper to fetch ticket 
async function getTicket() {
  const res = await fetch(`${BASE_URL}/tickets/${TEST_TICKET_ID}`);
  return res.json();
}

// helper to assign ticket to agent
async function assignAgent() {
  return fetch(`${BASE_URL}/tickets/${TEST_TICKET_ID}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assignedToId: AGENT_ID,
    }),
  });
}

async function runTest() {
  console.log("Fetching ticket before update...");
  const before = await getTicket();
  console.log("Before assignedToId:", before.assignedToId);

  console.log("Assigning ticket to agent...");
  await assignAgent();

  console.log("Fetching ticket after update...");
  const after = await getTicket();
  console.log("After assignedToId:", after.assignedToId);

  if (after.assignedToId === AGENT_ID) {
    console.log("TEST PASSED: Ticket assigned to correct agent");
  } else {
    console.log("TEST FAILED: Agent assignment incorrect");
  }
}

runTest();
// CONFIG
const BASE_URL = "http://localhost:3000";

// Using existing ticket with ID = 14
const TEST_TICKET_ID = 14;

const NEW_STATUS = "OPEN";

// helper to get ticket
async function getTicket() {
  const res = await fetch(`${BASE_URL}/tickets/${TEST_TICKET_ID}`);
  return res.json();
}

// helper to patch ticket status
async function updateStatus() {
  return fetch(`${BASE_URL}/tickets/${TEST_TICKET_ID}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: NEW_STATUS,
      oldStatus: "OPEN",
      statusChangeUserId: 1,
    }),
  });
}

async function runTest() {
  console.log("Fetching original ticket...");
  const before = await getTicket();
  console.log("Before status:", before.status);

  console.log("Updating status...");
  await updateStatus();

  console.log("Fetching updated ticket...");
  const after = await getTicket();
  console.log("After status:", after.status);

  if (after.status === NEW_STATUS) {
    console.log("TEST PASSED: Status updated correctly in DB");
  } else {
    console.log("TEST FAILED: Status did not update");
  }
}

runTest();
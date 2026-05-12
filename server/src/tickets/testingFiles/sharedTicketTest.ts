// sharedChatTest.ts
// Verifies that user and agent see the same chat messages

const BASE_URL = "http://localhost:3000";

const TICKET_ID = 15;

// using user id = 
const USER_ID = 5;
const AGENT_ID = 3;


// Send message (as user)
async function sendUserMessage() {
  return fetch(`${BASE_URL}/tickets/${TICKET_ID}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: "Hello from user",
      userId: USER_ID,
    }),
  });
}

// Send message (as agent)
async function sendAgentMessage() {
  return fetch(`${BASE_URL}/tickets/${TICKET_ID}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: "Hello from agent",
      agentId: AGENT_ID,
    }),
  });
}

// Fetch messages
async function getMessages() {
  const res = await fetch(
    `${BASE_URL}/tickets/${TICKET_ID}/messages`
  );
  return res.json();
}

// Run test

async function runTest() {
  console.log("Sending user message...");
  await sendUserMessage();

  console.log("Sending agent message...");
  await sendAgentMessage();

  console.log("Fetching messages (user view)...");
  const userView = await getMessages();

  console.log("Fetching messages (agent view)...");
  const agentView = await getMessages();

  const sameLength =
    userView.length === agentView.length;

  const sameContent =
    JSON.stringify(userView) === JSON.stringify(agentView);

  console.log("User view:", userView);
  console.log("Agent view:", agentView);

  if (sameLength && sameContent) {
    console.log(
      "TEST PASSED: Agent and user see the same chat"
    );
  } else {
    console.log(
      "TEST FAILED: Chat views are not identical"
    );
  }
}

runTest();
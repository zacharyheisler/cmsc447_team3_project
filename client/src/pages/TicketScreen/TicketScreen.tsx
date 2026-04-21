import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./TicketScreen.css";
import { MOCK_AGENTS, MOCK_TICKETS } from "../../demo/mockTickets";
import type { Agent, Ticket, TicketStatus } from "../../types/types";

// available ticket types
const ticketTypes = [
  "BUG",
  "TECH_SUPPORT",
  "ACCOUNT",
  "BILLING",
  "FEATURE_REQUEST",
  "OTHER"
];

// available ticket statuses
const ticketStatuses = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_ON_CUSTOMER",
  "RESOLVED",
  "CLOSED"
];

// example tickets for demo/screen show off
const exampleTickets: Ticket[] = MOCK_TICKETS;

// const exampleTickets: []
export default function TicketScreen() {
  //get the real ticket id from route parameter
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const viewerUserId = searchParams.get("userId");
  const viewerAgentId = searchParams.get("agentId");

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true); // Track loading state
  //for demo, get the ticket 1 or 2
  //const ticket = exampleTickets.find((t) => t.ticketId === Number(ticketId));


  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [type, setType] = useState("");
  const [tempType, setTempType] = useState("");
  const [editingType, setEditingType] = useState(false);

  const [status, setStatus] = useState("");
  const [tempStatus, setTempStatus] = useState("");
  const [editingStatus, setEditingStatus] = useState(false);

  const [description, setDescription] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);

  const [statusHistory, setStatusHistory] = useState<any[]>([]);

  const agents: Agent[] = MOCK_AGENTS;

  const [viewerUsername, setViewerUsername] = useState<string>("");
  const [assignedToName, setAssignedToName] = useState<string>("Unassigned");

  
  useEffect(() => {

    // Comment this block out if you want to use tickets from backend not demo
    // /*
  
     const mockTicket = exampleTickets.find(
      (t) => t.ticketId === Number(ticketId)
    );

    

    // Will use mock tickets for demo screenshots if they are available instead of backend!
    
  if (mockTicket) {
    setTicket(mockTicket);
    setMessages(mockTicket.messages || []);
    setType(mockTicket.type);
    setStatus(mockTicket.status);
    setDescription(mockTicket.description);
    setStatusHistory(mockTicket.statusHistory || []);
    setLoading(false);
    return;
  }

  // comment out block ends here
  // */

    setLoading(true);
    fetch(`http://localhost:3000/tickets/${ticketId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ticket not found");
        return res.json();
      })
      .then((data) => {
        setTicket(data);
        setMessages(data.messages || []);
        setType(data.type);
        setStatus(data.status);
        setDescription(data.description);
        setStatusHistory(data.statusHistory || []);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setTicket(null);
      })
      .finally(() => {
        setLoading(false);
      });

  }, [ticketId]);
   
  useEffect(() => {
    if (viewerAgentId) {
      // fetch agent to get the user id, then their username
      fetch(`http://localhost:3000/agents/${viewerAgentId}`)
        .then((res) => res.json())
        .then((agent) =>
          fetch(`http://localhost:3000/users/${agent.userId}`)
        )
        .then((res) => res.json())
        .then((user) => setViewerUsername(user.username))
        .catch(() => setViewerUsername(`Agent #${viewerAgentId}`));
    } else if (viewerUserId) {
      // if a user is viewing, get their nusername
      fetch(`http://localhost:3000/users/${viewerUserId}`)
        .then((res) => res.json())
        .then((user) => setViewerUsername(user.username))
        .catch(() => setViewerUsername(`User #${viewerUserId}`));
    }
  }, [viewerAgentId, viewerUserId]);

   useEffect(() => {
  const data = ticket as any;
  if (data?.assignedTo?.user?.username) {
    setAssignedToName(data.assignedTo.user.username);
  } else {
    setAssignedToName("Unassigned");
  }
}, [ticket]);

  // check if ticket is being fetched
  if (loading) return <p>Fetching Ticket #{ticketId} from database...</p>;

  //  check if ticket exists 
  if (!ticket) return <p>Ticket #{ticketId} was not found in the database.</p>;

  //see who is viewing the ticket
  // should have userId or agentId in the url 


  //temporary send message function for screen functionality
  //real message will also get sent to database as 
  const sendMessage = () => {
    // do not send empty message
    if (!newMessage.trim()) {
      return;

    }

    fetch(`http://localhost:3000/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newMessage,
        userId: viewerUserId ? Number(viewerUserId) : null,
        agentId: viewerAgentId ? Number(viewerAgentId) : null,
      }), // replace 1 with real logged-in user id
    });

    let nextId = 1;
    // make a temporary auto increment messageID for the screen demo
    if (messages.length > 0) {
      nextId = messages[messages.length - 1].messageId + 1;
    }

    // for the demo, a user can send a message
    const message = {
      messageId: nextId,
      content: newMessage,
      sender: viewerAgentId ? "agent" : "user",
      sentAt: new Date().toLocaleDateString(),
    };

    // add the message to the current messages  
    setMessages([...messages, message]);
    //clear new message
    setNewMessage("");
  }

   const confirmStatusChange = async () => {
    await fetch(`http://localhost:3000/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: tempStatus,
        oldStatus: status,
        // TicketStatusHistory.statusChangeUserId links to User.userId
        // If viewer is an agent, we still need their userId not agentId
        statusChangeUserId: Number(viewerUserId ?? viewerAgentId),
      }),
    });

    // Re-fetch status history so "changedBy" comes from DB with real usernames
    const res = await fetch(`http://localhost:3000/tickets/${ticketId}`);
    const updated = await res.json();
    setStatusHistory(updated.statusHistory || []);
    setStatus(tempStatus);
    setEditingStatus(false);
  };

  

  
  return (
    <div className="ticket-screen">
      {/*Back button*/}
      <button className="button" onClick={() => navigate(-1)}>
        Go Back
      </button>
      <h1 className="ticket-title">Ticket #{ticket.ticketId} Details</h1>
      <div className="ticket-container">
        <div className="ticket-info">

          {/*ticket type information*/}
          <div className="ticket-type">
            <p>
              <strong>Type:</strong>{" "}

              {/*if the type is not currently being edited*/}
              {!editingType && (
                <>
                  {type}
                  <button
                    className="button"
                    // get the current type and enable editing buttons
                    onClick={() => {

                      setTempType(type);
                      setEditingType(true);
                    }}

                  >
                    Change type
                  </button>
                </>
              )}
              {/*enable the editing buttons*/}
              {editingType && (
                <>

                  <select
                    value={tempType}
                    onChange={(e) => setTempType(e.target.value)}
                  >
                    {/*select the new type from a dropdown*/}
                    {ticketTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>


                  <button
                    className="button"
                    onClick={() => {
                      //set the selected type as new type, disable editing
                      fetch(`http://localhost:3000/tickets/${ticketId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: tempType }),
                      });

                      setType(tempType);
                      setEditingType(false);
                    }}
                  >
                    Confirm
                  </button>

                  <button
                    className="button"
                    onClick={() => setEditingType(false)}
                  >
                    Cancel
                  </button>
                </>
              )}
            </p>


          </div>

          {/*ticket status information*/}
          <div className="ticket-status">

            <p><strong>Status:</strong>{" "}

              {!editingStatus && (
                <>
                  {status}
                  <button
                    className="button"
                    // get the current status and enable editing buttons
                    onClick={() => {

                      setTempStatus(status);
                      setEditingStatus(true);
                    }}
                  >
                    Change Status
                  </button>
                </>
              )}

              {/*show editing buttons*/}
              {editingStatus && (
                <>

                  <select
                    // select a new status from dropdown
                    value={tempStatus}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setTempStatus(e.target.value as TicketStatus)
                    }
                  >
                    {ticketStatuses.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                   <button className="button" onClick={confirmStatusChange}>Confirm</button>

                  <button
                    className="button"
                    onClick={() => setEditingStatus(false)}
                  >
                    Cancel
                  </button>
                </>
              )}</p>
          </div>

          {/*Ticket description*/}
          <div className="ticket-description">
            <strong>Description:</strong>{" "}

            {!editingDescription && (
              <>
                {description}

                {/*Change description button*/}
                <button
                  className="button"
                  onClick={() => {
                    setTempDescription(description);
                    setEditingDescription(true);
                  }}
                >
                  Change Description
                </button>
              </>
            )}

            {editingDescription && (
              //make an input bar that lets user type decription
              <div className="input-row">
                <input
                  type="text"
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Edit description..."
                />


                {/*confirm button*/}
                <button
                  className="button"
                  onClick={() => {
                    fetch(`http://localhost:3000/tickets/${ticketId}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ description: tempDescription }),
                    });
                    setDescription(tempDescription);
                    setEditingDescription(false);
                  }}
                >
                  Confirm
                </button>


                {/*cancel button*/}
                <button
                  className="button"
                  onClick={() => setEditingDescription(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/*These can't be changed*/}
<p><strong>Assigned to:</strong> {assignedToName}</p>
          <p><strong>Created At:</strong> {ticket.createdAt}</p>

          {/*Ticket status historiy information*/}
          <h3>Status History</h3>
          <div className="status-history">
            {statusHistory.length === 0 ? (
              <p>No status changes yet.</p>
            ) : (
              <ul>
                {statusHistory.map((h) => (
                  <li key={h.TicketStatusHistoryId}>
                    {h.changedAt}: {h.oldStatus} → {h.newStatus} (by {h.statusChangeUser?.username ?? "Unknown"})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="messages">
          <h3>Messages</h3>
          <div className="message-list">
            {messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              messages.map((msg) => {
                const sender = msg.sender         // locally created messages
                  ?? (msg.agentId ? "agent" : "user");  // messages from DB

                return (
                  <div key={msg.messageId} className={`message ${sender}`}>
                    <span className="sender">{sender}:</span>
                    <span className="content">{msg.content}</span>
                    <span className="timestamp">{msg.sentAt}</span>
                  </div>
                );
              })

            )}
          </div>
          <div className="input-container">
            <h4> Send a message</h4>
            <div className="input-row">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="button" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

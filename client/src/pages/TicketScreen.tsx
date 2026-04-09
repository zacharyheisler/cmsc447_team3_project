import { useParams, useNavigate} from "react-router-dom";
import { useState } from "react";
import "./TicketScreen.css";

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
const exampleTickets = [
  {
    ticketId: 1,
    type: "BUG",
    status: "OPEN",
    description: "Login fails on Chrome",
    createdAt: "4/7/26",
    assignedTo: "Agent Smith",
    messages: [
      { messageId: 1, content: "I can't log in on chrome.", sender: "user", sentAt: "4/7/26 09:00" },
      { messageId: 2, content: "Are you getting any error codes?", sender: "agent", sentAt: "4/7/26 09:15" },
      { messageId: 3, content: "test message ", sender: "user", sentAt: "4/7/26 09:20" },
      { messageId: 4, content: "test 2", sender: "user", sentAt: "4/7/26 09:20" },

      { messageId: 5, content: "please give team 3 an A ", sender: "agent", sentAt: "4/7/26 09:25" }, //lol
      { messageId: 6, content: "yeah", sender: "user", sentAt: "4/7/26 09:30" },
    ],

    statusHistory: [
      { id: 1, oldStatus: "OPEN", newStatus: "IN_PROGRESS", changedBy: "Agent Smith", changedAt: "4/7/26 09:10" },
    ],
  },
  //another example ticket 
  {
    ticketId: 2,
    type: "FEATURE_REQUEST",
    status: "IN_PROGRESS",
    description: "Add dark mode to app",
    createdAt: "4/6/26",
    assignedTo: "Agent Jane",
    messages: [],
    statusHistory: [],
  },
];

export default function TicketScreen() {
  //get the real ticket id from route parameter
  const { ticketId } = useParams();
  const navigate = useNavigate();
  //for demo, get the ticket 1 or 2
  const ticket = exampleTickets.find((t) => t.ticketId === Number(ticketId));

  if (!ticket) return <p>Ticket not found</p>;

  // 
  const [messages, setMessages] = useState(ticket.messages);
  const [newMessage, setNewMessage] = useState("");

  //set type and editing values
  const [type, setType] = useState(ticket.type);
  const [tempType, setTempType] = useState(ticket.type);
  const [editingType, setEditingType] = useState(false);

  //set status and editing statuses
  const [status, setStatus] = useState(ticket.status);
  const [tempStatus, setTempStatus] = useState(ticket.status);
  const [editingStatus, setEditingStatus] = useState(false);

  //set description and editing description
  const [description, setDescription] = useState(ticket.description);
  const [tempDescription, setTempDescription] = useState(ticket.description);
  const [editingDescription, setEditingDescription] = useState(false);

  const [statusHistory, setStatusHistory] = useState(ticket.statusHistory);

  //temporary send message function for screen functionality
  //real message will also get sent to database as 
  const sendMessage = () => {
    // do not send empty message
    if (!newMessage.trim()) {
      return;
    }

    let nextId = 1;
    // make a temporary auto increment messageID for the screen demo
    if (messages.length > 0) {
      nextId = messages[messages.length - 1].messageId + 1;
    }

    // for the demo, a user can send a message
    const message = {
      messageId: nextId,
      content: newMessage,
      sender: "user",
      sentAt: new Date().toLocaleDateString(),
    };

    // add the message to the current messages  
    setMessages([...messages, message]);
    //clear new message
    setNewMessage("");
  }

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
                    onChange={(e) => setTempStatus(e.target.value)}
                  >
                    {ticketStatuses.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>

                  <button
                    className="button"
                    onClick={() => {
                      // Add old status to statushistory
                      const newEntry = {
                        // if status history length is not 0, add the status history incremented by 1
                        id: statusHistory.length > 0 ? statusHistory[statusHistory.length - 1].id + 1 : 1,
                        oldStatus: status,
                        newStatus: tempStatus,
                        //temporaritly using current user for demo
                        changedBy: "Current User", 
                        changedAt: new Date().toLocaleString(),
                      };

                      // update current status
                      setStatus(tempStatus);                  
                      // append history
                      setStatusHistory([...statusHistory, newEntry]); 
                      setEditingStatus(false);
                    }}
                  >
                    Confirm
                  </button>

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
          <p><strong>Assigned to:</strong> {ticket.assignedTo || "Unassigned"}</p>
          <p><strong>Created At:</strong> {ticket.createdAt}</p>

          {/*Ticket status historiy information*/}
          <h3>Status History</h3>
          <div className="status-history">
            {statusHistory.length === 0 ? (
              <p>No status changes yet.</p>
               ):(
              <ul>
                {statusHistory.map((h) => (
                  <li key={h.id}>
                    {h.changedAt}: {h.oldStatus} → {h.newStatus} (by {h.changedBy})
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
              messages.map((msg) => (
                <div key={msg.messageId} className={`message ${msg.sender}`}>
                  <span className="sender">{msg.sender}:</span>
                  <span className="content">{msg.content}</span>
                  <span className="timestamp">{msg.sentAt}</span>
                </div>
              ))

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

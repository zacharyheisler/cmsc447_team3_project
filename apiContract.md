# Team 3 Smart Support API Contract Draft

**Base URL:** to be created

---

## 1. Data Models

### User Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | `User ID (PK)` |
| `username` | String | `Username` |
| `email` | String | `Email` |
| `phone_number` | String | `Phone number` |
| `company_id` | UUID | `Company ID (FK)` |
| `created_at` | DateTime | `Date Account Was Created` |

### Ticket Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | `Ticket ID (PK)` |
| `type` | Enum | `Type (from a list)` |
| `status` | Enum | `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`. |
| `description` | String | `Description` |
| `created_at` | DateTime | `Date and Time of Creation` |
| `created_by` | UUID | `Created by UserID (FK)` |
| `assigned_to` | UUID? | `Assigned to AgentID (FK)` |

### Message Object
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | `Message ID (PK)` |
| `content` | String | `Content` |
| `sent_at` | DateTime | `Date and Time Sent` |
| `is_ai_generated`| Boolean | `Is AI Generated Message` |
| `sender_id` | UUID | `Sender ID (FK)` |
| `ticket_id` | UUID | `Ticket ID (FK)` |

---

## 2. Endpoints

### Authentication & Roles 
* **`POST /auth/signup`**: Creates a new User record.
* `POST /auth/login`**: Authenticates credentials and returns a token with actor roles (`USER`, `AGENT`, `ADMIN`).

### Ticket Management
* **`GET /tickets`**: 
    * **Users**: See tickets where `Created by UserID` matches their ID.
    * **Agents**: See tickets where `Assigned to AgentID` matches their ID or is null.

* **`POST /tickets`**: Creates a new `Ticket` entry.
* **`PATCH /tickets/{id}`**: Updates `Status` or `Assigned to AgentID`. 

### Per-Ticket Chat
* **`GET /tickets/{id}/messages`**: Fetches all `TicketChatMessage` records for the ticket.
* **`POST /tickets/{id}/messages`**: Saves a new message to the database.
    * Includes the `is_ai_generated` flag for potential AI features.

### Audit History
* **`GET /tickets/{id}/history`**: Retrieves all `TicketStatusHistory` records linked to the `Ticket ID (FK)`.

---

## 3. Implementation Requirements
* **Persistence**: All data—users, tickets, messages, and history—must be securely persisted.
* **Access Control**: Validation must ensure users can only access their own data.
* **History Tracking**: The system must track status changes from creation to resolution.
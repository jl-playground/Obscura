# Chat & Room Feature Architecture Overview

## Executive Summary

The Obscura server has **two separate but interrelated chat implementations**:

1. **Chat Feature** (NEW - Sequelize/Express pattern): Modern implementation using Sequelize ORM, Express controllers, and message-based communication tied to the Connection feature.
2. **Room Feature** (OLD - TypeORM/Elysia pattern): Legacy implementation using TypeORM with Elysia routing framework.

The **Chat feature is the primary implementation** that should be migrated and maintained. The Room feature appears to be legacy code and should be deprecated.

---

## 1. ENTITIES & DATABASE SCHEMA

### 1.1 Connection Entity
**Status**: Active (Foundation for Chat)  
**Location**: `/server/src/app/core/database/entities/connection.entity.ts`  
**ORM**: Sequelize  
**Table**: `connection`

```typescript
// Fields:
- id: UUID (Primary Key)
- user_a_id: UUID (Foreign Key → User.id)
- user_b_id: UUID (Foreign Key → User.id)
- status: ENUM('PENDING', 'REVEALED', 'REVEAL_READY')
- message_count: INTEGER (default: 0) // Tracks chat activity
- user_a_reveal_vote: BOOLEAN | null
- user_b_reveal_vote: BOOLEAN | null
- deleted_at: DATE | null (soft delete)
- created_at: DATE
- updated_at: DATE

// Associations:
- hasMany User (as userA, via user_a_id)
- hasMany User (as userB, via user_b_id)
```

**Key Business Logic**:
- Represents a two-way connection between users
- Status progression: PENDING → ACTIVE → REVEAL_READY → REVEALED
- `message_count` auto-increments when messages are sent
- Auto-transitions to REVEAL_READY when message_count reaches threshold (50)

---

### 1.2 Message Entity
**Status**: Active (Core Chat Data)  
**Location**: `/server/src/app/core/database/entities/message.entity.ts`  
**ORM**: Sequelize  
**Table**: `message`

```typescript
// Fields:
- id: UUID (Primary Key)
- connection_id: UUID (Foreign Key → Connection.id)
- sender_id: UUID (Foreign Key → User.id)
- message_type: ENUM('TEXT', 'VOICE')
- content_url: STRING (text content or S3 URL for voice)
- created_at: DATE
- updated_at: DATE

// Associations:
- belongsTo Connection (via connection_id)
- belongsTo User (via sender_id, as sender)
```

---

### 1.3 Room Entity (LEGACY)
**Status**: DEPRECATED (Old implementation)  
**Location**: `/server/src/app/core/database/entities/room.entity.ts`  
**ORM**: TypeORM (not Sequelize)  
**Table**: `room`

⚠️ **Note**: Entity file is empty. This feature should be deprecated in favor of Chat feature.

---

### 1.4 User Entity (Reference)
**Location**: `/server/src/app/core/database/entities/user.entity.ts`

```typescript
// Key associations for Chat:
- hasOne Profile
- hasMany Connection (as connectionsAsA, via user_a_id)
- hasMany Connection (as connectionsAsB, via user_b_id)
- hasMany UserAnswer (for Questions feature)
```

---

## 2. ENDPOINTS

### 2.1 Chat Endpoints (NEW - Express/Sequelize Pattern)
**Route Group**: `/chat`  
**Auth**: Required (authMiddleware)  
**Framework**: Express-like (currently in Elysia, should migrate to Express)

#### POST /chat/message
**Purpose**: Send a new message in a connection  
**Controller**: `ChatController.sendMessage()`  
**Request Body**:
```json
{
  "connectionId": "uuid",
  "messageType": "TEXT" | "VOICE",
  "content": "string" // text or S3 URL
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "connection_id": "uuid",
    "sender_id": "uuid",
    "message_type": "TEXT",
    "content_url": "string",
    "created_at": "ISO8601"
  }
}
```

**Business Logic**:
1. Verify user is part of the connection
2. Create message record in database
3. Increment `connection.message_count` in transaction
4. If `message_count >= 50`: Transition connection to `REVEAL_READY`
5. Update `connection.status` to `ACTIVE`

**Error Responses**:
- 404: Connection not found
- 403: User not part of connection
- 500: Server error

---

#### GET /chat/:connectionId
**Purpose**: Retrieve all messages for a connection  
**Controller**: `ChatController.getMessages()`  
**URL Params**: `connectionId` (UUID)

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "id": "uuid",
        "connection_id": "uuid",
        "sender_id": "uuid",
        "message_type": "TEXT",
        "content_url": "string",
        "created_at": "ISO8601"
      }
    ]
  }
}
```

**Business Logic**:
1. Verify user is part of connection
2. Return all messages ordered by `created_at` (ASC - oldest first)
3. Include sender info in response

**Error Responses**:
- 404: Connection not found
- 403: User not part of connection
- 500: Server error

---

### 2.2 Room Endpoints (LEGACY - Elysia/TypeORM Pattern)
**Route Group**: `/rooms`  
**Auth**: Required (authMiddleware)  
**Framework**: Elysia  
**Status**: DEPRECATED

#### GET /rooms
**Purpose**: List all rooms for current user  
**Controller**: `RoomController.list()`

#### GET /rooms/:roomId
**Purpose**: Get messages for a specific room  
**Controller**: `RoomController.getRoomMessages()`

⚠️ These endpoints should be deprecated in favor of Chat endpoints.

---

### 2.3 Connection Endpoints (Supporting Feature)
**Route Group**: `/connections`  
**Auth**: Required  
**Framework**: Express

#### POST /connections
Create new connection between users

#### GET /connections
Get all connections for current user

#### GET /connections/:id
Get specific connection details

#### POST /connections/:id/reveal-vote
Handle reveal voting (both users must vote yes)

#### DELETE /connections/:id
Soft delete connection

---

## 3. BUSINESS LOGIC & WORKFLOWS

### 3.1 Chat Message Flow

```
User A sends message to User B
    ↓
POST /chat/message { connectionId, messageType, content }
    ↓
ChatService.sendMessage()
    ├─ Verify connection exists
    ├─ Verify sender is part of connection
    ├─ Create Message record (transaction start)
    ├─ Increment connection.message_count
    ├─ CHECK THRESHOLD (message_count >= 50):
    │  └─ If true: connection.status = "REVEAL_READY"
    ├─ Update connection.status to "ACTIVE"
    └─ Commit transaction
    ↓
Message persisted, connection updated
```

### 3.2 Reveal Workflow

```
Both users in connection have sent 50+ messages
    ↓
connection.status transitions to "REVEAL_READY"
    ↓
Each user can see the other's full profile (reveal vote)
    ↓
Both users vote to "REVEAL" (connection.user_a_reveal_vote = true, etc.)
    ↓
ConnectionService.handleRevealVote()
    ├─ Record vote
    └─ If both voted true: connection.status = "REVEALED"
    ↓
Users' identities fully revealed to each other
```

### 3.3 Message Count Threshold

**REVEAL_THRESHOLD = 50** (defined in `chat.service.ts`)

- Tracks cumulative messages in a connection
- Acts as a trust-building mechanism
- Must reach 50 before either user can initiate reveal
- Resets only if connection is deleted

---

## 4. KEY RELATIONSHIPS & CONSTRAINTS

### 4.1 User ↔ Connection
- User can be `user_a_id` or `user_b_id` in multiple connections
- A user cannot create connection with themselves (validated)
- Connection can only exist between two specific users (uniqueness enforced)

### 4.2 Connection ↔ Message
- Many messages belong to one connection
- Messages cannot be sent in non-existent connections
- Deleting connection should cascade-delete messages (verify in migration)

### 4.3 Message ↔ User (Sender)
- Each message has a sender_id
- Sender must be one of the two users in the connection
- Enforced at service layer (verify in migration)

### 4.4 Connection Status States

```
PENDING
├─ Initial state on connection creation
├─ Users can send messages
└─ message_count starts at 0

ACTIVE
├─ At least one message sent
└─ message_count being incremented

REVEAL_READY
├─ message_count >= 50
├─ Users can vote to reveal
└─ Cannot be reverted to PENDING

REVEALED
├─ Both users voted yes on reveal
└─ Full identities visible
```

---

## 5. SERVICE LAYER PATTERN

### 5.1 ChatService (Reference Implementation)

```typescript
class ChatService {
  private connRepo: ConnectionRepository;
  private msgRepo: MessageRepository;

  // Main business logic methods:
  async sendMessage(auth, dto);      // With transaction, threshold check
  async getMessages(auth, connectionId);  // With auth check
}
```

**Key Pattern**:
- Uses repositories for data access
- Implements business logic in service (not controller)
- Uses transactions for multi-step operations
- Validates authorization at service level
- Returns domain objects, not raw DB entities

### 5.2 ConnectionService (Supporting Service)

```typescript
class ConnectionService {
  private repository: ConnectionRepository;

  // Connection management:
  async createConnection(userAId, userBId);
  async getUserConnections(userId);
  async getConnectionById(id);
  async handleRevealVote(connectionId, userId, vote);
  async incrementMessageCount(id);
  async deleteConnection(id);
  async restoreConnection(id);
}
```

---

## 6. REPOSITORY LAYER PATTERN

### 6.1 MessageRepository

```typescript
export const MessageRepository = dataSource.getRepository(Message).extend({
  findMessagesByConnection(connectionId: string) {
    return this.find({
      where: { connection_id: connectionId },
      order: { created_at: "ASC" },
      relations: ["sender"],
    });
  },
});
```

### 6.2 ConnectionRepository (Sequelize Pattern)

```typescript
class ConnectionRepository {
  private models = Database.getInstance().models;

  async findByPk(id: string): Promise<Connection>;
  async findUserConnections(userId: string): Promise<Connection[]>;
  async findExistingConnection(userAId: string, userBId: string): Promise<Connection>;
  async create(data): Promise<Connection>;
  async update(id: string, data): Promise<[number, Connection[]]>;
  async delete(id: string): Promise<number>;
  async restore(id: string): Promise<number>;
  async incrementMessageCount(id: string): Promise<void>;
}
```

---

## 7. CONTROLLER LAYER PATTERN

### 7.1 ChatController (Elysia/Express-like Pattern)

```typescript
class ChatController {
  private service = new ChatService();

  // Context-based handler pattern:
  async sendMessage(context: SendMessageContext) {
    const { auth, body, set } = context;
    try {
      const result = await this.service.sendMessage(auth, body);
      set.status = 201;
      return { status: "success", data: result };
    } catch (error) {
      // Error handling with status codes
    }
  }

  async getMessages(context: GetMessagesContext) {
    const { auth, params, set } = context;
    // Similar pattern
  }
}
```

**Response Envelope**:
```json
{
  "status": "success" | "error",
  "data": { /* domain object */ } | null,
  "message": "error message" | null
}
```

### 7.2 ConnectionController (Express Pattern)

```typescript
class ConnectionController {
  private service: ConnectionService;

  async createConnection(req: Request, res: Response, next: NextFunction);
  async getMyConnections(req: Request, res: Response, next: NextFunction);
  async getConnectionById(req: Request, res: Response, next: NextFunction);
  async handleRevealVote(req: Request, res: Response, next: NextFunction);
  async deleteConnection(req: Request, res: Response, next: NextFunction);
}
```

**Key Pattern**:
- Extract userId from `(req as any).user?.id`
- Verify authorization before service call
- Handle errors with appropriate HTTP status codes
- Return consistent response envelope

---

## 8. VALIDATION & DTO LAYER

### 8.1 Chat DTOs

```typescript
// chat.dto.ts
export const SendMessageSchema = t.Object({
  connectionId: t.String({ format: "uuid" }),
  messageType: t.Enum(MessageType), // TEXT | VOICE
  content: t.String({ minLength: 1 }),
});
export type SendMessageDto = typeof SendMessageSchema.static;
```

### 8.2 Connection Validator

```typescript
// connection.validator.ts
interface CreateConnectionDto {
  recipientUserId: string;
}

interface RevealVoteDto {
  vote: boolean;
}
```

---

## 9. CURRENT ISSUES & OBSERVATIONS

### 9.1 Mixed Framework Architecture
- **Current State**: Elysia + TypeORM for Room; Partial Express for Connection
- **Problem**: Framework inconsistency
- **Solution**: Migrate all to Express + Sequelize

### 9.2 Empty Entity Files
- `room.entity.ts` is empty
- `message.entity.ts` is empty
- **Likely Cause**: Files not synced after migration
- **Action**: Regenerate from Sequelize model

### 9.3 Missing Type Safety
- Controllers use `context as any`, `req as any`
- **Solution**: Define proper types for middleware context

### 9.4 Transaction Handling
- Chat uses DataSource transactions (TypeORM)
- Should use Sequelize transactions in Express version
- Both users' message counts must be atomic

### 9.5 WebSocket Chat Support
- `chat.socket.ts` exists but is basic
- Currently doesn't integrate with Message/Connection models
- Should implement real-time message updates via WebSocket

---

## 10. MIGRATION CHECKLIST

When migrating Chat/Room to Express + Sequelize:

- [ ] Create `message.entity.ts` with Sequelize model
- [ ] Migrate `chat.service.ts` to use Sequelize transactions
- [ ] Update `chat.repository.ts` to use Sequelize queries
- [ ] Update `chat.controller.ts` for Express Request/Response
- [ ] Update `chat.route.ts` to use Express routing
- [ ] Create migrations for `message` table if not exists
- [ ] Add `message` to `database.ts` DBModels interface
- [ ] Implement WebSocket support for real-time chat
- [ ] Add comprehensive error handling
- [ ] Add request/response logging
- [ ] Update tests for new implementation
- [ ] Deprecate Room feature endpoints
- [ ] Update API documentation

---

## 11. FILE STRUCTURE SUMMARY

```
server/src/app/
├── core/database/
│   ├── entities/
│   │   ├── connection.entity.ts      ✅ Active (Sequelize)
│   │   ├── message.entity.ts         ⚠️ Empty (needs implementation)
│   │   ├── room.entity.ts            ❌ Empty (deprecated)
│   │   ├── user.entity.ts            ✅ Active
│   │   └── profile.entity.ts         ✅ Active
│   ├── database.ts                   ⚠️ Missing Message model
│   └── migrations/                   📝 Empty (needs chat schema)
│
├── features/
│   ├── chat/                         🔄 In progress
│   │   ├── chat.controller.ts        ⚠️ Elysia pattern
│   │   ├── chat.service.ts           ⚠️ TypeORM pattern
│   │   ├── chat.route.ts             ⚠️ Elysia pattern
│   │   ├── chat.dto.ts               ✅ Good
│   │   ├── chat.types.ts             ✅ Good
│   │   ├── chat.socket.ts            ⚠️ Incomplete
│   │   ├── message.repository.ts     ⚠️ TypeORM pattern
│   │   └── room.repository.ts        ❌ Duplicate/Legacy
│   │
│   ├── connection/                   ✅ Active (Express/Sequelize)
│   │   ├── connection.controller.ts
│   │   ├── connection.service.ts
│   │   ├── connection.repository.ts
│   │   ├── connection.route.ts
│   │   └── connection.validator.ts
│   │
│   ├── room/                         ❌ Deprecated (Elysia/TypeORM)
│   │   ├── room.controller.ts
│   │   ├── room.service.ts
│   │   ├── room.route.ts
│   │   ├── room.dto.ts
│   │   └── room.repository.ts
│   │
│   └── auth/
│       ├── auth.middleware.ts
│       └── auth.dto.ts
```

---

## 12. REFERENCE ENDPOINTS

### Full Chat API Example Workflow

```bash
# 1. Create connection between User A and User B
POST /api/connections
{
  "recipientUserId": "user-b-uuid"
}
→ Returns: { id: "conn-uuid", status: "PENDING", message_count: 0 }

# 2. Send message from User A
POST /api/chat/message
{
  "connectionId": "conn-uuid",
  "messageType": "TEXT",
  "content": "Hello, how are you?"
}
→ Returns: { id: "msg-uuid", ... }
→ Side effect: connection.message_count increments

# 3. Send message from User B (repeat until count reaches 50)
POST /api/chat/message
{
  "connectionId": "conn-uuid",
  "messageType": "TEXT",
  "content": "I'm doing well!"
}
→ After 50 total messages: connection.status = "REVEAL_READY"

# 4. Get all messages in connection
GET /api/chat/conn-uuid
→ Returns: { messages: [...] } ordered by created_at ASC

# 5. Vote to reveal
POST /api/connections/conn-uuid/reveal-vote
{
  "vote": true
}
→ If both users vote true: connection.status = "REVEALED"
```

---

## 13. CONFIGURATION & CONSTANTS

### Message Reveal Threshold
- **Location**: `chat.service.ts`, line 13
- **Value**: 50 messages
- **Scope**: Global (affects all connections)
- **Future**: Could be made configurable per connection type

### Message Types
- `TEXT`: Plain text messages
- `VOICE`: Voice messages (content_url points to S3)

### Connection Status Types
- `PENDING`: Initial, ready for messaging
- `ACTIVE`: At least one message sent
- `REVEAL_READY`: 50+ messages, ready for reveal vote
- `REVEALED`: Both users voted, identities revealed

---

## 14. SECURITY CONSIDERATIONS

### Authorization Checks
- ✅ User must be part of connection to send/read messages
- ✅ User cannot create connection with themselves
- ✅ User cannot vote on reveal without being in connection
- ⚠️ WebSocket needs room/channel authentication

### Data Validation
- ✅ Message content has minimum length check
- ✅ UUID format validation on IDs
- ⚠️ Message content size limit not specified (add in migration)
- ⚠️ Rate limiting not implemented (add for production)

### Soft Deletes
- ✅ Connection supports soft delete via `deleted_at`
- ⚠️ Message soft delete not specified (decide: cascade or soft)
- ⚠️ Query filters should exclude soft-deleted records

---

## Summary

**Chat Feature** is the primary, actively developed implementation using:
- **ORM**: Sequelize (for consistency with User, Profile, Connection)
- **Framework**: Express (with partial Elysia, needs migration)
- **Pattern**: Service → Repository → Entity
- **Key Feature**: Message threshold (50) triggers reveal readiness

**Room Feature** is legacy, should be deprecated.

The migration to Express + Sequelize should standardize on the Connection/Question feature patterns.

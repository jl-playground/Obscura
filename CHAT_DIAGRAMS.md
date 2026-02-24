# Chat/Room Feature - Visual Architecture

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ id (UUID, PK)                                            │   │
│  │ email                                                    │   │
│  │ first_name, last_name                                   │   │
│  │ created_at, updated_at                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────┬─────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        │ (1 connection          │ (1 connection
        │  user_a_id)            │  user_b_id)
        │                         │
   ┌────▼────────────────────────▼────┐
   │       CONNECTION                 │
   ├──────────────────────────────────┤
   │ id (UUID, PK)                    │
   │ user_a_id (FK → User)            │
   │ user_b_id (FK → User)            │
   │ status (ENUM)                    │
   │   - PENDING                      │
   │   - ACTIVE                       │
   │   - REVEAL_READY                 │
   │   - REVEALED                     │
   │ message_count (INTEGER)          │◄─── Triggers REVEAL_READY at 50
   │ user_a_reveal_vote (BOOL|null)   │
   │ user_b_reveal_vote (BOOL|null)   │
   │ deleted_at (soft delete)         │
   │ created_at, updated_at           │
   └────┬────────────────────────────┬┘
        │ (1 connection             │
        │  many messages)           │ (references for reveal voting)
        │                           │
        │                    ┌──────┘
        │                    │
   ┌────▼─────────────┐      │
   │     MESSAGE      │      │
   ├──────────────────┤      │
   │ id (UUID, PK)    │      │
   │ connection_id    │      │
   │   (FK)           │      │
   │ sender_id (FK)   │◄─────┘ (referenced for reveal voting)
   │ message_type     │
   │   - TEXT         │
   │   - VOICE        │
   │ content_url      │
   │ created_at       │
   └──────────────────┘
```

## API Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER A                                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ POST /connections
                     │ { recipientUserId: "User B" }
                     │
                     ▼
         ┌──────────────────────────┐
         │  CONNECTION CREATED      │
         │  status: PENDING         │
         │  message_count: 0        │
         └──────────────────────────┘
                     │
                     │ (both users can now chat)
                     │
       ┌─────────────┴──────────────┐
       │                            │
       ▼                            ▼
  USER A sends msg            USER B sends msg
  POST /chat/message          POST /chat/message
  {connectionId, text}        {connectionId, text}
       │                            │
       └─────────────┬──────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │ MESSAGE STORED               │
      │ connection.message_count++   │
      │ (in transaction)             │
      └──────────────────────────────┘
                     │
                     │ (repeat...)
                     │
    ┌────────────────┴────────────────┐
    │                                  │
    ▼                                  ▼
  [after 25 msgs]              [after 50 msgs]
  status: ACTIVE               status: REVEAL_READY
  (can continue)               (ready for reveal)
                                     │
                                     │ Both users vote
                                     │ POST /connections/:id/reveal-vote
                                     │ { vote: true }
                                     │
                                     ▼
                         ┌──────────────────────────┐
                         │  STATUS: REVEALED        │
                         │  Both identity vote= YES │
                         │  Full profile visible    │
                         └──────────────────────────┘
```

## Database Query Patterns

### Get all messages for a connection (ordered, with sender info)

```sql
SELECT m.* 
FROM message m
INNER JOIN connection c ON m.connection_id = c.id
WHERE m.connection_id = :connectionId
  AND (c.user_a_id = :userId OR c.user_b_id = :userId)
ORDER BY m.created_at ASC;
```

### Get all connections for a user (with both users)

```sql
SELECT c.*, 
       ua.* as "userA", 
       ub.* as "userB"
FROM connection c
LEFT JOIN user ua ON c.user_a_id = ua.id
LEFT JOIN user ub ON c.user_b_id = ub.id
WHERE (c.user_a_id = :userId OR c.user_b_id = :userId)
  AND c.deleted_at IS NULL
ORDER BY c.created_at DESC;
```

### Check if users already have a connection

```sql
SELECT c.*
FROM connection c
WHERE (c.user_a_id = :userA AND c.user_b_id = :userB)
   OR (c.user_a_id = :userB AND c.user_b_id = :userA)
  AND c.deleted_at IS NULL;
```

## Transaction Flow: Sending a Message

```
BEGIN TRANSACTION
├─ INSERT INTO message (connection_id, sender_id, message_type, content_url)
├─ UPDATE connection SET message_count = message_count + 1
├─ UPDATE connection SET status = 'ACTIVE' (if PENDING)
├─ IF message_count >= 50:
│  └─ UPDATE connection SET status = 'REVEAL_READY'
└─ COMMIT
   (or ROLLBACK on error)
```

**Why transaction?**: Ensures both message and count update atomically. If one fails, both rollback.

## Service Layer Responsibilities

```
ChatController (HTTP layer)
    │
    ├─ Extract auth context
    ├─ Call service
    └─ Format response with status codes
    
    ▼
    
ChatService (business logic)
    │
    ├─ Verify authorization (user in connection)
    ├─ Validate inputs (message not empty, etc.)
    ├─ Execute domain logic:
    │  ├─ Create message
    │  ├─ Increment count
    │  ├─ Check threshold
    │  └─ Update status
    └─ Orchestrate transaction
    
    ▼
    
MessageRepository (data access)
    ├─ save(message)
    └─ findMessagesByConnection(connectionId)
    
ConnectionRepository (data access)
    ├─ update(id, data)
    ├─ findByPk(id)
    └─ incrementMessageCount(id)
    
    ▼
    
Sequelize Models (ORM layer)
    └─ Execute actual SQL
```

## Status State Machine

```
                ┌─────────────┐
                │   PENDING   │◄─── Initial state
                │ (no msgs)   │     on creation
                └──────┬──────┘
                       │
                  send message
                       │
                       ▼
                ┌─────────────┐
                │   ACTIVE    │◄─── At least 1 msg
                │ (1-49 msgs) │
                └──────┬──────┘
                       │
                reach count >= 50
                       │
                       ▼
                ┌─────────────┐
                │REVEAL_READY │◄─── Ready for reveal vote
                │ (50+ msgs)  │
                └──────┬──────┘
                       │
            both users vote YES
                       │
                       ▼
                ┌─────────────┐
                │  REVEALED   │◄─── Terminal state
                │  (revealed) │     (can't revert)
                └─────────────┘
```

## Feature Comparison: Chat vs Room

```
┌─────────────────────┬──────────────────┬────────────────────┐
│ Aspect              │ Chat (NEW)        │ Room (OLD/LEGACY)  │
├─────────────────────┼──────────────────┼────────────────────┤
│ ORM                 │ Sequelize         │ TypeORM            │
│ Framework           │ Express (Elysia)  │ Elysia             │
│ Entity Files        │ Empty (needs fix) │ Empty (deprecated) │
│ Key Entity          │ Message           │ Room               │
│ Connection Type     │ via Connection    │ direct Room model  │
│ Message Tracking    │ Count in Conn.    │ Room.messages[]    │
│ Reveal Logic        │ YES (threshold)   │ NO (legacy)        │
│ Transaction Support │ YES (DataSource)  │ NO                 │
│ Auth Pattern        │ Service level     │ Controller level   │
│ Status              │ Active/Developing │ Deprecated         │
└─────────────────────┴──────────────────┴────────────────────┘
```

## Key Constants & Thresholds

```javascript
// chat.service.ts, line 13
REVEAL_THRESHOLD = 50  // Messages needed to trigger REVEAL_READY

// Message Types
MessageType.TEXT   // Plain text messages
MessageType.VOICE  // Voice messages (URL to S3)

// Connection Status Types
ConnectionStatus.PENDING      // Initial
ConnectionStatus.ACTIVE       // Messages being sent
ConnectionStatus.REVEAL_READY // 50+ messages, ready to reveal
ConnectionStatus.REVEALED     // Both users voted yes
```

## Data Flow: Send Message → Update Connection

```
Request:
POST /chat/message
{
  "connectionId": "conn-123",
  "messageType": "TEXT",
  "content": "Hello!"
}

Controller:
├─ Extract auth { userId }
└─ Call service.sendMessage(auth, body)

Service (ChatService):
├─ Find connection by ID
├─ Verify userId in (user_a_id, user_b_id)
├─ START TRANSACTION
│  ├─ Create message
│  │  ├─ Set sender_id = userId
│  │  ├─ Set connection_id = connectionId
│  │  ├─ Set message_type = "TEXT"
│  │  ├─ Set content_url = "Hello!"
│  │  └─ Save to DB
│  │
│  ├─ Update connection
│  │  ├─ Increment message_count += 1
│  │  ├─ Set status = "ACTIVE" (if was PENDING)
│  │  └─ Save to DB
│  │
│  ├─ Check threshold
│  │  └─ IF message_count >= 50:
│  │     └─ Set status = "REVEAL_READY"
│  │
│  └─ Persist changes
│
└─ END TRANSACTION

Repository:
├─ Execute INSERT message
├─ Execute UPDATE connection
└─ Commit all or rollback on error

Response (201 Created):
{
  "status": "success",
  "data": {
    "id": "msg-456",
    "connection_id": "conn-123",
    "sender_id": "user-789",
    "message_type": "TEXT",
    "content_url": "Hello!",
    "created_at": "2026-02-19T21:00:00Z"
  }
}
```

---

**Key Takeaway**: Chat is the primary, production-ready implementation (pending migration to Express + Sequelize). Room is legacy and should be deprecated. The threshold-based reveal mechanism is the core business logic driving the feature.

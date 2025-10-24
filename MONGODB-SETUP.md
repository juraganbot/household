# MongoDB Setup & Admin Session Guide

## 🗄️ Database Configuration

### MongoDB Connection
```
URI: mongodb+srv://household:masuk123@household.qxyx8om.mongodb.net/?retryWrites=true&w=majority&appName=household
```

### Collections

#### 1. **protected_emails**
Stores protected email addresses with access keys.

```typescript
{
  _id: ObjectId,
  email: string (unique, lowercase, indexed),
  accessKey: string,
  isLocked: boolean (default: true),
  accessCount: number (default: 0),
  lastAccessedAt: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### 2. **search_history**
Logs all email search activities.

```typescript
{
  _id: ObjectId,
  email: string (indexed),
  searchedAt: Date (indexed, default: now),
  resultsCount: number,
  blockedCount: number,
  ipAddress: string,
  userAgent: string
}
```

#### 3. **admin_sessions**
Manages admin login sessions (24-hour duration).

```typescript
{
  _id: ObjectId,
  token: string (unique, indexed),
  username: string (default: 'admin'),
  ipAddress: string,
  userAgent: string,
  createdAt: Date (indexed),
  expiresAt: Date (indexed),
  lastActivityAt: Date,
  isActive: boolean (indexed, default: true)
}
```

---

## 🔐 Admin Session System

### Password
```
ADMIN_PASSWORD=PLER
```

### Session Duration
```
24 hours (86400000 milliseconds)
```

### Authentication Flow

#### 1. **Login** - `POST /api/admin/login`

**Request:**
```json
{
  "password": "PLER"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-10-25T18:56:00.000Z",
  "expiresIn": 86400000,
  "message": "Login successful",
  "session": {
    "id": "67123abc...",
    "createdAt": "2025-10-24T18:56:00.000Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid password"
}
```

#### 2. **Verify Session** - `POST /api/admin/verify`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (Valid):**
```json
{
  "success": true,
  "valid": true,
  "session": {
    "id": "67123abc...",
    "username": "admin",
    "createdAt": "2025-10-24T18:56:00.000Z",
    "expiresAt": "2025-10-25T18:56:00.000Z",
    "lastActivityAt": "2025-10-24T19:30:00.000Z"
  }
}
```

**Response (Invalid):**
```json
{
  "error": "Invalid or expired token",
  "valid": false
}
```

#### 3. **Logout** - `POST /api/admin/logout`

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📡 Protected API Endpoints

All protected email management endpoints now require session token.

### Headers Required
```
Authorization: Bearer <token>
```

### Endpoints

#### GET `/api/protected-emails`
Get all protected emails with statistics.

#### POST `/api/protected-emails`
Add new protected email.

```json
{
  "email": "user@example.com",
  "accessKey": "CUSTOM" // optional, auto-generated if not provided
}
```

#### PATCH `/api/protected-emails`
Update protected email.

```json
{
  "id": "67123abc...",
  "updates": {
    "isLocked": false,
    "accessKey": "NEWKEY"
  }
}
```

#### DELETE `/api/protected-emails?id=67123abc...`
Delete protected email.

---

## 🔄 Migration from JSON to MongoDB

### Old System (database.json)
```json
{
  "protectedEmails": [
    {
      "id": "1760901385638",
      "email": "planetspure@waroengsuite.com",
      "accessKey": "TAMAGO",
      "createdAt": "2025-10-19T19:16:25.638Z",
      "isLocked": true
    }
  ]
}
```

### New System (MongoDB)
- ✅ Scalable database
- ✅ Indexed queries
- ✅ Session management
- ✅ Search history tracking
- ✅ Access analytics

---

## 🚀 Usage Examples

### Frontend Login Flow

```typescript
// 1. Login
const loginResponse = await fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'PLER' })
});

const { token, expiresAt } = await loginResponse.json();

// Store token
localStorage.setItem('adminToken', token);
localStorage.setItem('tokenExpires', expiresAt);

// 2. Use token for protected requests
const response = await fetch('/api/protected-emails', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 3. Verify session on page load
const verifyResponse = await fetch('/api/admin/verify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { valid } = await verifyResponse.json();
if (!valid) {
  // Redirect to login
}

// 4. Logout
await fetch('/api/admin/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

localStorage.removeItem('adminToken');
localStorage.removeItem('tokenExpires');
```

---

## 📊 Analytics & Monitoring

### Search History Query
```javascript
// Get recent searches
db.search_history.find().sort({ searchedAt: -1 }).limit(10)

// Get searches for specific email
db.search_history.find({ email: "user@example.com" })

// Get statistics
db.search_history.aggregate([
  {
    $group: {
      _id: null,
      totalSearches: { $sum: 1 },
      totalBlocked: { $sum: "$blockedCount" },
      avgResults: { $avg: "$resultsCount" }
    }
  }
])
```

### Active Sessions
```javascript
// Get active sessions
db.admin_sessions.find({ 
  isActive: true,
  expiresAt: { $gt: new Date() }
})

// Clean expired sessions
db.admin_sessions.updateMany(
  { expiresAt: { $lt: new Date() } },
  { $set: { isActive: false } }
)
```

---

## 🔒 Security Features

### JWT Token
- ✅ Signed with secret key
- ✅ 24-hour expiration
- ✅ Contains username and timestamp
- ✅ Verified on every request

### Session Tracking
- ✅ IP address logging
- ✅ User agent tracking
- ✅ Last activity timestamp
- ✅ Auto-expiration

### Access Control
- ✅ Token-based authentication
- ✅ Session validation
- ✅ Activity monitoring
- ✅ Secure logout

---

## 🛠️ Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://household:masuk123@household.qxyx8om.mongodb.net/?retryWrites=true&w=majority&appName=household

# Admin
ADMIN_PASSWORD=PLER
JWT_SECRET=waroengku-secret-key-2025

# Node
NODE_ENV=production
PORT=3000
```

---

## ✅ Migration Checklist

- [x] Install MongoDB packages (mongoose, mongodb)
- [x] Create MongoDB connection manager
- [x] Create Mongoose models (ProtectedEmail, SearchHistory, AdminSession)
- [x] Update API routes to use MongoDB
- [x] Implement JWT-based session system
- [x] Add login/verify/logout endpoints
- [x] Update protected endpoints with session auth
- [x] Add search history logging
- [x] Add access tracking (lastAccessedAt, accessCount)

---

## 📝 Notes

- Password: **PLER** (hardcoded, can be changed via env)
- Session duration: **24 hours**
- Token stored in: **Authorization header** (Bearer token)
- Old JSON database: **Can be removed after migration**
- Auto-cleanup: **Expired sessions remain in DB** (can add cron job)

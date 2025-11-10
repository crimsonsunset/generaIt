# Database Decision Guide - Chatbot Application

*Last Updated: November 9, 2025*

## Overview

This document provides a comprehensive analysis of database options for the chatbot application, including when you need a database, what technology to choose, and how it integrates with the TanStack Start stack.

---

## Do You Actually Need a Database?

### ❌ Probably NOT Needed (Client-Side is Fine)

| Use Case | Solution | Why It's Sufficient |
|----------|----------|---------------------|
| **Uploaded file data** | IndexedDB | Handles large datasets, survives refresh, works offline |
| **User preferences** | localStorage + Zustand | Simple key-value storage, instant access |
| **Temporary filters** | URL state | Shareable, bookmarkable, no persistence needed |
| **Chart configurations** | localStorage | Personal settings, < 10MB data limit |
| **Session state** | React state + Zustand | Ephemeral by nature |

**Verdict**: For single-user, local-first applications, client-side storage is sufficient and faster.

---

### ✅ Database IS Needed For

| Use Case | Why Database Required | Complexity |
|----------|----------------------|------------|
| **Multi-user features** | Share dashboards between team members | Medium |
| **Authentication** | User accounts, sessions, permissions | High |
| **Persistent annotations** | Comments/notes visible to all users | Medium |
| **Query/filter history** | Sync across devices and sessions | Low |
| **Team collaboration** | Real-time updates, shared state | High |
| **Audit trails** | Track who did what, when | Medium |
| **Scheduled reports** | Background jobs need server persistence | High |

**Verdict**: If assignment mentions "team," "sharing," "collaboration," or "multi-user," you need a database.

---

## Database Use Cases - Detailed

### 1. Saved Dashboard Configurations

**Scenario**: "Users should be able to save and load custom dashboard views"

**Why Database Needed**:
- Persist across devices
- Share with team members
- Version history of configurations

**Schema Example**:
```sql
CREATE TABLE saved_dashboards (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dashboard_shares (
  id UUID PRIMARY KEY,
  dashboard_id UUID REFERENCES saved_dashboards(id),
  shared_with_user_id UUID,
  permission VARCHAR(20) CHECK (permission IN ('view', 'edit'))
);
```

**Time to Implement**: 60-90 minutes with auth

---

### 2. Data Annotations/Comments

**Scenario**: "AI engineers need to annotate anomalies in LLM performance data"

**Why Database Needed**:
- Comments persist across users
- Track who made which annotation
- Search/filter by annotations

**Schema Example**:
```sql
CREATE TABLE annotations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  data_point_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  annotation_type VARCHAR(50), -- 'anomaly', 'insight', 'question'
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_annotations_data_point ON annotations(data_point_id);
CREATE INDEX idx_annotations_timestamp ON annotations(timestamp);
```

**Time to Implement**: 45-60 minutes

---

### 3. Upload History & Metadata

**Scenario**: "Track which team members uploaded which datasets and when"

**Why Database Needed**:
- Audit trail for compliance
- Team visibility
- Search past uploads

**Schema Example**:
```sql
CREATE TABLE uploads (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  row_count INTEGER,
  date_range_start DATE,
  date_range_end DATE,
  metadata JSONB,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_uploads_user ON uploads(user_id);
CREATE INDEX idx_uploads_date ON uploads(uploaded_at);
```

**Time to Implement**: 45-60 minutes

---

### 4. Saved Filters/Queries

**Scenario**: "Save frequently used filter combinations for quick access"

**Why Database Needed**:
- Sync across devices
- Share with team
- Analytics on most-used filters

**Schema Example**:
```sql
CREATE TABLE saved_filters (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  filters JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_saved_filters_user ON saved_filters(user_id);
```

**Time to Implement**: 30-45 minutes

---

## Database Technology Comparison

### Quick Comparison Matrix

| Database | Setup Time | Best For | Scalability | Type Safety | Complexity | Cost |
|----------|-----------|----------|-------------|-------------|------------|------|
| **SQLite** | 5-10 min | Local dev, demos, single-user | Single server | ⭐⭐⭐⭐⭐ Excellent | 🟢 Low | Free |
| **PostgreSQL** | 30-45 min | Production, multi-user, complex queries | Multi-instance | ⭐⭐⭐⭐⭐ Excellent | 🟡 Medium | Free (self-host) |
| **MongoDB** | 10-15 min | Flexible schemas, rapid iteration | Excellent | ⭐⭐⭐ Good | 🟡 Medium | Free tier |
| **Supabase** | 20-30 min | Quick production, auth included | Cloud-managed | ⭐⭐⭐⭐ Very Good | 🟢 Low | Free tier |
| **PlanetScale** | 30-45 min | Serverless, schema branching | Excellent | ⭐⭐⭐⭐ Very Good | 🟡 Medium | Free tier |

---

## Detailed Database Options

### Option 1: SQLite (Recommended for 2-Hour Timeline)

**What It Is**: File-based SQL database, zero-config

**Best For**:
- Take-home assignments
- Local-first applications
- Single-user demos
- Prototyping

**Pros**:
- ✅ Zero external dependencies
- ✅ 5-minute setup
- ✅ Full SQL power
- ✅ Excellent with Drizzle ORM (type-safe)
- ✅ Easy to demo (just commit the .db file)
- ✅ Trivial deployment

**Cons**:
- ❌ Not ideal for multi-user (write concurrency)
- ❌ No remote access without additional setup
- ❌ Limited to single server

**Setup**:
```bash
npm install better-sqlite3 drizzle-orm
npm install --save-dev drizzle-kit
```

**Example Code**:
```typescript
// src/server/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const savedDashboards = sqliteTable('saved_dashboards', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  config: text('config').notNull(), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// src/server/db/client.ts
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('data-explorer.db')
export const db = drizzle(sqlite, { schema })
```

**Time Investment**: 15-30 minutes  
**Impressiveness**: ⭐⭐⭐⭐ (shows pragmatism)

---

### Option 2: PostgreSQL (Production-Grade)

**What It Is**: Industry-standard relational database

**Best For**:
- Production applications
- Multi-user systems
- Complex analytics queries
- Team collaboration features

**Pros**:
- ✅ Industry standard
- ✅ Excellent for relational data
- ✅ JSONB support (best of both worlds)
- ✅ Full-text search, CTEs, window functions
- ✅ Strong ACID guarantees
- ✅ Excellent tooling ecosystem

**Cons**:
- ⏱️ Requires Docker for local dev
- ⏱️ More complex than SQLite
- ⏱️ Need migration strategy
- ⏱️ Deployment requires hosting

**Setup**:
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: dataexplorer
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - '5432:5432'
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

```bash
npm install postgres drizzle-orm
npm install --save-dev drizzle-kit

# Start database
docker-compose up -d
```

**Example Code**:
```typescript
// src/server/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || 
  'postgresql://dev:dev@localhost:5432/dataexplorer'

const client = postgres(connectionString)
export const db = drizzle(client)
```

**Time Investment**: 45-60 minutes  
**Impressiveness**: ⭐⭐⭐⭐⭐ (production-ready)

---

### Option 3: MongoDB (Flexible Schema)

**What It Is**: NoSQL document database

**Best For**:
- Unpredictable data schemas
- Rapid prototyping
- JSON-heavy workloads
- Horizontal scaling needs

**MongoDB Pros**:

#### 1. Schema Flexibility ⭐⭐⭐⭐⭐
```javascript
// Different uploads can have different fields
{
  _id: "123",
  filename: "gpt4_metrics.json",
  data: [
    { date: "2024-01-01", response_time: 1200, tokens: 500 }
  ]
}

{
  _id: "456",
  filename: "claude_metrics.json", 
  data: [
    { date: "2024-01-01", response_time: 900, tokens: 400, temperature: 0.7 }
    // New field 'temperature' - no schema change needed
  ]
}
```

#### 2. JSON-Native Storage ⭐⭐⭐⭐
```javascript
// Store dashboard configs as-is, no serialization
{
  _id: "dash-1",
  userId: "user-123",
  name: "My Custom View",
  config: {
    charts: [{ type: "line", metrics: ["response_time"] }],
    filters: { dateRange: { start: "2024-01-01" } },
    layout: { columns: 2 }
  }
}
```

#### 3. Fast Setup ⭐⭐⭐⭐⭐
```bash
# Local development
docker run -d -p 27017:27017 mongo:7

# Or MongoDB Atlas (free cloud tier)
npm install mongodb mongoose
```

#### 4. No Migrations ⭐⭐⭐
- Add fields on the fly
- No ALTER TABLE needed
- Faster iteration

**MongoDB Cons**:

#### 1. Weak Relationships ⭐⭐⭐⭐⭐
```javascript
// SQL (elegant)
SELECT d.*, u.name FROM dashboards d
JOIN users u ON d.user_id = u.id

// MongoDB (awkward)
const dashboards = await Dashboard.find()
const userIds = dashboards.map(d => d.userId)
const users = await User.find({ _id: { $in: userIds } })
// Manual join in code 😢
```

#### 2. Limited ACID Transactions ⭐⭐⭐⭐
- Complex state changes need manual coordination
- Transactions exist but have limitations

#### 3. Weaker Analytics Queries ⭐⭐⭐
```javascript
// Complex aggregations are more verbose
// Percentile calculations are manual
// Window functions don't exist
```

#### 4. Type Safety Challenges ⭐⭐⭐
```typescript
// Mongoose type safety is loose
const dashboards = await Dashboard.find({ userId })
// Runtime shape might differ from TypeScript type
// Need Zod for runtime validation
```

#### 5. No Foreign Key Constraints ⭐⭐⭐⭐⭐
```javascript
// Can delete user, orphaning all their data
await User.deleteOne({ _id: 'user-123' })
// Dashboards still reference this user - manual cleanup needed
```

**Setup**:
```typescript
// src/server/db/models/dashboard.model.ts
import mongoose from 'mongoose'

const dashboardSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  config: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
})

export const Dashboard = mongoose.model('Dashboard', dashboardSchema)

// Usage
const dashboard = await Dashboard.create({
  userId: 'user-123',
  name: 'My View',
  config: { charts: [...], filters: {...} }
})
```

**Time Investment**: 20-30 minutes  
**Impressiveness**: ⭐⭐⭐ (mixed - some see it as less rigorous)

**When to Choose MongoDB**:
- ✅ Assignment explicitly mentions "flexible schema"
- ✅ Data structure is truly unpredictable
- ✅ Mostly storing JSON blobs as-is
- ✅ You're more comfortable with Mongo

**When to Avoid MongoDB**:
- ❌ Assignment mentions relationships/joins
- ❌ Complex analytics queries needed
- ❌ Type safety is priority
- ❌ Team collaboration features required

---

### Option 4: Supabase (Quick Production)

**What It Is**: Hosted Postgres with auth, realtime, storage included

**Best For**:
- Quick production deployment
- Need auth + database together
- Want managed infrastructure
- Rapid MVP development

**Pros**:
- ✅ Hosted Postgres (no Docker)
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ File storage included
- ✅ Generous free tier
- ✅ Excellent TypeScript support
- ✅ 20-minute setup

**Cons**:
- ❌ External dependency (internet required)
- ❌ Vendor lock-in (somewhat)
- ❌ Free tier has limits (500MB database, 2GB bandwidth)

**Setup**:
```bash
npm install @supabase/supabase-js
```

```typescript
// src/server/db/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Usage
const { data, error } = await supabase
  .from('saved_dashboards')
  .insert({ user_id: userId, name, config })
  .select()
```

**Time Investment**: 20-30 minutes (+ account setup)  
**Impressiveness**: ⭐⭐⭐⭐ (modern, full-featured)

---

### Option 5: PlanetScale (Serverless MySQL)

**What It Is**: Serverless MySQL with database branching

**Best For**:
- Serverless deployment
- Schema versioning (like git)
- Pay-per-use pricing
- MySQL familiarity

**Pros**:
- ✅ Database branching (amazing for CI/CD)
- ✅ Serverless (auto-scaling)
- ✅ Excellent DX with Drizzle
- ✅ Free tier available

**Cons**:
- ❌ No foreign keys (design limitation)
- ❌ Requires account setup
- ❌ MySQL instead of Postgres (minor)

**Time Investment**: 30-45 minutes  
**Impressiveness**: ⭐⭐⭐⭐ (shows DevOps awareness)

---

## MongoDB vs SQL - Decision Matrix

| Factor | MongoDB | PostgreSQL | SQLite |
|--------|---------|-----------|--------|
| **Setup time** | 🟢 10 min | 🟡 30 min | 🟢 5 min |
| **Schema flexibility** | 🟢 Excellent | 🟡 Medium (JSONB helps) | 🟡 Medium |
| **Relationships/Joins** | 🔴 Weak | 🟢 Excellent | 🟢 Excellent |
| **Complex queries** | 🟡 Medium | 🟢 Excellent | 🟢 Good |
| **Type safety** | 🟡 Medium (Mongoose) | 🟢 Excellent (Drizzle) | 🟢 Excellent |
| **ACID transactions** | 🟡 Limited | 🟢 Full ACID | 🟢 Full ACID |
| **Analytics queries** | 🟡 Verbose | 🟢 Powerful | 🟢 Good |
| **Scalability** | 🟢 Excellent | 🟢 Very Good | 🔴 Single file |
| **Data integrity** | 🔴 Application-enforced | 🟢 Database-enforced | 🟢 Database-enforced |
| **Multi-user** | 🟢 Good | 🟢 Excellent | 🔴 Limited |
| **Interview credibility** | 🟡 Mixed | 🟢 Strong | 🟢 Pragmatic |
| **Deployment** | 🟡 Needs hosting | 🟡 Needs hosting | 🟢 Just a file |

---

## Integration with Current Stack

### Current Architecture (No Database)

```
Browser (Client)
├── React Components
├── TanStack Query (cache)
└── IndexedDB (client storage)
         │
         ▼
Server (TanStack Start)
├── Server Functions
├── Memory Cache
└── Mock Data / File System
```

### Architecture WITH Database

```
Browser (Client)
├── React Components
├── TanStack Query (cache)
└── IndexedDB (temporary cache only)
         │
         │ (API calls via server functions)
         ▼
Server (TanStack Start)
├── Server Functions (API layer)
│   └─▶ Service Layer (business logic)
│       └─▶ Repository Layer (data access)
│           ├─▶ Cache Layer (Memory/Redis)
│           └─▶ Database (Postgres/SQLite/Mongo)
```

### File Structure With Database

```
src/
├── routes/                      # Client routes
│   ├── __root.tsx
│   └── dashboard.tsx
│
├── components/                  # React components
├── stores/                      # Zustand (UI state only)
├── hooks/                       # React hooks
│
└── server/                      # Server-only code
    ├── db/                      # Database layer
    │   ├── index.ts            # DB client export
    │   ├── schema.ts           # Table definitions
    │   ├── client.ts           # Connection
    │   └── migrations/         # SQL migrations
    │
    ├── repositories/            # Data access layer
    │   ├── dashboards.repo.ts
    │   └── uploads.repo.ts
    │
    ├── services/                # Business logic
    │   └── dashboard.service.ts
    │
    ├── cache/                   # Caching layer
    │   └── memory-cache.ts
    │
    └── functions/               # Server functions
        └── dashboards.ts
```

### Data Flow Example

```
1. User clicks "Save Dashboard"
   └─▶ Component calls useSaveDashboard()
       
2. TanStack Query mutation
   └─▶ Calls saveDashboard() server function
       
3. Server Function (API layer)
   └─▶ Validates input
       └─▶ Calls DashboardService.save()
           
4. Service Layer (business logic)
   └─▶ Business validations
       └─▶ Calls DashboardRepo.create()
           
5. Repository Layer (data access)
   └─▶ Checks cache first
       └─▶ Cache miss: Query database
           └─▶ Store result in cache
               └─▶ Return data
```

---

## Implementation Time Estimates

| Database | Initial Setup | Schema + Migrations | CRUD Operations | Caching Integration | Total |
|----------|--------------|---------------------|-----------------|-------------------|-------|
| **SQLite** | 5 min | 10 min | 15 min | 10 min | **40 min** |
| **PostgreSQL** | 15 min | 15 min | 15 min | 10 min | **55 min** |
| **MongoDB** | 10 min | 5 min (schema-less) | 10 min | 10 min | **35 min** |
| **Supabase** | 20 min | 10 min | 10 min | 5 min | **45 min** |

**Note**: Times assume you're familiar with the technology. Add 50% if learning as you go.

---

## Recommendation by Scenario

### For 2-Hour Take-Home Assignment

**Winner: SQLite + Drizzle**

**Rationale**:
- ✅ 5-minute setup
- ✅ Full SQL power
- ✅ No external dependencies
- ✅ Excellent type safety
- ✅ Easy to demo
- ✅ Shows pragmatic thinking

**Runner-up: MongoDB Atlas (if truly schema-flexible)**

---

### For Production Showcase Project

**Winner: PostgreSQL + Drizzle**

**Rationale**:
- ✅ Industry standard
- ✅ Production-ready
- ✅ Excellent for analytics
- ✅ Strong interview credibility
- ✅ Easy to migrate from SQLite

**Runner-up: Supabase (if need auth + database quickly)**

---

### For Rapid Prototyping

**Winner: MongoDB + Mongoose**

**Rationale**:
- ✅ Fastest to iterate
- ✅ No migrations
- ✅ Schema flexibility
- ✅ Good for early-stage exploration

---

## Decision Flowchart

```
Does assignment mention:
├─ "Multi-user" or "team"?
│  ├─ YES → Need database
│  │  ├─ Timeline < 2 hours? → SQLite
│  │  └─ Timeline > 2 hours? → PostgreSQL
│  └─ NO → Continue...
│
├─ "Save/load configurations"?
│  ├─ YES → Need database (for sync across devices)
│  │  └─ → SQLite for demo
│  └─ NO → Continue...
│
├─ "Schema flexibility" or "unpredictable data"?
│  ├─ YES → MongoDB
│  └─ NO → Continue...
│
└─ "Analytics" or "complex queries"?
   ├─ YES → PostgreSQL or SQLite
   └─ NO → Client-side storage (IndexedDB) is fine
```

---

## Quick Start Guides

### SQLite Setup (Fastest)

```bash
# 1. Install dependencies
npm install better-sqlite3 drizzle-orm
npm install -D drizzle-kit

# 2. Create schema
# src/server/db/schema.ts
# (see code examples above)

# 3. Generate migration
npx drizzle-kit generate:sqlite

# 4. Apply migration  
npx drizzle-kit push:sqlite

# 5. Use in code
# import { db } from './db/client'
# const dashboards = await db.select().from(savedDashboards)
```

**Total time**: 15 minutes

---

### PostgreSQL Setup (Production)

```bash
# 1. Create docker-compose.yml
# (see config above)

# 2. Start database
docker-compose up -d

# 3. Install dependencies
npm install postgres drizzle-orm
npm install -D drizzle-kit

# 4. Create schema & migrate
# (same as SQLite, but use postgres dialect)

# 5. Connect
# DATABASE_URL=postgresql://dev:dev@localhost:5432/dataexplorer
```

**Total time**: 30-45 minutes

---

### MongoDB Setup (Flexible)

```bash
# 1. Start MongoDB
docker run -d -p 27017:27017 mongo:7

# 2. Install
npm install mongodb mongoose

# 3. Define schema
# (see code examples above)

# 4. Start using
# No migrations needed!
```

**Total time**: 15-20 minutes

---

## Environment Configuration

```bash
# .env

# SQLite
DATABASE_URL="file:./data-explorer.db"

# PostgreSQL
# DATABASE_URL="postgresql://user:pass@localhost:5432/dataexplorer"

# MongoDB
# MONGODB_URI="mongodb://localhost:27017/dataexplorer"

# Supabase
# SUPABASE_URL="https://xxx.supabase.co"
# SUPABASE_ANON_KEY="eyJhbGc..."
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    
    // SQLite
    "db:generate": "drizzle-kit generate:sqlite",
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio",
    
    // PostgreSQL
    "db:generate:pg": "drizzle-kit generate:pg",
    "db:push:pg": "drizzle-kit push:pg",
    
    // Utilities
    "db:seed": "tsx src/server/db/seed.ts",
    "db:reset": "rm -f *.db && npm run db:push && npm run db:seed"
  }
}
```

---

## Caching Strategy With Database

### Cache Database Queries

```typescript
// src/server/functions/dashboards.ts
import { cache } from '../cache/cache-factory'
import { DashboardRepo } from '../repositories/dashboards.repo'

export const getDashboards = createServerFn('GET', async ({ userId }) => {
  const cacheKey = `dashboards:user:${userId}`
  
  // Check cache first
  const cached = await cache.get(cacheKey)
  if (cached) {
    return { data: cached, cached: true }
  }
  
  // Cache miss - query database
  const dashboards = await DashboardRepo.findByUser(userId)
  
  // Store in cache (5 minutes)
  await cache.set(cacheKey, dashboards, 300)
  
  return { data: dashboards, cached: false }
})
```

### Cache Invalidation

```typescript
// src/server/services/dashboard.service.ts
export class DashboardService {
  static async save(data: SaveDashboardInput) {
    const dashboard = await DashboardRepo.create(data)
    
    // Invalidate cache
    await cache.delete(`dashboards:user:${data.userId}`)
    
    return dashboard
  }
}
```

---

## Summary: Key Takeaways

### When to Use What

| Scenario | Database Choice | Rationale |
|----------|----------------|-----------|
| **2-hour deadline, single-user** | SQLite | Fastest, zero config, full SQL |
| **2-hour deadline, multi-user** | MongoDB Atlas | Quick cloud setup, flexible |
| **Production, complex queries** | PostgreSQL | Industry standard, powerful |
| **Need auth + database fast** | Supabase | All-in-one, managed |
| **Unpredictable schema** | MongoDB | Schema-less flexibility |
| **Local-first, offline** | SQLite + IndexedDB | No server required |

### The Rule of Thumb

**Use SQL (SQLite/Postgres) if:**
- You need relationships between entities
- Complex analytics queries are required
- Type safety is important
- Data integrity matters (foreign keys, constraints)

**Use MongoDB if:**
- Schema is truly unpredictable
- You're storing JSON blobs as-is
- Rapid iteration is priority
- You're very comfortable with Mongo

**Use no database if:**
- Single-user application
- Client-side storage is sufficient
- No cross-device sync needed

---

## Final Recommendation

**For the Chatbot application:**

**Start with SQLite + Drizzle ORM**

It's the best balance of:
- ⚡ Speed to implement (40 minutes)
- 💪 Power (full SQL capabilities)
- 🎯 Type safety (excellent with Drizzle)
- 🎓 Interview credibility (shows pragmatism)
- 🔄 Migration path (easy upgrade to Postgres)

Only choose MongoDB if the assignment explicitly mentions "flexible schemas" or "unpredictable data structures."

Only choose PostgreSQL if you have 90+ minutes and want to showcase production-grade setup.

---

*Document created: October 21, 2025*  
*Purpose: Database technology decision guide for take-home assignment*


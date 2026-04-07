---
description: Database schema, proposal content structure, and data flow
---

# Data Model

## Tables (Supabase / PostgreSQL)

### `user_profiles`
Stores company info pre-filled into every new proposal.
```sql
id           uuid PK → auth.users
company_name text
address      text
phone        text
email        text
about_blurb  text   -- used for "About Us" proposal section
updated_at   timestamptz
```
Created on first login via `/onboarding`. Editable via `/settings`.

### `proposals`
```sql
id           uuid PK
user_id      uuid → auth.users
token        text UNIQUE   -- public URL slug (nanoid, 12 chars)
client_name  text
client_email text
title        text
status       text          -- draft | published | signed | paid
price        numeric       -- in INR
content      jsonb         -- all 6 AI-generated sections (see below)
created_at   timestamptz
updated_at   timestamptz
```

### `signatures`
```sql
id             uuid PK
proposal_id    uuid → proposals
signer_name    text
signer_email   text
signature_data text   -- base64 PNG (drawn) or plain text (typed)
signature_type text   -- "drawn" | "typed"
signed_at      timestamptz
ip_address     text
```

### `payments`
```sql
id                  uuid PK
proposal_id         uuid → proposals
razorpay_order_id   text
razorpay_payment_id text
amount              numeric   -- in INR
currency            text      -- "INR"
status              text      -- pending | succeeded | failed
paid_at             timestamptz
```

## Proposal Content JSONB Schema

The `content` field stores all 6 template sections:

```json
{
  "executive_summary": "string",
  "scope_of_work": {
    "deliverables": ["string"],
    "resources": ["string"]
  },
  "timeline": [
    { "phase": "string", "duration": "string" }
  ],
  "expenditure": [
    { "description": "string", "cost": number, "tax_rate": number }
  ],
  "about_us": "string",
  "contact": {
    "company": "string",
    "address": "string",
    "phone": "string",
    "email": "string"
  }
}
```

## RLS Policies
- `user_profiles`: users read/write their own row only
- `proposals`: users CRUD their own; anyone can read `published/signed/paid` by token
- `signatures`: anyone can insert; only proposal owner can read
- `payments`: only proposal owner can read; webhook updates via service role

---
paths:
  - "backend/db/**/*"
  - "backend/models/**/*"
---

# Data Model

## Tables

### `user_profiles`
```sql
id uuid PK → auth.users | company_name | address | phone | email | about_blurb | updated_at
```
Created at `/onboarding`. Editable at `/settings`. Pre-fills `about_us` + `contact` in new proposals.

### `proposals`
```sql
id uuid PK | user_id → auth.users | token text UNIQUE (nanoid 12 chars)
client_name | client_email | title | price numeric (INR)
status: draft | published | signed | paid
content jsonb | created_at | updated_at
```

### `signatures`
```sql
id uuid PK | proposal_id → proposals | signer_name | signer_email
signature_data text (base64 PNG or plain text) | signature_type: drawn | typed
signed_at | ip_address
```

### `payments`
```sql
id uuid PK | proposal_id → proposals
razorpay_order_id | razorpay_payment_id
amount numeric (INR) | currency text | status: pending | succeeded | failed | paid_at
```

## Proposal Content JSONB Schema
```json
{
  "executive_summary": "string",
  "scope_of_work": { "deliverables": ["string"], "resources": ["string"] },
  "timeline": [{ "phase": "string", "duration": "string" }],
  "expenditure": [{ "description": "string", "cost": number, "tax_rate": number }],
  "about_us": "string",
  "contact": { "company": "string", "address": "string", "phone": "string", "email": "string" }
}
```

## RLS Policies
- `user_profiles`: own row only
- `proposals`: own rows + public read for `published/signed/paid` by token
- `signatures`: anyone inserts; owner reads
- `payments`: owner reads; service role updates via webhook

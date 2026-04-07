-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- user_profiles: company info pre-filled into proposals
CREATE TABLE user_profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  company_name text,
  address      text,
  phone        text,
  email        text,
  about_blurb  text,
  updated_at   timestamptz DEFAULT now()
);

-- proposals: core entity
CREATE TABLE proposals (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  token        text UNIQUE NOT NULL,
  client_name  text NOT NULL,
  client_email text NOT NULL,
  title        text NOT NULL,
  status       text NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'published', 'signed', 'paid')),
  price        numeric NOT NULL,
  content      jsonb NOT NULL DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- signatures: e-signature records
CREATE TABLE signatures (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id    uuid REFERENCES proposals ON DELETE CASCADE NOT NULL,
  signer_name    text NOT NULL,
  signer_email   text NOT NULL,
  signature_data text NOT NULL,
  signature_type text NOT NULL CHECK (signature_type IN ('drawn', 'typed')),
  signed_at      timestamptz DEFAULT now(),
  ip_address     text
);

-- payments: Razorpay payment records
CREATE TABLE payments (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id         uuid REFERENCES proposals ON DELETE CASCADE NOT NULL,
  razorpay_order_id   text NOT NULL,
  razorpay_payment_id text,
  amount              numeric NOT NULL,
  currency            text NOT NULL DEFAULT 'INR',
  status              text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'succeeded', 'failed')),
  paid_at             timestamptz
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- user_profiles: users can only read/write their own profile
CREATE POLICY "users_own_profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- proposals: users can only CRUD their own proposals
CREATE POLICY "users_own_proposals" ON proposals
  FOR ALL USING (auth.uid() = user_id);

-- proposals: anyone can read a published/signed/paid proposal by token (public page)
CREATE POLICY "public_read_published_proposals" ON proposals
  FOR SELECT USING (status IN ('published', 'signed', 'paid'));

-- signatures: insert allowed for anyone (client signing), read only for proposal owner
CREATE POLICY "anyone_can_sign" ON signatures
  FOR INSERT WITH CHECK (true);

CREATE POLICY "owner_reads_signatures" ON signatures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = signatures.proposal_id
        AND proposals.user_id = auth.uid()
    )
  );

-- payments: insert/update via service role only (webhook), owner can read
CREATE POLICY "owner_reads_payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM proposals
      WHERE proposals.id = payments.proposal_id
        AND proposals.user_id = auth.uid()
    )
  );

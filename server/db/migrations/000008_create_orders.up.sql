CREATE TYPE status AS ENUM("pending", "confirmed", "shipped", "pickedup", "delivered", "cancelled")
CREATE TYPE fulfillment_type AS ENUM("shipping", "pickup")
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  type fulfillment_type NOT NULL,
  type status NOT NULL,
  street_line_1 TEXT,
  street_line_2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
);


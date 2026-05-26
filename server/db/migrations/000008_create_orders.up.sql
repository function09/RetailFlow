CREATE TYPE order_status AS ENUM('pending', 'confirmed', 'shipped', 'pickedup', 'delivered', 'cancelled');
CREATE TYPE fulfillment_type AS ENUM('shipping', 'pickup');
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id),
  fulfillment fulfillment_type NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  street_line_1 TEXT,
  street_line_2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

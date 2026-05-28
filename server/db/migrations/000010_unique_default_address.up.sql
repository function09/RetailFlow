CREATE UNIQUE INDEX addresses_one_default_per_customer ON addresses (customer_id) WHERE is_default = true;

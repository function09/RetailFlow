ALTER TABLE products DROP COLUMN sku;
ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name);

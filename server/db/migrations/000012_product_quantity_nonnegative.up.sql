UPDATE products SET quantity = 0 WHERE quantity < 0;
UPDATE order_items SET quantity = 0 WHERE quantity < 0;
ALTER TABLE order_items ADD CONSTRAINT quantity_non_negative CHECK (quantity >= 0);
ALTER TABLE products ADD CONSTRAINT quantity_non_negative CHECK (quantity >= 0);


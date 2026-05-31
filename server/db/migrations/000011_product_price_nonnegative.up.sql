UPDATE products SET price = 0 WHERE price < 0;
UPDATE order_items SET price = 0 WHERE price < 0;
ALTER TABLE order_items ADD CONSTRAINT price_non_negative CHECK (price >= 0);
ALTER TABLE products ADD CONSTRAINT price_non_negative CHECK (price >= 0);

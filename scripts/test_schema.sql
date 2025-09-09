-- Test script to verify schema syntax
-- This file contains a minimal version of the schema for testing

-- Test basic table creation
CREATE TABLE test_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    hero_image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test foreign key table
CREATE TABLE test_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES test_products(id) ON DELETE CASCADE,
    retailer TEXT NOT NULL,
    price_amount NUMERIC(12,2),
    price_currency TEXT DEFAULT 'USD',
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test data
INSERT INTO test_products (slug, name, brand, category) 
VALUES ('test-product', 'Test Product', 'Test Brand', 'Test Category');

INSERT INTO test_offers (product_id, retailer, price_amount) 
SELECT id, 'Test Retailer', 29.99 FROM test_products WHERE slug = 'test-product';

-- Verify data
SELECT p.name, p.brand, o.retailer, o.price_amount 
FROM test_products p 
JOIN test_offers o ON p.id = o.product_id;

-- Cleanup
DROP TABLE test_offers;
DROP TABLE test_products;

-- If we get here, the schema syntax is valid
SELECT 'Schema syntax test passed!' as result;

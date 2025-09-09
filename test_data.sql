-- Sample test data for Prism to verify frontend display

-- Add sample offers (pricing data)
INSERT INTO offers (id, product_id, retailer, price_usd, currency, url, scraped_at) VALUES 
(gen_random_uuid(), '697c476e-a937-445f-b68d-6375c6e0cae7', 'Sephora', 150.00, 'USD', 'https://sephora.com/chanel-no5', NOW()),
(gen_random_uuid(), '697c476e-a937-445f-b68d-6375c6e0cae7', 'Ulta', 145.00, 'USD', 'https://ulta.com/chanel-no5', NOW()),
(gen_random_uuid(), 'd9ea7725-bac6-42c6-98f4-61ddbcb4c5ee', 'Sephora', 32.00, 'USD', 'https://sephora.com/nars-orgasm', NOW()),
(gen_random_uuid(), 'f5ff4a32-7d25-46e3-90a8-94ba6b4f0e02', 'MAC', 25.00, 'USD', 'https://maccosmetics.com/ruby-woo', NOW())
ON CONFLICT DO NOTHING;

-- Add sample ratings
INSERT INTO ratings (id, product_id, retailer, rating_avg, rating_count, url, scraped_at) VALUES 
(gen_random_uuid(), '697c476e-a937-445f-b68d-6375c6e0cae7', 'Sephora', 4.5, 1250, 'https://sephora.com/chanel-no5', NOW()),
(gen_random_uuid(), 'd9ea7725-bac6-42c6-98f4-61ddbcb4c5ee', 'Sephora', 4.7, 890, 'https://sephora.com/nars-orgasm', NOW()),
(gen_random_uuid(), 'f5ff4a32-7d25-46e3-90a8-94ba6b4f0e02', 'MAC', 4.3, 2100, 'https://maccosmetics.com/ruby-woo', NOW())
ON CONFLICT DO NOTHING;

-- Add sample reviews
INSERT INTO reviews (id, product_id, retailer, review_snippet, rating, url, scraped_at) VALUES 
(gen_random_uuid(), '697c476e-a937-445f-b68d-6375c6e0cae7', 'Sephora', 'Timeless classic fragrance that never goes out of style', 5, 'https://sephora.com/chanel-no5', NOW()),
(gen_random_uuid(), 'd9ea7725-bac6-42c6-98f4-61ddbcb4c5ee', 'Sephora', 'Perfect peachy pink blush with amazing staying power', 5, 'https://sephora.com/nars-orgasm', NOW()),
(gen_random_uuid(), 'f5ff4a32-7d25-46e3-90a8-94ba6b4f0e02', 'MAC', 'Bold red lipstick with incredible matte finish', 4, 'https://maccosmetics.com/ruby-woo', NOW())
ON CONFLICT DO NOTHING;

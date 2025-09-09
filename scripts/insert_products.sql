-- Insert the 10 iconic beauty products
INSERT INTO products (slug, name, brand, category, hero_image_url, description) VALUES
('chanel-no5-eau-de-parfum', 'Chanel N°5 Eau de Parfum', 'Chanel', 'Fragrance', '/images/chanel-no5.jpg', 'The world''s most famous fragrance, a timeless classic with notes of rose, jasmine, and vanilla.'),
('nars-blush-orgasm', 'NARS Blush "Orgasm"', 'NARS', 'Makeup', '/images/nars-orgasm.jpg', 'Iconic peachy-pink blush with golden shimmer that flatters all skin tones.'),
('mac-retro-matte-ruby-woo', 'MAC Retro Matte Lipstick "Ruby Woo"', 'MAC', 'Makeup', '/images/mac-ruby-woo.jpg', 'Classic blue-red matte lipstick that never goes out of style.'),
('estee-lauder-advanced-night-repair', 'Estée Lauder Advanced Night Repair Serum', 'Estée Lauder', 'Skincare', '/images/estee-lauder-anr.jpg', 'Revolutionary anti-aging serum that repairs skin while you sleep.'),
('sk-ii-facial-treatment-essence', 'SK-II Facial Treatment Essence', 'SK-II', 'Skincare', '/images/sk-ii-essence.jpg', 'Luxury essence with Pitera™ that transforms skin texture and radiance.'),
('la-mer-creme-de-la-mer', 'La Mer Crème de la Mer', 'La Mer', 'Skincare', '/images/la-mer-creme.jpg', 'Ultra-luxurious moisturizing cream with Miracle Broth™ for ultimate skin renewal.'),
('bioderma-sensibio-h2o', 'Bioderma Sensibio H2O Micellar Water', 'Bioderma', 'Skincare', '/images/bioderma-micellar.jpg', 'Gentle micellar water that removes makeup and cleanses sensitive skin.'),
('maybelline-great-lash', 'Maybelline Great Lash Mascara', 'Maybelline', 'Makeup', '/images/maybelline-great-lash.jpg', 'Iconic mascara that defines and lengthens lashes with its signature pink and green tube.'),
('beautyblender-original', 'Beautyblender Original Sponge', 'Beautyblender', 'Tools', '/images/beautyblender-sponge.jpg', 'Revolutionary makeup sponge that creates flawless, airbrushed-looking foundation application.'),
('shu-uemura-eyelash-curler', 'Shu Uemura Eyelash Curler', 'Shu Uemura', 'Tools', '/images/shu-uemura-curler.jpg', 'Professional-grade eyelash curler that creates perfect, long-lasting curls.');

-- Show the inserted products
SELECT id, slug, name, brand FROM products ORDER BY id;


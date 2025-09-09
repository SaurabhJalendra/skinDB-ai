-- Beauty Aggregator Database Schema
-- Phase 1: Core tables for products, offers, ratings, reviews, specs, and summaries

-- Enable UUID extension for better ID management
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table - core product information
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    hero_image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table - retailer pricing and availability
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    retailer TEXT NOT NULL,
    price_amount NUMERIC(12,2),
    price_currency TEXT DEFAULT 'USD',
    unit_price TEXT,
    availability TEXT,
    promo TEXT,
    url TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table - retailer ratings and reviews
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    retailer TEXT NOT NULL,
    average NUMERIC(3,2),
    count INT,
    breakdown JSONB,
    url TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table - individual review data
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    retailer TEXT NOT NULL,
    author TEXT,
    rating NUMERIC(3,2),
    title TEXT,
    body TEXT,
    posted_at TIMESTAMP WITH TIME ZONE,
    url TEXT,
    helpful_count INT DEFAULT 0,
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Specs table - product specifications
CREATE TABLE specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT,
    source TEXT,
    url TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Summaries table - AI-generated product summaries
CREATE TABLE summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    pros TEXT[],
    cons TEXT[],
    verdict TEXT,
    aspect_scores JSONB,
    citations JSONB,
    model_name TEXT,
    prompt_hash TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price history table - daily price tracking for trend analysis
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    retailer TEXT NOT NULL,
    price_amount NUMERIC(12,2),
    price_currency TEXT,
    url TEXT,
    day DATE NOT NULL,           -- day bucket (UTC)
    inserted_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (product_id, retailer, day)
);

-- Create indexes for better query performance
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_offers_product_id ON offers(product_id);
CREATE INDEX idx_offers_retailer ON offers(retailer);
CREATE INDEX idx_ratings_product_id ON ratings(product_id);
CREATE INDEX idx_ratings_retailer ON ratings(retailer);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_retailer ON reviews(retailer);
CREATE INDEX idx_specs_product_id ON specs(product_id);
CREATE INDEX idx_summaries_product_id ON summaries(product_id);
CREATE INDEX idx_price_history_product_day ON price_history(product_id, day);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to products table
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to summaries table
CREATE TRIGGER update_summaries_updated_at 
    BEFORE UPDATE ON summaries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

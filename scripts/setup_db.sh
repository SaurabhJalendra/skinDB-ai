#!/bin/bash

# Beauty Aggregator Database Setup Script
# Phase 1: Database creation and seeding

set -e

echo "🚀 Setting up Beauty Aggregator database..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Check if database already exists
if psql -lqt | cut -d \| -f 1 | grep -qw beauty_agg; then
    echo "⚠️  Database 'beauty_agg' already exists. Dropping it..."
    dropdb beauty_agg
fi

# Create database
echo "📦 Creating database 'beauty_agg'..."
createdb beauty_agg

# Apply schema
echo "🏗️  Applying database schema..."
psql beauty_agg -f ../db/schema.sql

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Set your DATABASE_URL environment variable:"
echo "   export DATABASE_URL='postgresql://username:password@localhost:5432/beauty_agg'"
echo "2. Install dependencies: npm install"
echo "3. Seed products: npm run seed"
echo ""
echo "Or run: npm install && npm run seed"

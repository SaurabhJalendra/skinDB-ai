#!/bin/bash

# Docker initialization script for Beauty Aggregator
# This script sets up the database and seeds initial data

set -e

echo "🚀 Initializing Beauty Aggregator database..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h db -p 5432 -U app -d beauty_agg; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Initialize database schema
echo "📋 Creating database schema..."
psql postgresql://app:app@db:5432/beauty_agg -f /workspace/db/schema.sql

# Seed initial products
echo "🌱 Seeding initial products..."
node /workspace/scripts/seed_products.ts

echo "🎉 Database initialization complete!"
echo "📊 You can now access:"
echo "   - FastAPI: http://localhost:8000/docs"
echo "   - Next.js: http://localhost:3000"


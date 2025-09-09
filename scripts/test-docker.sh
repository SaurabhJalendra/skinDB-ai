#!/bin/bash

# Test script for Docker deployment
# This script verifies that all services are running correctly

set -e

echo "🧪 Testing Docker deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
    echo "❌ Docker Compose is not available"
    exit 1
fi

echo "✅ Docker Compose is available"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp env.example .env
    echo "📝 Please edit .env file with your OPENROUTER_API_KEY"
fi

echo "✅ Environment configuration ready"

# Test database connection
echo "🔍 Testing database connection..."
if docker compose exec -T db pg_isready -U app -d beauty_agg > /dev/null 2>&1; then
    echo "✅ Database is accessible"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Test FastAPI health endpoint
echo "🔍 Testing FastAPI health endpoint..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ FastAPI is responding"
else
    echo "❌ FastAPI health check failed"
    exit 1
fi

# Test Next.js frontend
echo "🔍 Testing Next.js frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Next.js is responding"
else
    echo "❌ Next.js frontend check failed"
    exit 1
fi

echo "🎉 All Docker services are running correctly!"
echo "📊 Access your application:"
echo "   - Frontend: http://localhost:3000"
echo "   - API Docs: http://localhost:8000/docs"
echo "   - Admin: http://localhost:3000/admin"


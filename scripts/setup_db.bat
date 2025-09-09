@echo off
REM Beauty Aggregator Database Setup Script for Windows
REM Phase 1: Database creation and seeding

echo 🚀 Setting up Beauty Aggregator database...

REM Check if PostgreSQL is running (basic check)
pg_isready >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL is not running. Please start PostgreSQL first.
    pause
    exit /b 1
)

REM Check if database already exists
psql -lqt | findstr "beauty_agg" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Database 'beauty_agg' already exists. Dropping it...
    dropdb beauty_agg
)

REM Create database
echo 📦 Creating database 'beauty_agg'...
createdb beauty_agg

REM Apply schema
echo 🏗️  Applying database schema...
psql beauty_agg -f ..\db\schema.sql

echo ✅ Database setup complete!
echo.
echo Next steps:
echo 1. Set your DATABASE_URL environment variable:
echo    set DATABASE_URL=postgresql://username:password@localhost:5432/beauty_agg
echo 2. Install dependencies: npm install
echo 3. Seed products: npm run seed
echo.
echo Or run: npm install ^&^& npm run seed
pause

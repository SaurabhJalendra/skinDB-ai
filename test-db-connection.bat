@echo off
REM 🔍 Beauty Aggregator - Database Connection Test Script (Windows)
REM This script tests the database connection independently

setlocal enabledelayedexpansion

if "%1"=="help" goto show_help
if "%1"=="-h" goto show_help
if "%1"=="--help" goto show_help

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║           🔍 Database Connection Test                        ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Determine Docker Compose command
docker-compose --version >nul 2>&1
if errorlevel 1 (
    set COMPOSE_CMD=docker compose
) else (
    set COMPOSE_CMD=docker-compose
)

if "%1"=="tables" goto show_tables
if "%1"=="products" goto show_products

REM Default: run all tests
echo [INFO] Testing database connection...

REM 1. Check if database container is running
echo [INFO] 1. Checking if database container is running...
%COMPOSE_CMD% ps db | findstr "Up" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Database container is not running
    echo [ERROR] Start the application first: start-app.bat
    pause
    exit /b 1
)
echo [SUCCESS] Database container is running

REM 2. Test PostgreSQL readiness
echo [INFO] 2. Testing PostgreSQL readiness...
%COMPOSE_CMD% exec -T db pg_isready -U app -d beauty_agg >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PostgreSQL is not ready
    pause
    exit /b 1
)
echo [SUCCESS] PostgreSQL is ready for connections

REM 3. Test database connection
echo [INFO] 3. Testing database connection...
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Database connection failed
    pause
    exit /b 1
)
echo [SUCCESS] Database connection successful

REM 4. Check database schema
echo [INFO] 4. Checking database schema...
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Could not check database schema
) else (
    for /f %%i in ('%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"') do set table_count=%%i
    if !table_count! gtr 0 (
        echo [SUCCESS] Database schema exists (!table_count! tables)
    ) else (
        echo [WARNING] Database schema not found (tables: !table_count!)
    )
)

REM 5. Check products data
echo [INFO] 5. Checking products data...
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM products;" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Products table not found
) else (
    for /f %%i in ('%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -t -c "SELECT COUNT(*) FROM products;"') do set product_count=%%i
    if !product_count! gtr 0 (
        echo [SUCCESS] Products data exists (!product_count! products)
    ) else (
        echo [WARNING] No products found in database
    )
)

REM 6. Show database info
echo [INFO] 6. Database information:
echo    Host: localhost
echo    Port: 5432
echo    Database: beauty_agg
echo    Username: app
echo    Password: app

echo.
echo [SUCCESS] All database tests passed! ✅
echo.
pause
goto end

:show_tables
echo [INFO] Database tables:
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "\dt" 2>nul
if errorlevel 1 (
    echo [ERROR] Could not list tables
    pause
    exit /b 1
)
pause
goto end

:show_products
echo [INFO] Products in database:
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT name, brand, category FROM products ORDER BY brand, name;" 2>nul
if errorlevel 1 (
    echo [ERROR] Could not list products
    pause
    exit /b 1
)
pause
goto end

:show_help
echo Database Connection Test Script
echo.
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   test       Run all database connection tests (default)
echo   tables     Show database tables
echo   products   Show products in database
echo   help       Show this help message
echo.
echo Examples:
echo   %0              # Run all tests
echo   %0 test         # Run all tests
echo   %0 tables       # Show database tables
echo   %0 products     # Show products
echo.
pause

:end

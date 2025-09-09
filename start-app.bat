@echo off
REM 🎨 Prism - Full Application Startup Script (Windows)
REM This script starts the complete Prism application with all services

setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║            🎨 Prism Application                  ║
echo ║                 Premium AI-Powered Beauty Intelligence       ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo [INFO] Starting Prism Application...
echo.

REM Check if Docker is installed and running
echo [INFO] Checking Docker installation and status...

docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    echo Visit: https://docs.docker.com/desktop/windows/
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [SUCCESS] Docker is installed and running

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Docker Compose is not available. Please update Docker Desktop.
        pause
        exit /b 1
    )
    set COMPOSE_CMD=docker compose
) else (
    set COMPOSE_CMD=docker-compose
)

REM Check environment file
echo [INFO] Checking environment configuration...

if not exist ".env" (
    echo [WARNING] .env file not found. Creating from template...
    
    if exist "env.example" (
        copy env.example .env >nul
        echo [WARNING] Please edit .env file and add your OPENROUTER_API_KEY
        echo [WARNING] You can get an API key from: https://openrouter.ai/
        echo.
        echo Opening .env file for editing...
        
        REM Try to open with notepad
        start notepad .env
        
        echo.
        echo Press any key after you've added your API key to continue...
        pause >nul
    ) else (
        echo [ERROR] env.example file not found. Please create a .env file manually.
        pause
        exit /b 1
    )
)

REM Check if API key is set (basic check)
findstr "OPENROUTER_API_KEY=sk-xxxx" .env >nul
if not errorlevel 1 (
    echo [ERROR] Please set a valid OPENROUTER_API_KEY in your .env file
    pause
    exit /b 1
)

findstr "OPENROUTER_API_KEY=$" .env >nul
if not errorlevel 1 (
    echo [ERROR] Please set a valid OPENROUTER_API_KEY in your .env file
    pause
    exit /b 1
)

echo [SUCCESS] Environment configuration looks good

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "logs" mkdir logs
if not exist "data" mkdir data
echo [SUCCESS] Directories created

REM Stop existing containers
echo [INFO] Stopping any existing containers...
%COMPOSE_CMD% down --remove-orphans >nul 2>&1
echo [SUCCESS] Existing containers stopped

REM Build and start services
echo [INFO] Building and starting all services...
echo [INFO] This may take a few minutes on first run...

%COMPOSE_CMD% up --build -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo [SUCCESS] Services started in background

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...

REM Wait for database container
echo [INFO] Waiting for database container...
set attempt=0
:wait_db_container
if !attempt! geq 30 (
    echo [ERROR] Database container failed to start
    pause
    exit /b 1
)
%COMPOSE_CMD% ps db | findstr "Up" >nul 2>&1
if errorlevel 1 (
    set /a attempt+=1
    echo|set /p="."
    timeout /t 2 /nobreak >nul
    goto wait_db_container
)
echo.
echo [SUCCESS] Database container is running

REM Wait for PostgreSQL to accept connections
echo [INFO] Waiting for PostgreSQL to accept connections...
set attempt=0
:wait_db_ready
if !attempt! geq 30 (
    echo [ERROR] PostgreSQL failed to accept connections within expected time
    echo [ERROR] Check database logs: logs.bat db
    pause
    exit /b 1
)
%COMPOSE_CMD% exec -T db pg_isready -U app -d beauty_agg >nul 2>&1
if errorlevel 1 (
    set /a attempt+=1
    echo|set /p="."
    timeout /t 2 /nobreak >nul
    goto wait_db_ready
)
echo.
echo [SUCCESS] PostgreSQL is accepting connections

REM Test database connection
echo [INFO] Testing database connection...
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Database connection test failed
    echo [ERROR] Check database logs: logs.bat db
    pause
    exit /b 1
)
echo [SUCCESS] Database connection test successful

REM Wait for backend API
echo [INFO] Waiting for backend API...
set attempt=0
:wait_api
if !attempt! geq 30 (
    echo [ERROR] Backend API failed to start within expected time
    pause
    exit /b 1
)
curl -f http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    set /a attempt+=1
    echo|set /p="."
    timeout /t 3 /nobreak >nul
    goto wait_api
)
echo.
echo [SUCCESS] Backend API is ready

REM Wait for frontend
echo [INFO] Waiting for frontend...
set attempt=0
:wait_frontend
if !attempt! geq 30 (
    echo [ERROR] Frontend failed to start within expected time
    pause
    exit /b 1
)
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    set /a attempt+=1
    echo|set /p="."
    timeout /t 3 /nobreak >nul
    goto wait_frontend
)
echo.
echo [SUCCESS] Frontend is ready

REM Initialize database
echo [INFO] Initializing database with schema and seed data...

REM Check if database is already initialized
echo [INFO] Checking if database is already initialized...
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" >nul 2>&1
if not errorlevel 1 (
    for /f %%i in ('%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"') do set existing_tables=%%i
    if !existing_tables! gtr 0 (
        echo [WARNING] Database already contains !existing_tables! tables
        echo [INFO] Checking if products table has data...
        
        %COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM products;" >nul 2>&1
        if not errorlevel 1 (
            for /f %%i in ('%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -t -c "SELECT COUNT(*) FROM products;"') do set product_count=%%i
            if !product_count! gtr 0 (
                echo [SUCCESS] Database already initialized with !product_count! products
                goto database_ready
            )
        )
    )
)

REM Apply database schema
echo [INFO] Applying database schema...
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg < db/schema.sql
if errorlevel 1 (
    echo [WARNING] Schema application had warnings (normal if tables exist)
) else (
    echo [SUCCESS] Database schema applied successfully
)

REM Verify schema was applied
echo [INFO] Verifying database schema...
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Database schema verification failed
    pause
    exit /b 1
)

REM Seed initial products
echo [INFO] Seeding initial products...
cd scripts
if exist "package.json" (
    echo [INFO] Installing Node.js dependencies...
    call npm install --silent
    
    echo [INFO] Running product seeding script...
    set DATABASE_URL=postgresql://app:app@localhost:5432/beauty_agg
    call npm run seed
    if errorlevel 1 (
        echo [ERROR] Product seeding failed
        cd ..
        pause
        exit /b 1
    )
    echo [SUCCESS] Product seeding completed successfully
) else (
    echo [WARNING] Scripts package.json not found, skipping seed...
)
cd ..

REM Verify products were seeded
echo [INFO] Verifying product data...
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM products;" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Product verification failed
    pause
    exit /b 1
)

for /f %%i in ('%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -t -c "SELECT COUNT(*) FROM products;"') do set final_count=%%i
if !final_count! gtr 0 (
    echo [SUCCESS] Database initialization completed with !final_count! products
) else (
    echo [ERROR] Product verification failed - no products found in database
    pause
    exit /b 1
)

:database_ready

REM Show application status
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                   🎉 APPLICATION READY! 🎉                   ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Frontend (Next.js):     http://localhost:3000
echo 🔧 Backend API:           http://localhost:8000
echo 📚 API Documentation:    http://localhost:8000/docs
echo 🗄️  Database:             localhost:5432 (beauty_agg)
echo.
echo 📊 Default Login Credentials:
echo    Database: app / app
echo.
echo 📋 Quick Commands:
echo    View logs:           logs.bat
echo    Stop application:    stop-app.bat
echo    Restart application: restart-app.bat
echo.
echo 🎨 Featured Products:
echo    • Chanel N°5 Eau de Parfum
echo    • NARS Blush "Orgasm"
echo    • MAC Retro Matte "Ruby Woo"
echo    • Estée Lauder Advanced Night Repair
echo    • And 6 more luxury beauty products!
echo.
echo Ready to aggregate some beauty data! ✨
echo.

REM Check if user wants to follow logs
if "%1"=="--follow-logs" goto follow_logs
if "%1"=="-f" goto follow_logs
goto end

:follow_logs
echo [INFO] Following application logs (Ctrl+C to stop)...
%COMPOSE_CMD% logs -f

:end
echo Press any key to exit...
pause >nul

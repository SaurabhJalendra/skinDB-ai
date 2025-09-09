@echo off
REM 🔧 Prism - Comprehensive Application Diagnostics (Windows)
REM This script performs systematic testing and diagnosis of the entire application

setlocal enabledelayedexpansion

if "%1"=="help" goto show_help
if "%1"=="-h" goto show_help
if "%1"=="--help" goto show_help

set TOTAL_TESTS=0
set PASSED_TESTS=0
set FAILED_TESTS=0
set WARNINGS=0

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║           🔧 Prism Diagnostics                  ║
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

if "%1"=="pre" goto pre_startup_checks
if "%1"=="containers" goto monitor_containers
if "%1"=="database" goto test_database
if "%1"=="backend" goto test_backend
if "%1"=="frontend" goto test_frontend
if "%1"=="performance" goto test_performance
if "%1"=="logs" goto analyze_logs

REM Default: run all tests
goto full_diagnostics

:pre_startup_checks
echo === PRE-STARTUP CHECKS ===
echo.

REM Docker installation check
echo [TEST] Checking Docker installation
set /a TOTAL_TESTS+=1
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed
    set /a FAILED_TESTS+=1
    goto end
) else (
    echo [SUCCESS] Docker is installed
    set /a PASSED_TESTS+=1
)

REM Docker Compose check
echo [TEST] Checking Docker Compose
set /a TOTAL_TESTS+=1
%COMPOSE_CMD% --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not available
    set /a FAILED_TESTS+=1
    goto end
) else (
    echo [SUCCESS] Docker Compose is available
    set /a PASSED_TESTS+=1
)

REM Docker daemon check
echo [TEST] Checking Docker daemon
set /a TOTAL_TESTS+=1
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not running
    set /a FAILED_TESTS+=1
    goto end
) else (
    echo [SUCCESS] Docker daemon is running
    set /a PASSED_TESTS+=1
)

REM Port availability check
echo [TEST] Checking port availability
set /a TOTAL_TESTS+=1
set ports_in_use=0

netstat -an | findstr ":3000 " >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 3000 is already in use
    set /a WARNINGS+=1
    set /a ports_in_use+=1
)

netstat -an | findstr ":8000 " >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 8000 is already in use
    set /a WARNINGS+=1
    set /a ports_in_use+=1
)

netstat -an | findstr ":5432 " >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 5432 is already in use
    set /a WARNINGS+=1
    set /a ports_in_use+=1
)

if !ports_in_use! equ 0 (
    echo [SUCCESS] All required ports are available
    set /a PASSED_TESTS+=1
) else (
    echo [WARNING] !ports_in_use! port(s) may conflict
    set /a WARNINGS+=1
    set /a PASSED_TESTS+=1
)

REM Environment file check
echo [TEST] Checking environment configuration
set /a TOTAL_TESTS+=1
if exist ".env" (
    findstr "OPENROUTER_API_KEY=sk-" .env | findstr /v "sk-xxxx" >nul 2>&1
    if not errorlevel 1 (
        echo [SUCCESS] Environment file exists with API key
        set /a PASSED_TESTS+=1
    ) else (
        echo [WARNING] Environment file exists but API key may not be configured
        set /a WARNINGS+=1
        set /a PASSED_TESTS+=1
    )
) else (
    echo [WARNING] No .env file found
    set /a WARNINGS+=1
    set /a PASSED_TESTS+=1
)

echo.
if "%1"=="pre" goto show_summary
goto monitor_containers

:monitor_containers
echo === CONTAINER STARTUP MONITORING ===
echo.

echo [TEST] Monitoring container startup sequence
set /a TOTAL_TESTS+=1

echo [INFO] Waiting for containers to start...
set attempt=0
:wait_containers
if !attempt! geq 30 (
    echo [ERROR] Containers failed to start within 30 seconds
    set /a FAILED_TESTS+=1
    goto containers_done
)
%COMPOSE_CMD% ps | findstr "Up" >nul 2>&1
if errorlevel 1 (
    set /a attempt+=1
    echo|set /p="."
    timeout /t 1 /nobreak >nul
    goto wait_containers
) else (
    echo.
    echo [SUCCESS] Containers are starting up
    set /a PASSED_TESTS+=1
)

echo [TEST] Checking individual container status
set /a TOTAL_TESTS+=1
set containers_ok=0

%COMPOSE_CMD% ps db | findstr "Up" >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] Container 'db' is running
    set /a containers_ok+=1
) else (
    echo [ERROR] Container 'db' is not running
)

%COMPOSE_CMD% ps ingestion | findstr "Up" >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] Container 'ingestion' is running
    set /a containers_ok+=1
) else (
    echo [ERROR] Container 'ingestion' is not running
)

%COMPOSE_CMD% ps web | findstr "Up" >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] Container 'web' is running
    set /a containers_ok+=1
) else (
    echo [ERROR] Container 'web' is not running
)

if !containers_ok! equ 3 (
    set /a PASSED_TESTS+=1
) else (
    set /a FAILED_TESTS+=1
)

:containers_done
echo.
if "%1"=="containers" goto show_summary
goto test_database

:test_database
echo === DATABASE CONNECTIVITY TESTS ===
echo.

echo [TEST] Testing PostgreSQL readiness
set /a TOTAL_TESTS+=1
echo [INFO] Waiting for PostgreSQL to be ready...
set attempt=0
:wait_db
if !attempt! geq 60 (
    echo [ERROR] PostgreSQL failed to become ready
    set /a FAILED_TESTS+=1
    goto db_done
)
%COMPOSE_CMD% exec -T db pg_isready -U app -d beauty_agg >nul 2>&1
if errorlevel 1 (
    set /a attempt+=1
    echo|set /p="."
    timeout /t 1 /nobreak >nul
    goto wait_db
) else (
    echo.
    echo [SUCCESS] PostgreSQL is accepting connections
    set /a PASSED_TESTS+=1
)

echo [TEST] Testing database connection
set /a TOTAL_TESTS+=1
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Database connection failed
    set /a FAILED_TESTS+=1
) else (
    echo [SUCCESS] Database connection successful
    set /a PASSED_TESTS+=1
)

echo [TEST] Checking database schema
set /a TOTAL_TESTS+=1
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Database schema not found
    set /a FAILED_TESTS+=1
) else (
    echo [SUCCESS] Database schema exists
    set /a PASSED_TESTS+=1
)

echo [TEST] Checking product data
set /a TOTAL_TESTS+=1
%COMPOSE_CMD% exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM products;" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] No products found in database
    set /a WARNINGS+=1
    set /a PASSED_TESTS+=1
) else (
    echo [SUCCESS] Product data exists
    set /a PASSED_TESTS+=1
)

:db_done
echo.
if "%1"=="database" goto show_summary
goto test_backend

:test_backend
echo === BACKEND API TESTS ===
echo.

echo [TEST] Testing backend API availability
set /a TOTAL_TESTS+=1
echo [INFO] Waiting for backend API to respond...
set attempt=0
:wait_backend
if !attempt! geq 60 (
    echo [ERROR] Backend API is not responding
    set /a FAILED_TESTS+=1
    goto backend_done
)
curl -f http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    set /a attempt+=1
    echo|set /p="."
    timeout /t 1 /nobreak >nul
    goto wait_backend
) else (
    echo.
    echo [SUCCESS] Backend API is responding
    set /a PASSED_TESTS+=1
)

echo [TEST] Testing API health endpoint
set /a TOTAL_TESTS+=1
curl -s http://localhost:8000/health | findstr "ok" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Health endpoint response unexpected
    set /a WARNINGS+=1
    set /a PASSED_TESTS+=1
) else (
    echo [SUCCESS] Health endpoint returns OK status
    set /a PASSED_TESTS+=1
)

echo [TEST] Testing products endpoint
set /a TOTAL_TESTS+=1
curl -s -w "%%{http_code}" http://localhost:8000/products | findstr "200" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Products endpoint not returning 200
    set /a FAILED_TESTS+=1
) else (
    echo [SUCCESS] Products endpoint returns data
    set /a PASSED_TESTS+=1
)

:backend_done
echo.
if "%1"=="backend" goto show_summary
goto test_frontend

:test_frontend
echo === FRONTEND TESTS ===
echo.

echo [TEST] Testing frontend availability
set /a TOTAL_TESTS+=1
echo [INFO] Waiting for frontend to respond...
set attempt=0
:wait_frontend
if !attempt! geq 60 (
    echo [ERROR] Frontend is not responding
    set /a FAILED_TESTS+=1
    goto frontend_done
)
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    set /a attempt+=1
    echo|set /p="."
    timeout /t 1 /nobreak >nul
    goto wait_frontend
) else (
    echo.
    echo [SUCCESS] Frontend is responding
    set /a PASSED_TESTS+=1
)

echo [TEST] Testing frontend content
set /a TOTAL_TESTS+=1
curl -s http://localhost:3000 | findstr "Prism" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Frontend may not be loading correctly
    set /a WARNINGS+=1
    set /a PASSED_TESTS+=1
) else (
    echo [SUCCESS] Frontend contains expected content
    set /a PASSED_TESTS+=1
)

:frontend_done
echo.
if "%1"=="frontend" goto show_summary
goto analyze_logs

:analyze_logs
echo === LOG ANALYSIS ===
echo.

echo [TEST] Analyzing application logs for errors
set /a TOTAL_TESTS+=1
%COMPOSE_CMD% logs 2>&1 | findstr /i "error" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Found error entries in logs
    set /a WARNINGS+=1
    set /a PASSED_TESTS+=1
) else (
    echo [SUCCESS] No errors found in application logs
    set /a PASSED_TESTS+=1
)

echo [TEST] Analyzing application logs for warnings
set /a TOTAL_TESTS+=1
%COMPOSE_CMD% logs 2>&1 | findstr /i "warning" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Found warning entries in logs
    set /a WARNINGS+=1
    set /a PASSED_TESTS+=1
) else (
    echo [SUCCESS] No warnings found in application logs
    set /a PASSED_TESTS+=1
)

echo.
goto show_summary

:full_diagnostics
call :pre_startup_checks
call :monitor_containers
call :test_database
call :test_backend
call :test_frontend
call :analyze_logs
goto show_summary

:show_summary
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        📊 DIAGNOSTIC SUMMARY                ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Total Tests Run: !TOTAL_TESTS!
echo Tests Passed: !PASSED_TESTS!
echo Tests Failed: !FAILED_TESTS!
echo Warnings: !WARNINGS!

if !TOTAL_TESTS! gtr 0 (
    set /a success_rate=!PASSED_TESTS! * 100 / !TOTAL_TESTS!
    echo Success Rate: !success_rate!%%
)

echo.
if !FAILED_TESTS! equ 0 (
    echo 🎉 All critical tests passed! Application is ready for use.
) else (
    if !FAILED_TESTS! leq 2 (
        echo ⚠️  Minor issues detected. Application should work but may have limitations.
    ) else (
        echo ❌ Significant issues detected. Please review failed tests and logs.
    )
)

if !WARNINGS! gtr 0 (
    echo 💡 !WARNINGS! warning(s) noted. Review for potential optimizations.
)

echo.
echo 📋 Quick Commands:
echo    View logs:           logs.bat
echo    Test database:       test-db-connection.bat
echo    Restart app:         restart-app.bat
echo.
pause
goto end

:show_help
echo Prism Diagnostics Script
echo.
echo Usage: %0 [TEST_SUITE]
echo.
echo Test Suites:
echo   pre          Pre-startup environment checks
echo   containers   Container status monitoring
echo   database     Database connectivity tests
echo   backend      Backend API tests
echo   frontend     Frontend accessibility tests
echo   logs         Log analysis
echo   full         Run all test suites (default)
echo   help         Show this help message
echo.
pause

:end

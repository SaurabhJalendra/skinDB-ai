@echo off
REM 🛑 Beauty Aggregator - Stop Application Script (Windows)
REM This script stops all services and cleans up containers

setlocal enabledelayedexpansion

if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║              🛑 Stopping Beauty Aggregator                  ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo [INFO] Stopping all Beauty Aggregator services...

REM Determine Docker Compose command
docker-compose --version >nul 2>&1
if errorlevel 1 (
    set COMPOSE_CMD=docker compose
) else (
    set COMPOSE_CMD=docker-compose
)

REM Stop services based on options
if "%1"=="--clean" goto clean_stop
if "%1"=="-c" goto clean_stop

REM Normal stop
echo [INFO] Stopping services...
%COMPOSE_CMD% down --remove-orphans
if errorlevel 1 (
    echo [WARNING] Some containers might not have stopped properly
) else (
    echo [SUCCESS] Services stopped
)
goto check_status

:clean_stop
echo [INFO] Stopping services and removing containers, networks, and volumes...
%COMPOSE_CMD% down --volumes --remove-orphans
if errorlevel 1 (
    echo [WARNING] Some resources might not have been cleaned up properly
) else (
    echo [INFO] Cleaning up unused Docker images...
    docker image prune -f >nul 2>&1
    echo [SUCCESS] Complete cleanup performed
)

:check_status
echo [INFO] Checking remaining containers...

REM Show any remaining containers (simplified check)
docker ps -a --filter "name=skindb-ai" >nul 2>&1
if errorlevel 1 (
    echo [SUCCESS] All Beauty Aggregator containers have been stopped
) else (
    echo [WARNING] Some containers might still be running
    echo Run 'docker ps -a' to check manually
)

echo.
echo [SUCCESS] Beauty Aggregator application stopped successfully
echo To start again, run: start-app.bat
echo.
pause
goto end

:show_help
echo Beauty Aggregator - Stop Application Script
echo.
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   -c, --clean    Stop services and clean up all containers, networks, and volumes
echo   -h, --help     Show this help message
echo.
echo Examples:
echo   %0             Stop services (containers remain for quick restart)
echo   %0 --clean     Stop services and perform complete cleanup
echo.
pause

:end

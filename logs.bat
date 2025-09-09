@echo off
REM 📊 Beauty Aggregator - Logs Viewer Script (Windows)
REM This script shows logs from all services

setlocal enabledelayedexpansion

if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║              📊 Beauty Aggregator Logs                      ║
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

REM Parse arguments (simplified for batch)
set SERVICE=all
set FOLLOW=
set LINES=100

if "%1"=="db" set SERVICE=db
if "%1"=="ingestion" set SERVICE=ingestion
if "%1"=="web" set SERVICE=web
if "%1"=="all" set SERVICE=all

if "%1"=="-f" set FOLLOW=-f
if "%2"=="-f" set FOLLOW=-f
if "%1"=="--follow" set FOLLOW=-f
if "%2"=="--follow" set FOLLOW=-f

REM Show logs
if "%SERVICE%"=="all" (
    echo [INFO] Showing logs for all services
    if defined FOLLOW (
        echo Press Ctrl+C to stop following logs
        echo.
        %COMPOSE_CMD% logs %FOLLOW% --tail=%LINES%
    ) else (
        %COMPOSE_CMD% logs --tail=%LINES%
    )
) else (
    echo [INFO] Showing logs for service: %SERVICE%
    if defined FOLLOW (
        echo Press Ctrl+C to stop following logs
        echo.
        %COMPOSE_CMD% logs %FOLLOW% --tail=%LINES% %SERVICE%
    ) else (
        %COMPOSE_CMD% logs --tail=%LINES% %SERVICE%
    )
)

goto end

:show_help
echo Beauty Aggregator - Logs Viewer Script
echo.
echo Usage: %0 [SERVICE] [OPTIONS]
echo.
echo Services:
echo   db          Database logs
echo   ingestion   Backend API logs
echo   web         Frontend logs
echo   all         All services (default)
echo.
echo Options:
echo   -f, --follow    Follow log output (live tail)
echo   -h, --help      Show this help message
echo.
echo Examples:
echo   %0                    Show last 100 lines from all services
echo   %0 -f                 Follow all logs in real-time
echo   %0 ingestion -f       Follow only backend API logs
echo.
pause

:end

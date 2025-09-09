@echo off
REM 🔄 Beauty Aggregator - Restart Application Script (Windows)
REM This script restarts the complete Beauty Aggregator application

if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║             🔄 Restarting Beauty Aggregator                 ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo [INFO] Restarting Beauty Aggregator Application...
echo.

REM Check if scripts exist
if not exist "stop-app.bat" (
    echo [ERROR] stop-app.bat not found
    pause
    exit /b 1
)

if not exist "start-app.bat" (
    echo [ERROR] start-app.bat not found
    pause
    exit /b 1
)

REM Stop the application
echo [INFO] Stopping current application...
call stop-app.bat

echo.
echo [INFO] Waiting a moment before restart...
timeout /t 3 /nobreak >nul

REM Start the application
echo [INFO] Starting application...
call start-app.bat %*

goto end

:show_help
echo Beauty Aggregator - Restart Application Script
echo.
echo Usage: %0 [OPTIONS]
echo.
echo Options:
echo   -f, --follow-logs    Follow logs after restart
echo   -h, --help           Show this help message
echo.
echo Examples:
echo   %0                   Restart application
echo   %0 -f                Restart and follow logs
echo.
pause

:end

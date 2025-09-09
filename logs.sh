#!/bin/bash

# 📊 Beauty Aggregator - Logs Viewer Script
# This script shows logs from all services

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              📊 Beauty Aggregator Logs                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${NC}"
}

show_help() {
    echo "Beauty Aggregator - Logs Viewer Script"
    echo
    echo "Usage: $0 [SERVICE] [OPTIONS]"
    echo
    echo "Services:"
    echo "  db          Database logs"
    echo "  ingestion   Backend API logs"
    echo "  web         Frontend logs"
    echo "  all         All services (default)"
    echo
    echo "Options:"
    echo "  -f, --follow    Follow log output (live tail)"
    echo "  -n, --lines N   Show last N lines (default: 100)"
    echo "  -h, --help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0                    Show last 100 lines from all services"
    echo "  $0 -f                 Follow all logs in real-time"
    echo "  $0 ingestion -f       Follow only backend API logs"
    echo "  $0 web -n 50          Show last 50 lines from frontend"
}

# Main execution
main() {
    # Use docker-compose or docker compose based on availability
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    SERVICE=""
    FOLLOW=""
    LINES="100"
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -f|--follow)
                FOLLOW="-f"
                shift
                ;;
            -n|--lines)
                LINES="$2"
                shift 2
                ;;
            db|ingestion|web|all)
                SERVICE="$1"
                shift
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Default to all services
    if [ -z "$SERVICE" ]; then
        SERVICE="all"
    fi
    
    print_header
    
    if [ "$SERVICE" = "all" ]; then
        echo -e "${BLUE}[INFO]${NC} Showing logs for all services"
        if [ -n "$FOLLOW" ]; then
            echo -e "${GREEN}Press Ctrl+C to stop following logs${NC}"
            echo
            $COMPOSE_CMD logs $FOLLOW --tail=$LINES
        else
            $COMPOSE_CMD logs --tail=$LINES
        fi
    else
        echo -e "${BLUE}[INFO]${NC} Showing logs for service: $SERVICE"
        if [ -n "$FOLLOW" ]; then
            echo -e "${GREEN}Press Ctrl+C to stop following logs${NC}"
            echo
            $COMPOSE_CMD logs $FOLLOW --tail=$LINES $SERVICE
        else
            $COMPOSE_CMD logs --tail=$LINES $SERVICE
        fi
    fi
}

# Run main function with all arguments
main "$@"

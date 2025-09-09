#!/bin/bash

# 🔄 Beauty Aggregator - Restart Application Script
# This script restarts the complete Beauty Aggregator application

set -e

# Colors for output
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${PURPLE}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║             🔄 Restarting Beauty Aggregator                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Main execution
main() {
    print_header
    
    print_status "Restarting Beauty Aggregator Application..."
    echo
    
    # Check if scripts exist
    if [ ! -f "./stop-app.sh" ]; then
        echo "Error: stop-app.sh not found"
        exit 1
    fi
    
    if [ ! -f "./start-app.sh" ]; then
        echo "Error: start-app.sh not found"
        exit 1
    fi
    
    # Make scripts executable
    chmod +x stop-app.sh
    chmod +x start-app.sh
    
    # Stop the application
    print_status "Stopping current application..."
    ./stop-app.sh
    
    echo
    print_status "Waiting a moment before restart..."
    sleep 3
    
    # Start the application
    print_status "Starting application..."
    ./start-app.sh "$@"
}

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Beauty Aggregator - Restart Application Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -f, --follow-logs    Follow logs after restart"
    echo "  -h, --help           Show this help message"
    echo
    echo "Examples:"
    echo "  $0                   Restart application"
    echo "  $0 -f                Restart and follow logs"
    exit 0
fi

# Run main function with all arguments
main "$@"

#!/bin/bash

# 🛑 Beauty Aggregator - Stop Application Script
# This script stops all services and cleans up containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_header() {
    echo -e "${RED}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              🛑 Stopping Beauty Aggregator                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${NC}"
}

# Function to stop services
stop_services() {
    print_status "Stopping all Beauty Aggregator services..."
    
    # Use docker-compose or docker compose based on availability
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    # Stop and remove containers
    if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
        print_status "Stopping services and removing containers, networks, and volumes..."
        $COMPOSE_CMD down --volumes --remove-orphans
        
        # Remove unused images
        print_status "Cleaning up unused Docker images..."
        docker image prune -f
        
        print_success "Complete cleanup performed"
    else
        print_status "Stopping services..."
        $COMPOSE_CMD down --remove-orphans
        print_success "Services stopped"
    fi
}

# Function to show status
show_status() {
    print_status "Checking remaining containers..."
    
    # Show any remaining containers
    CONTAINERS=$(docker ps -a --filter "name=skindb-ai" --format "table {{.Names}}\t{{.Status}}" | tail -n +2)
    
    if [ -z "$CONTAINERS" ]; then
        print_success "All Beauty Aggregator containers have been stopped"
    else
        print_warning "Some containers are still running:"
        echo "$CONTAINERS"
    fi
    
    echo
    print_success "Beauty Aggregator application stopped successfully"
    echo "To start again, run: ./start-app.sh"
}

# Main execution
main() {
    print_header
    
    stop_services "$1"
    show_status
}

# Show help if requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Beauty Aggregator - Stop Application Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -c, --clean    Stop services and clean up all containers, networks, and volumes"
    echo "  -h, --help     Show this help message"
    echo
    echo "Examples:"
    echo "  $0             Stop services (containers remain for quick restart)"
    echo "  $0 --clean     Stop services and perform complete cleanup"
    exit 0
fi

# Run main function with all arguments
main "$@"

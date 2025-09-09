#!/bin/bash

# 🔍 Beauty Aggregator - Database Connection Test Script
# This script tests the database connection independently

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${CYAN}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🔍 Database Connection Test                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${NC}"
}

# Function to test database connection
test_database() {
    # Use docker-compose or docker compose based on availability
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    print_status "Testing database connection..."
    
    # Check if database container is running
    print_status "1. Checking if database container is running..."
    if $COMPOSE_CMD ps db | grep -q "Up"; then
        print_success "Database container is running"
    else
        print_error "Database container is not running"
        print_error "Start the application first: ./start-app.sh"
        return 1
    fi
    
    # Test PostgreSQL readiness
    print_status "2. Testing PostgreSQL readiness..."
    if $COMPOSE_CMD exec -T db pg_isready -U app -d beauty_agg &>/dev/null; then
        print_success "PostgreSQL is ready for connections"
    else
        print_error "PostgreSQL is not ready"
        return 1
    fi
    
    # Test database connection
    print_status "3. Testing database connection..."
    if $COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT 1;" &>/dev/null; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed"
        return 1
    fi
    
    # Check database schema
    print_status "4. Checking database schema..."
    table_count=$($COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | grep -o '[0-9]*' | head -1)
    if [ "$table_count" -gt 0 ]; then
        print_success "Database schema exists ($table_count tables)"
    else
        print_warning "Database schema not found (tables: $table_count)"
    fi
    
    # Check products data
    print_status "5. Checking products data..."
    if $COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM products;" &>/dev/null; then
        product_count=$($COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM products;" 2>/dev/null | grep -o '[0-9]*' | head -1)
        if [ "$product_count" -gt 0 ]; then
            print_success "Products data exists ($product_count products)"
        else
            print_warning "No products found in database"
        fi
    else
        print_warning "Products table not found"
    fi
    
    # Show database info
    print_status "6. Database information:"
    echo -e "   ${GREEN}Host:${NC} localhost"
    echo -e "   ${GREEN}Port:${NC} 5432"
    echo -e "   ${GREEN}Database:${NC} beauty_agg"
    echo -e "   ${GREEN}Username:${NC} app"
    echo -e "   ${GREEN}Password:${NC} app"
    
    return 0
}

# Function to show database tables
show_tables() {
    print_status "Database tables:"
    
    # Use docker-compose or docker compose based on availability
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    $COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "\\dt" 2>/dev/null || {
        print_error "Could not list tables"
        return 1
    }
}

# Function to show products
show_products() {
    print_status "Products in database:"
    
    # Use docker-compose or docker compose based on availability
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    $COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT name, brand, category FROM products ORDER BY brand, name;" 2>/dev/null || {
        print_error "Could not list products"
        return 1
    }
}

# Main execution
main() {
    print_header
    
    case "${1:-test}" in
        "test")
            test_database
            if [ $? -eq 0 ]; then
                echo
                print_success "All database tests passed! ✅"
            else
                echo
                print_error "Database tests failed! ❌"
                exit 1
            fi
            ;;
        "tables")
            show_tables
            ;;
        "products")
            show_products
            ;;
        "help"|"-h"|"--help")
            echo "Database Connection Test Script"
            echo
            echo "Usage: $0 [COMMAND]"
            echo
            echo "Commands:"
            echo "  test       Run all database connection tests (default)"
            echo "  tables     Show database tables"
            echo "  products   Show products in database"
            echo "  help       Show this help message"
            echo
            echo "Examples:"
            echo "  $0              # Run all tests"
            echo "  $0 test         # Run all tests"
            echo "  $0 tables       # Show database tables"
            echo "  $0 products     # Show products"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

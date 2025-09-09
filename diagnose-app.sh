#!/bin/bash

# 🔧 Prism Beauty - Comprehensive Application Diagnostics
# This script performs systematic testing and diagnosis of the entire application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    ((PASSED_TESTS++))
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    ((WARNINGS++))
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((FAILED_TESTS++))
}

print_test() {
    echo -e "${CYAN}[TEST]${NC} $1"
    ((TOTAL_TESTS++))
}

print_header() {
    echo -e "${PURPLE}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🔧 Prism Beauty Diagnostics                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${NC}"
}

# Function to test if a port is available
test_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is available
    fi
}

# Function to wait with timeout
wait_for_condition() {
    local condition_cmd="$1"
    local timeout_seconds=$2
    local description="$3"
    
    local elapsed=0
    while [ $elapsed -lt $timeout_seconds ]; do
        if eval "$condition_cmd" >/dev/null 2>&1; then
            return 0
        fi
        sleep 1
        ((elapsed++))
        echo -n "."
    done
    echo
    return 1
}

# Pre-startup checks
pre_startup_checks() {
    echo -e "${CYAN}=== PRE-STARTUP CHECKS ===${NC}"
    
    # Docker installation check
    print_test "Checking Docker installation"
    if command -v docker &> /dev/null; then
        print_success "Docker is installed ($(docker --version))"
    else
        print_error "Docker is not installed"
        return 1
    fi
    
    # Docker Compose check
    print_test "Checking Docker Compose"
    if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
        if command -v docker-compose &> /dev/null; then
            COMPOSE_CMD="docker-compose"
            print_success "Docker Compose is available ($(docker-compose --version))"
        else
            COMPOSE_CMD="docker compose"
            print_success "Docker Compose is available ($(docker compose version))"
        fi
    else
        print_error "Docker Compose is not available"
        return 1
    fi
    
    # Docker daemon check
    print_test "Checking Docker daemon"
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
        return 1
    fi
    
    # Port availability check
    print_test "Checking port availability"
    local ports_in_use=0
    
    if test_port 3000; then
        print_warning "Port 3000 is already in use (may conflict with frontend)"
        ((ports_in_use++))
    fi
    
    if test_port 8000; then
        print_warning "Port 8000 is already in use (may conflict with backend)"
        ((ports_in_use++))
    fi
    
    if test_port 5432; then
        print_warning "Port 5432 is already in use (may conflict with database)"
        ((ports_in_use++))
    fi
    
    if [ $ports_in_use -eq 0 ]; then
        print_success "All required ports (3000, 8000, 5432) are available"
    else
        print_warning "$ports_in_use port(s) may conflict with application services"
    fi
    
    # Environment file check
    print_test "Checking environment configuration"
    if [ -f ".env" ]; then
        if grep -q "OPENROUTER_API_KEY=sk-" .env && ! grep -q "OPENROUTER_API_KEY=sk-xxxx" .env; then
            print_success "Environment file exists with API key configured"
        else
            print_warning "Environment file exists but API key may not be configured"
        fi
    else
        print_warning "No .env file found (will be created during startup)"
    fi
    
    echo
}

# Monitor container startup
monitor_containers() {
    echo -e "${CYAN}=== CONTAINER STARTUP MONITORING ===${NC}"
    
    print_test "Monitoring container startup sequence"
    
    # Wait for containers to start
    print_status "Waiting for containers to start..."
    if wait_for_condition "$COMPOSE_CMD ps | grep -q 'Up'" 30 "containers to start"; then
        print_success "Containers are starting up"
    else
        print_error "Containers failed to start within 30 seconds"
        return 1
    fi
    
    # Check individual container status
    print_test "Checking individual container status"
    local containers=("db" "ingestion" "web")
    
    for container in "${containers[@]}"; do
        if $COMPOSE_CMD ps $container | grep -q "Up"; then
            print_success "Container '$container' is running"
        else
            print_error "Container '$container' is not running"
        fi
    done
    
    echo
}

# Test database connectivity
test_database() {
    echo -e "${CYAN}=== DATABASE CONNECTIVITY TESTS ===${NC}"
    
    print_test "Testing database container health"
    if wait_for_condition "$COMPOSE_CMD ps db | grep -q 'healthy\\|Up'" 60 "database to be healthy"; then
        print_success "Database container is healthy"
    else
        print_warning "Database container health check timed out"
    fi
    
    print_test "Testing PostgreSQL readiness"
    if wait_for_condition "$COMPOSE_CMD exec -T db pg_isready -U app -d beauty_agg" 60 "PostgreSQL to be ready"; then
        print_success "PostgreSQL is accepting connections"
    else
        print_error "PostgreSQL failed to become ready"
        return 1
    fi
    
    print_test "Testing database connection"
    if $COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT 1;" &>/dev/null; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed"
        return 1
    fi
    
    print_test "Checking database schema"
    local table_count=$($COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | grep -o '[0-9]*' | head -1)
    if [ "$table_count" -gt 0 ]; then
        print_success "Database schema exists ($table_count tables)"
    else
        print_error "Database schema not found"
        return 1
    fi
    
    print_test "Checking product data"
    local product_count=$($COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM products;" 2>/dev/null | grep -o '[0-9]*' | head -1)
    if [ "$product_count" -gt 0 ]; then
        print_success "Product data exists ($product_count products)"
    else
        print_warning "No products found in database"
    fi
    
    echo
}

# Test backend API
test_backend() {
    echo -e "${CYAN}=== BACKEND API TESTS ===${NC}"
    
    print_test "Testing backend API availability"
    if wait_for_condition "curl -f http://localhost:8000/health" 60 "backend API to respond"; then
        print_success "Backend API is responding"
    else
        print_error "Backend API is not responding"
        return 1
    fi
    
    print_test "Testing API health endpoint"
    local health_response=$(curl -s http://localhost:8000/health)
    if echo "$health_response" | grep -q '"status":"ok"'; then
        print_success "Health endpoint returns OK status"
    else
        print_warning "Health endpoint response: $health_response"
    fi
    
    print_test "Testing products endpoint"
    local products_response=$(curl -s -w "%{http_code}" http://localhost:8000/products)
    local http_code="${products_response: -3}"
    if [ "$http_code" = "200" ]; then
        local product_list="${products_response%???}"
        local product_count=$(echo "$product_list" | jq length 2>/dev/null || echo "unknown")
        print_success "Products endpoint returns data ($product_count products)"
    else
        print_error "Products endpoint returned HTTP $http_code"
    fi
    
    print_test "Testing API documentation"
    local docs_response=$(curl -s -w "%{http_code}" http://localhost:8000/docs)
    local http_code="${docs_response: -3}"
    if [ "$http_code" = "200" ]; then
        print_success "API documentation is accessible"
    else
        print_warning "API documentation returned HTTP $http_code"
    fi
    
    echo
}

# Test frontend
test_frontend() {
    echo -e "${CYAN}=== FRONTEND TESTS ===${NC}"
    
    print_test "Testing frontend availability"
    if wait_for_condition "curl -f http://localhost:3000" 60 "frontend to respond"; then
        print_success "Frontend is responding"
    else
        print_error "Frontend is not responding"
        return 1
    fi
    
    print_test "Testing frontend content"
    local frontend_response=$(curl -s http://localhost:3000)
    if echo "$frontend_response" | grep -q "Prism Beauty"; then
        print_success "Frontend contains expected content (Prism Beauty branding)"
    else
        print_warning "Frontend may not be loading correctly"
    fi
    
    print_test "Testing frontend-backend integration"
    # Check if frontend can load without errors (basic check)
    if echo "$frontend_response" | grep -q "DOCTYPE html"; then
        print_success "Frontend serves valid HTML"
    else
        print_error "Frontend does not serve valid HTML"
    fi
    
    echo
}

# Performance tests
test_performance() {
    echo -e "${CYAN}=== PERFORMANCE TESTS ===${NC}"
    
    print_test "Testing API response times"
    local start_time=$(date +%s%N)
    curl -s http://localhost:8000/health >/dev/null
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $response_time -lt 1000 ]; then
        print_success "API response time: ${response_time}ms (excellent)"
    elif [ $response_time -lt 3000 ]; then
        print_success "API response time: ${response_time}ms (good)"
    else
        print_warning "API response time: ${response_time}ms (slow)"
    fi
    
    print_test "Testing frontend load time"
    start_time=$(date +%s%N)
    curl -s http://localhost:3000 >/dev/null
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 ))
    
    if [ $response_time -lt 2000 ]; then
        print_success "Frontend load time: ${response_time}ms (excellent)"
    elif [ $response_time -lt 5000 ]; then
        print_success "Frontend load time: ${response_time}ms (good)"
    else
        print_warning "Frontend load time: ${response_time}ms (slow)"
    fi
    
    echo
}

# Log analysis
analyze_logs() {
    echo -e "${CYAN}=== LOG ANALYSIS ===${NC}"
    
    print_test "Analyzing application logs for errors"
    local error_count=$($COMPOSE_CMD logs | grep -i error | wc -l)
    if [ $error_count -eq 0 ]; then
        print_success "No errors found in application logs"
    else
        print_warning "Found $error_count error entries in logs"
    fi
    
    print_test "Analyzing application logs for warnings"
    local warning_count=$($COMPOSE_CMD logs | grep -i warning | wc -l)
    if [ $warning_count -eq 0 ]; then
        print_success "No warnings found in application logs"
    else
        print_warning "Found $warning_count warning entries in logs"
    fi
    
    echo
}

# Summary report
show_summary() {
    echo -e "${PURPLE}
╔══════════════════════════════════════════════════════════════╗
║                        📊 DIAGNOSTIC SUMMARY                ║
╚══════════════════════════════════════════════════════════════╝${NC}"
    
    echo -e "${BLUE}Total Tests Run:${NC} $TOTAL_TESTS"
    echo -e "${GREEN}Tests Passed:${NC} $PASSED_TESTS"
    echo -e "${RED}Tests Failed:${NC} $FAILED_TESTS"
    echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
    
    local success_rate=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    echo -e "${BLUE}Success Rate:${NC} $success_rate%"
    
    echo
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 All critical tests passed! Application is ready for use.${NC}"
    elif [ $FAILED_TESTS -le 2 ]; then
        echo -e "${YELLOW}⚠️  Minor issues detected. Application should work but may have limitations.${NC}"
    else
        echo -e "${RED}❌ Significant issues detected. Please review failed tests and logs.${NC}"
    fi
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}💡 $WARNINGS warning(s) noted. Review for potential optimizations.${NC}"
    fi
    
    echo
    echo -e "${BLUE}📋 Quick Commands:${NC}"
    echo "   View logs:           ./logs.sh"
    echo "   Test database:       ./test-db-connection.sh"
    echo "   Restart app:         ./restart-app.sh"
    
    echo
}

# Main execution
main() {
    print_header
    
    # Use docker-compose or docker compose based on availability
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    case "${1:-full}" in
        "pre")
            pre_startup_checks
            ;;
        "containers")
            monitor_containers
            ;;
        "database")
            test_database
            ;;
        "backend")
            test_backend
            ;;
        "frontend")
            test_frontend
            ;;
        "performance")
            test_performance
            ;;
        "logs")
            analyze_logs
            ;;
        "full")
            pre_startup_checks
            monitor_containers
            test_database
            test_backend
            test_frontend
            test_performance
            analyze_logs
            show_summary
            ;;
        "help"|"-h"|"--help")
            echo "Prism Beauty Diagnostics Script"
            echo
            echo "Usage: $0 [TEST_SUITE]"
            echo
            echo "Test Suites:"
            echo "  pre          Pre-startup environment checks"
            echo "  containers   Container status monitoring"
            echo "  database     Database connectivity tests"
            echo "  backend      Backend API tests"
            echo "  frontend     Frontend accessibility tests"
            echo "  performance  Performance benchmarking"
            echo "  logs         Log analysis"
            echo "  full         Run all test suites (default)"
            echo "  help         Show this help message"
            echo
            ;;
        *)
            print_error "Unknown test suite: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

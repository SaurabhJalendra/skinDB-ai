#!/bin/bash

# 🎨 Prism - Full Application Startup Script
# This script starts the complete Prism application with all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
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
    echo -e "${PURPLE}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║            🎨 Prism Application                  ║
║                 Premium AI-Powered Beauty Intelligence       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝${NC}"
}

# Function to check if Docker is running
check_docker() {
    print_status "Checking Docker installation and status..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    print_success "Docker is installed and running"
}

# Function to check environment file
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        
        if [ -f "env.example" ]; then
            cp env.example .env
            print_warning "Please edit .env file and add your OPENROUTER_API_KEY"
            print_warning "You can get an API key from: https://openrouter.ai/"
            echo
            echo "Opening .env file for editing..."
            
            # Try to open with various editors
            if command -v code &> /dev/null; then
                code .env
            elif command -v nano &> /dev/null; then
                nano .env
            elif command -v vim &> /dev/null; then
                vim .env
            else
                print_warning "Please manually edit the .env file and add your OPENROUTER_API_KEY"
            fi
            
            echo
            read -p "Press Enter after you've added your API key to continue..."
        else
            print_error "env.example file not found. Please create a .env file manually."
            exit 1
        fi
    fi

    # Check if API key is set
    if grep -q "OPENROUTER_API_KEY=sk-xxxx" .env || grep -q "OPENROUTER_API_KEY=$" .env; then
        print_error "Please set a valid OPENROUTER_API_KEY in your .env file"
        exit 1
    fi

    print_success "Environment configuration looks good"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p data
    
    print_success "Directories created"
}

# Function to stop existing containers
stop_existing() {
    print_status "Stopping any existing containers..."
    
    # Try to stop containers gracefully
    if docker-compose ps -q 2>/dev/null | grep -q .; then
        docker-compose down --remove-orphans
    elif docker compose ps -q 2>/dev/null | grep -q .; then
        docker compose down --remove-orphans
    fi
    
    print_success "Existing containers stopped"
}

# Function to build and start services
start_services() {
    print_status "Building and starting all services..."
    print_status "This may take a few minutes on first run..."
    
    # Use docker-compose or docker compose based on availability
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    # Build and start services
    $COMPOSE_CMD up --build -d
    
    print_success "Services started in background"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Use docker-compose or docker compose based on availability
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    # Wait for database container to be running
    print_status "Waiting for database container..."
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if $COMPOSE_CMD ps db | grep -q "Up"; then
            print_success "Database container is running"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Database container failed to start"
        exit 1
    fi
    
    # Wait for PostgreSQL to be ready for connections
    print_status "Waiting for PostgreSQL to accept connections..."
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if $COMPOSE_CMD exec -T db pg_isready -U app -d beauty_agg &>/dev/null; then
            print_success "PostgreSQL is accepting connections"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "PostgreSQL failed to accept connections within expected time"
        print_error "Check database logs: ./logs.sh db"
        exit 1
    fi
    
    # Test actual database connection
    print_status "Testing database connection..."
    if $COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT 1;" &>/dev/null; then
        print_success "Database connection test successful"
    else
        print_error "Database connection test failed"
        print_error "Check database logs: ./logs.sh db"
        exit 1
    fi
    
    # Wait for backend API
    print_status "Waiting for backend API..."
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:8000/health &>/dev/null; then
            print_success "Backend API is ready"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 3
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Backend API failed to start within expected time"
        exit 1
    fi
    
    # Wait for frontend
    print_status "Waiting for frontend..."
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:3000 &>/dev/null; then
            print_success "Frontend is ready"
            break
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 3
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Frontend failed to start within expected time"
        exit 1
    fi
}

# Function to initialize database
initialize_database() {
    print_status "Initializing database with schema and seed data..."
    
    # Use docker-compose or docker compose based on availability
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    # Check if database schema already exists
    print_status "Checking if database is already initialized..."
    if $COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | grep -q "0"; then
        print_status "Database is empty, proceeding with initialization..."
    else
        existing_tables=$($COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | grep -o '[0-9]*' | head -1)
        if [ "$existing_tables" -gt 0 ]; then
            print_warning "Database already contains $existing_tables tables"
            print_status "Checking if products table exists and has data..."
            
            if $COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM products;" 2>/dev/null | grep -q "0"; then
                print_status "Products table is empty, seeding data..."
            else
                product_count=$($COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM products;" 2>/dev/null | grep -o '[0-9]*' | head -1)
                print_success "Database already initialized with $product_count products"
                return 0
            fi
        fi
    fi
    
    # Apply database schema
    print_status "Applying database schema..."
    if $COMPOSE_CMD exec -T db psql -U app -d beauty_agg < db/schema.sql; then
        print_success "Database schema applied successfully"
    else
        print_warning "Schema application had warnings (this is normal if tables already exist)"
    fi
    
    # Verify schema was applied
    print_status "Verifying database schema..."
    table_count=$($COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | grep -o '[0-9]*' | head -1)
    if [ "$table_count" -gt 0 ]; then
        print_success "Database schema verified ($table_count tables created)"
    else
        print_error "Database schema verification failed"
        exit 1
    fi
    
    # Seed initial products
    print_status "Seeding initial products..."
    cd scripts
    if [ -f "package.json" ]; then
        if [ -f "node_modules/.package-lock.json" ] || [ -f "package-lock.json" ]; then
            print_status "Installing Node.js dependencies..."
            npm install --silent
        fi
        
        print_status "Running product seeding script..."
        if DATABASE_URL="postgresql://app:app@localhost:5432/beauty_agg" npm run seed; then
            print_success "Product seeding completed successfully"
        else
            print_error "Product seeding failed"
            cd ..
            exit 1
        fi
    else
        print_warning "Scripts package.json not found, skipping seed..."
    fi
    cd ..
    
    # Verify products were seeded
    print_status "Verifying product data..."
    product_count=$($COMPOSE_CMD exec -T db psql -U app -d beauty_agg -c "SELECT COUNT(*) FROM products;" 2>/dev/null | grep -o '[0-9]*' | head -1)
    if [ "$product_count" -gt 0 ]; then
        print_success "Database initialization completed with $product_count products"
    else
        print_error "Product verification failed - no products found in database"
        exit 1
    fi
}

# Function to show application status
show_status() {
    echo
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                   🎉 APPLICATION READY! 🎉                   ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${GREEN}🌐 Frontend (Next.js):${NC}     http://localhost:3000"
    echo -e "${GREEN}🔧 Backend API:${NC}           http://localhost:8000"
    echo -e "${GREEN}📚 API Documentation:${NC}    http://localhost:8000/docs"
    echo -e "${GREEN}🗄️  Database:${NC}             localhost:5432 (beauty_agg)"
    echo
    echo -e "${YELLOW}📊 Default Login Credentials:${NC}"
    echo -e "   Database: app / app"
    echo
    echo -e "${BLUE}📋 Quick Commands:${NC}"
    echo "   View logs:           ./logs.sh"
    echo "   Stop application:    ./stop-app.sh"
    echo "   Restart application: ./restart-app.sh"
    echo
    echo -e "${PURPLE}🎨 Featured Products:${NC}"
    echo "   • Chanel N°5 Eau de Parfum"
    echo "   • NARS Blush \"Orgasm\""
    echo "   • MAC Retro Matte \"Ruby Woo\""
    echo "   • Estée Lauder Advanced Night Repair"
    echo "   • And 6 more luxury beauty products!"
    echo
    echo -e "${GREEN}Ready to aggregate some beauty data! ✨${NC}"
}

# Function to handle cleanup on script exit
cleanup() {
    if [ $? -ne 0 ]; then
        print_error "Startup failed. Cleaning up..."
        docker-compose down --remove-orphans 2>/dev/null || docker compose down --remove-orphans 2>/dev/null || true
    fi
}

# Main execution
main() {
    trap cleanup EXIT
    
    print_header
    
    print_status "Starting Prism Application..."
    echo
    
    check_docker
    check_environment
    create_directories
    stop_existing
    start_services
    wait_for_services
    initialize_database
    
    show_status
    
    # Keep the script running to show logs if requested
    if [ "$1" = "--follow-logs" ] || [ "$1" = "-f" ]; then
        echo
        print_status "Following application logs (Ctrl+C to stop)..."
        if command -v docker-compose &> /dev/null; then
            docker-compose logs -f
        else
            docker compose logs -f
        fi
    fi
}

# Run main function with all arguments
main "$@"

# 🚀 Prism - Startup Guide

## Quick Start

### For Windows Users:
```batch
# Start the application
start-app.bat

# View logs
logs.bat

# Stop the application
stop-app.bat

# Restart the application
restart-app.bat
```

### For macOS/Linux Users:
```bash
# Make scripts executable (one-time setup)
chmod +x *.sh

# Start the application
./start-app.sh

# View logs
./logs.sh

# Stop the application
./stop-app.sh

# Restart the application
./restart-app.sh
```

## Prerequisites

1. **Docker Desktop** - Install from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **OpenRouter API Key** - Get from [openrouter.ai](https://openrouter.ai/)

## First-Time Setup

1. **Clone/Download** the project
2. **Install Docker Desktop** and ensure it's running
3. **Get OpenRouter API Key**:
   - Visit https://openrouter.ai/
   - Sign up for an account
   - Generate an API key
4. **Run the startup script** (it will guide you through environment setup)

## Application Architecture

The application consists of three main services:

- **Frontend** (Next.js): http://localhost:3000
- **Backend API** (FastAPI): http://localhost:8000  
- **Database** (PostgreSQL): localhost:5432

## Available Scripts

### `start-app` - Start the full application
- Checks Docker installation and availability
- Sets up environment configuration
- Builds and starts all services
- **Enhanced Database Connection Testing:**
  - Waits for database container to start
  - Tests PostgreSQL connection readiness
  - Verifies actual database connectivity
  - Checks if schema already exists
  - Validates product data seeding
- Initializes database with schema and seed data
- Shows application status when ready

**Options:**
- `-f, --follow-logs` - Follow application logs after startup

### `stop-app` - Stop the application
- Gracefully stops all services
- Removes containers and networks

**Options:**
- `-c, --clean` - Perform complete cleanup (removes volumes and images)

### `logs` - View application logs
- Shows logs from all services or specific service

**Options:**
- `-f, --follow` - Follow logs in real-time
- `-n, --lines N` - Show last N lines (default: 100)

**Services:**
- `db` - Database logs
- `ingestion` - Backend API logs  
- `web` - Frontend logs
- `all` - All services (default)

### `restart-app` - Restart the application
- Stops and starts the application
- Preserves data and configuration

**Options:**
- `-f, --follow-logs` - Follow logs after restart

## Featured Products

The application comes pre-loaded with 10 iconic beauty products:

1. **Chanel N°5 Eau de Parfum** - The world's most famous fragrance
2. **NARS Blush "Orgasm"** - Cult-favorite peachy-pink blush
3. **MAC Retro Matte "Ruby Woo"** - Classic blue-red matte lipstick
4. **Estée Lauder Advanced Night Repair** - Revolutionary anti-aging serum
5. **SK-II Facial Treatment Essence** - Luxury essence with Pitera™
6. **La Mer Crème de la Mer** - Ultra-luxurious moisturizer
7. **Bioderma Sensibio H2O** - Gentle micellar water
8. **Maybelline Great Lash Mascara** - Iconic drugstore mascara
9. **Beautyblender Original Sponge** - Revolutionary makeup sponge
10. **Shu Uemura Eyelash Curler** - Professional-grade eyelash curler

## Troubleshooting

### Common Issues

**Docker not running:**
- Start Docker Desktop
- Wait for it to fully initialize

**Port conflicts:**
- Check if ports 3000, 8000, or 5432 are in use
- Stop other applications using these ports

**Environment file issues:**
- Ensure `.env` file exists with valid `OPENROUTER_API_KEY`
- Copy from `env.example` if needed

**Database connection issues:**
- Wait for database to fully initialize (can take 30-60 seconds)
- Check logs with `logs.sh db` or `logs.bat db`

**API key issues:**
- Verify your OpenRouter API key is valid
- Check account balance and limits

### Getting Help

1. **Check logs**: Use `logs.sh` or `logs.bat` to view application logs
2. **Restart services**: Use `restart-app.sh` or `restart-app.bat`
3. **Clean restart**: Use `stop-app.sh --clean` then `start-app.sh`

### Manual Commands

If you prefer to use Docker Compose directly:

```bash
# Start services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean stop (removes volumes)
docker-compose down --volumes
```

### Database Connection Testing

Use the dedicated database test scripts to verify connectivity:

**Windows:**
```batch
# Test database connection
test-db-connection.bat

# Show database tables
test-db-connection.bat tables

# Show products in database
test-db-connection.bat products
```

**Linux/macOS:**
```bash
# Make executable (one-time)
chmod +x test-db-connection.sh

# Test database connection
./test-db-connection.sh

# Show database tables
./test-db-connection.sh tables

# Show products in database
./test-db-connection.sh products
```

The database test script verifies:
- ✅ Database container is running
- ✅ PostgreSQL is accepting connections
- ✅ Database connection works
- ✅ Schema tables exist
- ✅ Product data is seeded

## Development

### Environment Variables

Key environment variables in `.env`:

```env
OPENROUTER_API_KEY=your-api-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
LOG_LEVEL=INFO
LLM_TIMEOUT_SECS=120
MAX_JSON_BYTES=300000
```

### Database Access

Connect to PostgreSQL database:
- **Host**: localhost
- **Port**: 5432
- **Database**: beauty_agg
- **Username**: app
- **Password**: app

### API Documentation

When the application is running:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

## Production Deployment

For production deployment:

1. Update environment variables for production
2. Use proper secrets management
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure monitoring and logging
6. Set up backup strategies

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the beauty community** - Combining AI intelligence with premium user experience to revolutionize beauty product discovery and comparison.

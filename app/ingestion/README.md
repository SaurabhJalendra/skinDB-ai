# Prism Ingestion Service

FastAPI-based ingestion service that uses LlamaIndex and OpenRouter to aggregate beauty product data from multiple sources.

## 🔧 Setup

### Prerequisites
- Python 3.11+
- PostgreSQL database
- OpenRouter API key

### Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables
```bash
# Required
OPENROUTER_API_KEY=sk-your-api-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/beauty_agg

# Optional (with defaults)
LOG_LEVEL=INFO
LOG_DIR=./logs
LLM_TIMEOUT_SECS=120
MAX_JSON_BYTES=300000
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_REFERER=http://localhost:3000
OPENROUTER_TITLE=Prism
```

## 🚀 Running

### Development
```bash
uvicorn main:app --reload --port 8000
```

### Production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📊 Logging

The service uses structured JSON logging with the following features:

- **Console logs**: Human-readable format for development
- **File logs**: JSON format in `logs/app.log` (rotated daily, 7-day retention)
- **Request timing**: All HTTP requests logged with duration
- **Invalid outputs**: Saved to `logs/invalid_{product_id}_{timestamp}.json`

### Log Format
```json
{
  "ts": "2024-01-01T12:00:00Z",
  "level": "INFO",
  "msg": "POST /ingest/1 - 200",
  "path": "/ingest/1",
  "method": "POST",
  "status": 200,
  "dur_ms": 1234.56,
  "product_id": "1",
  "logger": "request"
}
```

## 🛠️ API Endpoints

### Health & Status
- `GET /health` - Health check
- `GET /env/min` - Environment info (no secrets)

### Products
- `GET /products` - List all products
- `GET /product/{id}` - Get consolidated product data

### Ingestion
- `POST /ingest/{id}` - Ingest single product
- `POST /ingest-all` - Batch ingest all products
- `POST /test-llama` - Test LlamaIndex integration

### Documentation
- `GET /docs` - Swagger UI
- `GET /redoc` - ReDoc documentation

## 🔍 JSON Repair

The service includes automatic JSON repair for malformed LLM outputs:

1. **Truncation**: Limits to `MAX_JSON_BYTES`
2. **Extraction**: Finds JSON between first `{` and last `}`
3. **Cleaning**: Removes control characters
4. **Comma fixes**: Removes trailing commas
5. **Fallback**: Saves invalid outputs for debugging

## 🏗️ Architecture

### Data Flow
1. **Product Resolution**: Look up product by ID
2. **Prompt Building**: Create LLM prompt with JSON schema
3. **LLM Call**: Fetch data via OpenRouter/LlamaIndex
4. **JSON Parsing**: Parse and repair if needed
5. **Validation**: Validate with Pydantic models
6. **Storage**: Upsert to PostgreSQL
7. **Response**: Return consolidated data

### Error Handling
- **Timeouts**: Configurable LLM timeout with graceful handling
- **Invalid JSON**: Automatic repair attempts + debug logging
- **Validation errors**: Detailed Pydantic error messages
- **Database errors**: Transaction rollback + error logging

## 🧪 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8000/health

# Test LlamaIndex integration
curl -X POST http://localhost:8000/test-llama

# Ingest single product
curl -X POST http://localhost:8000/ingest/1

# Check logs
tail -f logs/app.log
```

### CLI Testing
```bash
# Use the CLI helper
python ../scripts/ingest_all.py
```

## 📝 Configuration

### Timeouts
- **LLM_TIMEOUT_SECS**: Timeout for LlamaIndex calls (default: 120)
- **MAX_JSON_BYTES**: Maximum JSON size to process (default: 300000)

### CORS
- Configured for `http://localhost:3000` (Next.js frontend)
- Allows GET and POST methods only
- No credentials for security

### Database
- Uses connection pooling via psycopg2
- Implements idempotent upserts
- Transaction management for data consistency

## 🔐 Security

- **No secrets in logs**: Environment variables filtered
- **CORS restrictions**: Limited to localhost development
- **Input validation**: Strict Pydantic validation
- **SQL injection protection**: Parameterized queries
- **Timeout protection**: Prevents hanging requests


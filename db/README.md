# Database Schema

This directory contains:
- SQL schema files for PostgreSQL
- Database migration scripts
- Initial seed data

## Phase 1 Implementation

### Schema Files
- `schema.sql` - Complete database schema with all tables and indexes

### Tables Created
- **products** - Core product information (id, slug, name, brand, category, etc.)
- **offers** - Retailer pricing and availability data
- **ratings** - Retailer ratings and review counts
- **reviews** - Individual review data from various sources
- **specs** - Product specifications and technical details
- **summaries** - AI-generated product summaries with pros/cons

### Features
- UUID primary keys for scalability
- Proper foreign key relationships
- JSONB fields for flexible data storage
- Automatic timestamp management
- Performance indexes on key fields

## Usage

```bash
# Create database
createdb beauty_agg

# Apply schema
psql beauty_agg -f db/schema.sql

# Or use the automated setup scripts in /scripts directory
```

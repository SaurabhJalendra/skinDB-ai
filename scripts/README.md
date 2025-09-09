# Scripts

This directory contains:
- Database seeding scripts
- Helper utilities
- Database setup automation

## Phase 1 Implementation

### Database Setup
- `setup_db.sh` - Unix/Linux/macOS database setup script
- `setup_db.bat` - Windows database setup script

### Product Seeding
- `seed_products.json` - 10 iconic beauty products data
- `seed_products.ts` - TypeScript seeding script
- `package.json` - Dependencies for seeding script

## Quick Start

### Unix/Linux/macOS
```bash
./setup_db.sh
cd scripts
npm install
npm run seed
```

### Windows
```cmd
setup_db.bat
cd scripts
npm install
npm run seed
```

### Manual Setup
```bash
createdb beauty_agg
psql beauty_agg -f ../db/schema.sql
cd scripts
npm install
npm run seed
```

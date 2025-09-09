#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Phase 1: Database Schema & Seed\n');

// Check required files exist
const requiredFiles = [
  '../db/schema.sql',
  'seed_products.json',
  'seed_products.ts',
  'package.json',
  'tsconfig.json'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check schema.sql content
console.log('\n🏗️  Checking schema.sql...');
const schemaPath = path.join(__dirname, '../db/schema.sql');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const hasProductsTable = schemaContent.includes('CREATE TABLE products');
  const hasOffersTable = schemaContent.includes('CREATE TABLE offers');
  const hasRatingsTable = schemaContent.includes('CREATE TABLE ratings');
  const hasReviewsTable = schemaContent.includes('CREATE TABLE reviews');
  const hasSpecsTable = schemaContent.includes('CREATE TABLE specs');
  const hasSummariesTable = schemaContent.includes('CREATE TABLE summaries');
  
  console.log(`✅ Products table: ${hasProductsTable ? 'YES' : 'NO'}`);
  console.log(`✅ Offers table: ${hasOffersTable ? 'YES' : 'NO'}`);
  console.log(`✅ Ratings table: ${hasRatingsTable ? 'YES' : 'NO'}`);
  console.log(`✅ Reviews table: ${hasReviewsTable ? 'YES' : 'NO'}`);
  console.log(`✅ Specs table: ${hasSpecsTable ? 'YES' : 'NO'}`);
  console.log(`✅ Summaries table: ${hasSummariesTable ? 'YES' : 'NO'}`);
}

// Check seed data
console.log('\n🌱 Checking seed data...');
const seedPath = path.join(__dirname, 'seed_products.json');
if (fs.existsSync(seedPath)) {
  try {
    const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
    console.log(`✅ Seed file contains ${seedData.length} products`);
    
    if (seedData.length === 10) {
      console.log('✅ All 10 iconic beauty products present');
    } else {
      console.log(`❌ Expected 10 products, found ${seedData.length}`);
    }
    
    // Check for required fields
    const requiredFields = ['slug', 'name', 'brand', 'category', 'hero_image_url', 'description'];
    const firstProduct = seedData[0];
    if (firstProduct) {
      const missingFields = requiredFields.filter(field => !(field in firstProduct));
      if (missingFields.length === 0) {
        console.log('✅ All required fields present in products');
      } else {
        console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error parsing seed data: ${error.message}`);
  }
}

// Check package.json
console.log('\n📦 Checking package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  try {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log(`✅ Package name: ${packageData.name}`);
    console.log(`✅ Has pg dependency: ${packageData.dependencies && packageData.dependencies.pg ? 'YES' : 'NO'}`);
    console.log(`✅ Has seed script: ${packageData.scripts && packageData.scripts.seed ? 'YES' : 'NO'}`);
  } catch (error) {
    console.log(`❌ Error parsing package.json: ${error.message}`);
  }
}

console.log('\n🎯 Phase 1 Verification Complete!');
console.log('\nNext steps:');
console.log('1. Ensure PostgreSQL is running');
console.log('2. Run: createdb beauty_agg');
console.log('3. Run: psql beauty_agg -f db/schema.sql');
console.log('4. Run: cd scripts && npm install && npm run seed');
console.log('\nOr use the automated setup scripts:');
console.log('- Unix/Linux/macOS: ./setup_db.sh');
console.log('- Windows: setup_db.bat');

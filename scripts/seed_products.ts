#!/usr/bin/env ts-node

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

interface Product {
  slug: string;
  name: string;
  brand: string;
  category: string;
  hero_image_url: string;
  description: string;
}

async function seedProducts() {
  // Read the seed data
  const seedDataPath = path.join(process.cwd(), 'seed_products.json');
  const seedData: Product[] = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));
  
  // Get database connection from environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    // Connect to database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Insert products
    const insertQuery = `
      INSERT INTO products (slug, name, brand, category, hero_image_url, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, slug, name, brand
    `;

    console.log('\nInserting products...\n');

    for (const product of seedData) {
      const result = await client.query(insertQuery, [
        product.slug,
        product.name,
        product.brand,
        product.category,
        product.hero_image_url,
        product.description
      ]);

      const insertedProduct = result.rows[0];
      console.log(`✅ Inserted: ${insertedProduct.brand} - ${insertedProduct.name} (ID: ${insertedProduct.id})`);
    }

    console.log(`\n🎉 Successfully inserted ${seedData.length} products!`);

    // Verify the insertions
    const countQuery = 'SELECT COUNT(*) as total FROM products';
    const countResult = await client.query(countQuery);
    console.log(`\n📊 Total products in database: ${countResult.rows[0].total}`);

    // Show all products
    const allProductsQuery = 'SELECT slug, name, brand, category FROM products ORDER BY brand, name';
    const allProductsResult = await client.query(allProductsQuery);
    
    console.log('\n📋 All products in database:');
    allProductsResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.brand} - ${row.name} (${row.slug})`);
    });

  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seeding function
seedProducts().catch(console.error);

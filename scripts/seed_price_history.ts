#!/usr/bin/env ts-node

/**
 * Demo script to generate synthetic price history data.
 * Only runs when SEED_HISTORY_DEMO=true environment variable is set.
 * 
 * This script generates ~30 days of price history for each product
 * based on current offers with slight variations (±0-8%).
 */

import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if demo mode is enabled
if (process.env.SEED_HISTORY_DEMO !== 'true') {
  console.log('❌ Demo mode not enabled. Set SEED_HISTORY_DEMO=true to run this script.');
  process.exit(0);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

interface Offer {
  product_id: string;
  retailer: string;
  price_amount: number;
  price_currency: string;
  url: string;
}

interface PriceHistoryEntry {
  product_id: string;
  retailer: string;
  price_amount: number;
  price_currency: string;
  url: string;
  day: string;
}

async function generatePriceHistory() {
  try {
    await client.connect();
    console.log('🔗 Connected to database');

    // Get all current offers
    const offersResult = await client.query(`
      SELECT product_id, retailer, price_amount, price_currency, url
      FROM offers 
      WHERE price_amount IS NOT NULL
    `);

    const offers: Offer[] = offersResult.rows;
    console.log(`📊 Found ${offers.length} offers with prices`);

    if (offers.length === 0) {
      console.log('⚠️  No offers found. Run ingestion first to generate price data.');
      return;
    }

    // Generate price history for each offer
    const historyEntries: PriceHistoryEntry[] = [];
    const days = 30; // Generate 30 days of history

    for (const offer of offers) {
      const basePrice = offer.price_amount;
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const day = date.toISOString().split('T')[0];

        // Generate price variation (±0-8%)
        const variation = (Math.random() - 0.5) * 0.16; // -8% to +8%
        const variationFactor = 1 + variation;
        const newPrice = Math.round(basePrice * variationFactor * 100) / 100;

        historyEntries.push({
          product_id: offer.product_id,
          retailer: offer.retailer,
          price_amount: newPrice,
          price_currency: offer.price_currency,
          url: offer.url,
          day: day,
        });
      }
    }

    console.log(`📈 Generated ${historyEntries.length} price history entries`);

    // Insert price history (with conflict handling)
    const insertQuery = `
      INSERT INTO price_history (product_id, retailer, price_amount, price_currency, url, day)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (product_id, retailer, day) DO NOTHING
    `;

    let insertedCount = 0;
    for (const entry of historyEntries) {
      const result = await client.query(insertQuery, [
        entry.product_id,
        entry.retailer,
        entry.price_amount,
        entry.price_currency,
        entry.url,
        entry.day,
      ]);
      
      if (result.rowCount && result.rowCount > 0) {
        insertedCount++;
      }
    }

    console.log(`✅ Inserted ${insertedCount} new price history entries`);
    console.log(`📊 Skipped ${historyEntries.length - insertedCount} duplicate entries`);

    // Show summary by product
    const summaryResult = await client.query(`
      SELECT 
        p.name,
        p.brand,
        COUNT(DISTINCT ph.retailer) as retailer_count,
        COUNT(ph.id) as history_points,
        MIN(ph.day) as earliest_date,
        MAX(ph.day) as latest_date
      FROM price_history ph
      JOIN products p ON p.id = ph.product_id
      GROUP BY p.id, p.name, p.brand
      ORDER BY p.name
    `);

    console.log('\n📋 Price History Summary:');
    console.log('=' .repeat(80));
    for (const row of summaryResult.rows) {
      console.log(`${row.brand} ${row.name}`);
      console.log(`  📊 ${row.retailer_count} retailers, ${row.history_points} data points`);
      console.log(`  📅 ${row.earliest_date} to ${row.latest_date}`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error generating price history:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  generatePriceHistory()
    .then(() => {
      console.log('🎉 Price history generation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { generatePriceHistory };


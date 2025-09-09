"""
Database connection and operations for beauty product data aggregation.
Phase 3: Full implementation with idempotent upserts and helper functions.
"""

import os
import psycopg2
import json
import hashlib
import re
from datetime import datetime
from psycopg2.extras import RealDictCursor, execute_values
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv
from models import RootSnapshot, PlatformData, EditorialBlock

# Load environment variables
load_dotenv()

def convert_datetime_to_string(obj):
    """Recursively convert datetime objects to ISO format strings."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {key: convert_datetime_to_string(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_datetime_to_string(item) for item in obj]
    else:
        return obj

def get_db_connection():
    """
    Get a database connection using psycopg2.
    
    Returns:
        psycopg2 connection object
        
    Raises:
        Exception: If database connection fails
    """
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable is required")
    
    try:
        # Try to connect with the URL first
        connection = psycopg2.connect(
            database_url,
            cursor_factory=RealDictCursor
        )
        return connection
    except psycopg2.Error as e:
        # If URL connection fails, try with individual parameters
        try:
            connection = psycopg2.connect(
                host="localhost",
                port="5432",
                database="beauty_agg",
                user="postgres",
                password="",  # Empty password
                cursor_factory=RealDictCursor
            )
            return connection
        except psycopg2.Error as e2:
            raise Exception(f"Database connection failed: {str(e)} (URL) and {str(e2)} (individual params)")

def test_db_connection() -> bool:
    """
    Test database connection.
    
    Returns:
        True if connection successful, False otherwise
    """
    try:
        conn = get_db_connection()
        conn.close()
        return True
    except Exception:
        return False

# Helper functions
def ensure_currency_usd(currency: Optional[str]) -> Optional[str]:
    """Normalize currency to 'USD' if ambiguous."""
    if not currency:
        return None
    
    currency_upper = currency.upper()
    usd_variants = {'USD', 'US$', '$', 'DOLLAR', 'DOLLARS'}
    
    if currency_upper in usd_variants:
        return 'USD'
    
    # If it's clearly not USD, return as-is
    if currency_upper in {'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY'}:
        return currency_upper
    
    # For ambiguous cases, default to USD
    return 'USD'

def clamp_float(x: Optional[float], lo: float, hi: float) -> Optional[float]:
    """Clamp float value between lo and hi bounds."""
    if x is None:
        return None
    return max(lo, min(hi, x))

def clean_text(s: Optional[str]) -> Optional[str]:
    """Strip control characters from text."""
    if not s:
        return s
    
    # Remove control characters except newlines and tabs
    cleaned = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', s)
    return cleaned.strip()

def word_count(s: Optional[str]) -> int:
    """Count words in a string."""
    if not s:
        return 0
    return len(s.split())

def store_snapshot(product_id: str, snap: RootSnapshot, model_name: str, prompt_hash: str) -> bool:
    """
    Store complete product snapshot with idempotent upserts.
    
    Args:
        product_id: UUID of the product
        snap: RootSnapshot data
        model_name: Name of the AI model used
        prompt_hash: Hash of the prompt used
        
    Returns:
        True if successful, False otherwise
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Start transaction
        conn.autocommit = False
        
        # Store platform data
        for platform_name, platform_data in snap.platforms.items():
            if platform_name == 'editorial':
                if isinstance(platform_data, EditorialBlock):
                    store_editorial_data(cursor, product_id, platform_data)
            else:
                if isinstance(platform_data, PlatformData):
                    store_platform_data(cursor, product_id, platform_name, platform_data)
        
        # Store specifications
        store_specifications(cursor, product_id, snap.specifications)
        
        # Store summary
        store_summary(cursor, product_id, snap.summarized_review, model_name, prompt_hash)
        
        # Commit transaction
        conn.commit()
        return True
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error storing snapshot for product {product_id}: {str(e)}")
        return False
    finally:
        if conn:
            conn.close()

def store_platform_data(cursor, product_id: str, platform: str, platform_data: PlatformData):
    """Store platform-specific data with idempotent upserts."""
    
    # Store offers (price data)
    if platform_data.price:
        price = platform_data.price
        cursor.execute("""
            INSERT INTO offers (product_id, retailer, price_amount, price_currency, 
                              unit_price, availability, promo, url, scraped_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (product_id, retailer) 
            DO UPDATE SET
                price_amount = EXCLUDED.price_amount,
                price_currency = EXCLUDED.price_currency,
                unit_price = EXCLUDED.unit_price,
                availability = EXCLUDED.availability,
                promo = EXCLUDED.promo,
                url = EXCLUDED.url,
                scraped_at = NOW()
        """, (
            product_id, platform, price.amount, 
            ensure_currency_usd(price.currency), price.unit_price,
            clean_text(price.availability), clean_text(price.promo), platform_data.url
        ))
        
        # Capture price history if price_amount is available
        if price.amount is not None:
            cursor.execute("""
                INSERT INTO price_history (product_id, retailer, price_amount, price_currency, url, day)
                VALUES (%s, %s, %s, %s, %s, (NOW() AT TIME ZONE 'UTC')::date)
                ON CONFLICT (product_id, retailer, day) DO NOTHING
            """, (
                product_id, platform, price.amount, 
                ensure_currency_usd(price.currency), platform_data.url
            ))
    
    # Store ratings
    if platform_data.rating:
        rating = platform_data.rating
        breakdown_json = json.dumps(rating.breakdown) if rating.breakdown else None
        cursor.execute("""
            INSERT INTO ratings (product_id, retailer, average, count, breakdown, url, scraped_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
            ON CONFLICT (product_id, retailer) 
            DO UPDATE SET
                average = EXCLUDED.average,
                count = EXCLUDED.count,
                breakdown = EXCLUDED.breakdown,
                url = EXCLUDED.url,
                scraped_at = NOW()
        """, (
            product_id, platform, 
            clamp_float(rating.average, 0, 5), 
            rating.count, breakdown_json, platform_data.url
        ))
    
    # Store reviews (delete existing, then bulk insert)
    if platform_data.reviews:
        # Delete existing reviews for this product/platform
        cursor.execute("""
            DELETE FROM reviews WHERE product_id = %s AND retailer = %s
        """, (product_id, platform))
        
        # Insert new reviews (capped at 5)
        reviews_data = []
        for review in platform_data.reviews[:5]:
            reviews_data.append((
                product_id, platform, clean_text(review.author),
                clamp_float(review.rating, 0, 5) if review.rating else None,
                clean_text(review.title), clean_text(review.body),
                review.date, review.url
            ))
        
        if reviews_data:
            execute_values(cursor, """
                INSERT INTO reviews (product_id, retailer, author, rating, title, body, posted_at, url)
                VALUES %s
            """, reviews_data)

def store_editorial_data(cursor, product_id: str, editorial_block: EditorialBlock):
    """Store editorial quotes as specifications."""
    for quote in editorial_block.quotes:
        # Store as a special specification type
        spec_key = f"editorial_quote_{quote.outlet.lower().replace(' ', '_')}"
        spec_value = json.dumps({
            "outlet": quote.outlet,
            "quote": clean_text(quote.quote),
            "url": quote.url
        })
        
        cursor.execute("""
            INSERT INTO specs (product_id, key, value, source, url, scraped_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
            ON CONFLICT (product_id, key, source) 
            DO UPDATE SET
                value = EXCLUDED.value,
                url = EXCLUDED.url,
                scraped_at = NOW()
        """, (product_id, spec_key, spec_value, "editorial", quote.url))

def store_specifications(cursor, product_id: str, specs):
    """Store product specifications with idempotent upserts."""
    spec_mappings = {
        'size': specs.size,
        'form': specs.form,
        'finish_texture': specs.finish_texture,
        'spf_pa': specs.spf_pa,
        'skin_types': specs.skin_types,
        'usage': specs.usage,
        'ingredients_inci': specs.ingredients_inci,
        'certifications': specs.certifications,
        'awards': specs.awards
    }
    
    # Determine source priority (brand > retailer > editorial)
    source_priority = ['brand_site', 'amazon', 'sephora', 'ulta', 'walmart', 'nordstrom', 'editorial']
    
    for spec_key, spec_value in spec_mappings.items():
        if spec_value is not None:
            # Convert lists to JSON strings
            if isinstance(spec_value, list):
                value_str = json.dumps(spec_value)
            else:
                value_str = str(spec_value)
            
            # Clean the value
            value_str = clean_text(value_str)
            
            # Find the best source for this spec
            best_source = None
            for source in source_priority:
                if hasattr(specs, f'{source}_source') and getattr(specs, f'{source}_source'):
                    best_source = source
                    break
            
            if not best_source:
                best_source = 'aggregated'
            
            cursor.execute("""
                INSERT INTO specs (product_id, key, value, source, scraped_at)
                VALUES (%s, %s, %s, %s, NOW())
                ON CONFLICT (product_id, key, source) 
                DO UPDATE SET
                    value = EXCLUDED.value,
                    scraped_at = NOW()
            """, (product_id, spec_key, value_str, best_source))

def store_summary(cursor, product_id: str, summary, model_name: str, prompt_hash: str):
    """Store AI-generated product summary."""
    # Convert data for storage - pros/cons as PostgreSQL arrays
    pros_array = summary.pros if summary.pros else None
    cons_array = summary.cons if summary.cons else None
    aspect_scores_json = json.dumps(summary.aspect_scores.dict()) if summary.aspect_scores else None
    citations_json = json.dumps({})  # Will be populated from the snapshot
    
    cursor.execute("""
        INSERT INTO summaries (product_id, pros, cons, verdict, aspect_scores, 
                             citations, model_name, prompt_hash, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ON CONFLICT (product_id) 
        DO UPDATE SET
            pros = EXCLUDED.pros,
            cons = EXCLUDED.cons,
            verdict = EXCLUDED.verdict,
            aspect_scores = EXCLUDED.aspect_scores,
            citations = EXCLUDED.citations,
            model_name = EXCLUDED.model_name,
            prompt_hash = EXCLUDED.prompt_hash,
            updated_at = NOW()
    """, (
        product_id, pros_array, cons_array, clean_text(summary.verdict),
        aspect_scores_json, citations_json, model_name, prompt_hash
    ))

def get_consolidated_product(product_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve consolidated product data from database.
    
    Args:
        product_id: UUID of the product
        
    Returns:
        Consolidated product data dictionary or None if not found
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get product info
        cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
        product = cursor.fetchone()
        if not product:
            return None
        
        # Get offers by retailer
        cursor.execute("SELECT * FROM offers WHERE product_id = %s", (product_id,))
        offers = {}
        for offer in cursor.fetchall():
            offers[offer['retailer']] = {
                'retailer': offer['retailer'],
                'price_amount': offer['price_amount'],
                'price_currency': offer['price_currency'],
                'unit_price': offer['unit_price'],
                'availability': offer['availability'],
                'promo': offer['promo'],
                'url': offer['url'],
                'scraped_at': offer['scraped_at']
            }
        
        # Get ratings by retailer
        cursor.execute("SELECT * FROM ratings WHERE product_id = %s", (product_id,))
        ratings = {}
        for rating in cursor.fetchall():
            ratings[rating['retailer']] = {
                'retailer': rating['retailer'],
                'average': rating['average'],
                'count': rating['count'],
                'breakdown': rating['breakdown'],
                'url': rating['url'],
                'scraped_at': rating['scraped_at']
            }
        
        # Get reviews by retailer
        cursor.execute("SELECT * FROM reviews WHERE product_id = %s ORDER BY retailer, inserted_at", (product_id,))
        reviews = {}
        for review in cursor.fetchall():
            retailer = review['retailer']
            if retailer not in reviews:
                reviews[retailer] = []
            reviews[retailer].append({
                'author': review['author'],
                'rating': review['rating'],
                'title': review['title'],
                'body': review['body'],
                'posted_at': review['posted_at'],
                'url': review['url'],
                'helpful_count': review['helpful_count']
            })
        
        # Get specifications
        cursor.execute("SELECT * FROM specs WHERE product_id = %s", (product_id,))
        specs = []
        for spec in cursor.fetchall():
            specs.append({
                'key': spec['key'],
                'value': spec['value'],
                'source': spec['source'],
                'url': spec['url'],
                'scraped_at': spec['scraped_at']
            })
        
        # Get summary
        cursor.execute("SELECT * FROM summaries WHERE product_id = %s", (product_id,))
        summary = cursor.fetchone()
        summary_data = None
        if summary:
            summary_data = {
                'pros': summary['pros'],
                'cons': summary['cons'],
                'verdict': summary['verdict'],
                'aspect_scores': summary['aspect_scores'],
                'citations': summary['citations'],
                'model_name': summary['model_name'],
                'updated_at': summary['updated_at']
            }
        
        # Convert all datetime objects to strings for JSON serialization
        result = {
            'product': dict(product),
            'offers': offers,
            'ratings': ratings,
            'reviews': reviews,
            'specs': specs,
            'summary': summary_data
        }
        
        return convert_datetime_to_string(result)
        
    except Exception as e:
        print(f"Error retrieving consolidated product {product_id}: {str(e)}")
        return None
    finally:
        if conn:
            conn.close()

def get_all_products() -> List[Dict[str, Any]]:
    """
    Retrieve all products with last updated information.
    
    Returns:
        List of products with last_updated field
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                p.*,
                GREATEST(
                    COALESCE(MAX(o.scraped_at), '1970-01-01'),
                    COALESCE(MAX(r.scraped_at), '1970-01-01'),
                    COALESCE(MAX(s.updated_at), '1970-01-01')
                ) as last_updated
            FROM products p
            LEFT JOIN offers o ON p.id = o.product_id
            LEFT JOIN ratings r ON p.id = r.product_id
            LEFT JOIN summaries s ON p.id = s.product_id
            GROUP BY p.id, p.slug, p.name, p.brand, p.category, p.hero_image_url, p.description, p.created_at, p.updated_at
            ORDER BY p.brand, p.name
        """)
        
        products = []
        for row in cursor.fetchall():
            product_dict = dict(row)
            # Convert last_updated to string if it's a datetime object
            if 'last_updated' in product_dict and product_dict['last_updated'] is not None:
                if hasattr(product_dict['last_updated'], 'isoformat'):
                    product_dict['last_updated'] = product_dict['last_updated'].isoformat()
                elif hasattr(product_dict['last_updated'], 'strftime'):
                    product_dict['last_updated'] = product_dict['last_updated'].strftime('%Y-%m-%dT%H:%M:%SZ')
                else:
                    # Fallback: convert to string
                    product_dict['last_updated'] = str(product_dict['last_updated'])
            products.append(product_dict)
        
        return products
        
    except Exception as e:
        print(f"Error retrieving all products: {str(e)}")
        return []
    finally:
        if conn:
            conn.close()

def get_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve basic product information by ID.
    
    Args:
        product_id: UUID of the product
        
    Returns:
        Product data dictionary or None if not found
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
        product = cursor.fetchone()
        
        return dict(product) if product else None
        
    except Exception as e:
        print(f"Error retrieving product {product_id}: {str(e)}")
        return None
    finally:
        if conn:
            conn.close()

def get_price_history(product_id: str, retailers: Optional[List[str]] = None, days: int = 90) -> List[Dict[str, Any]]:
    """
    Retrieve price history for a product.
    
    Args:
        product_id: UUID of the product
        retailers: Optional list of retailers to filter by
        days: Number of days to look back (default 90)
        
    Returns:
        List of price history records
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build query with optional retailer filter
        query = """
            SELECT day, retailer, price_amount, price_currency, url
            FROM price_history 
            WHERE product_id = %s 
            AND day >= (CURRENT_DATE - INTERVAL '%s days')
        """
        params = [product_id, days]
        
        if retailers:
            placeholders = ','.join(['%s'] * len(retailers))
            query += f" AND retailer IN ({placeholders})"
            params.extend(retailers)
        
        query += " ORDER BY day ASC, retailer ASC"
        
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        return [dict(row) for row in results]
        
    except Exception as e:
        print(f"Error retrieving price history for product {product_id}: {str(e)}")
        return []
    finally:
        if conn:
            conn.close()

def get_compare_data(product_ids: List[str]) -> List[Dict[str, Any]]:
    """
    Retrieve comparison data for multiple products.
    
    Args:
        product_ids: List of product UUIDs to compare
        
    Returns:
        List of comparison data dictionaries
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if not product_ids:
            return []
        
        # Build placeholders for the IN clause
        placeholders = ','.join(['%s'] * len(product_ids))
        
        # Get basic product info
        cursor.execute(f"""
            SELECT id, slug, name, brand, hero_image_url
            FROM products 
            WHERE id IN ({placeholders})
        """, product_ids)
        
        products = {row['id']: dict(row) for row in cursor.fetchall()}
        
        # Get minimum prices
        cursor.execute(f"""
            SELECT product_id, MIN(price_amount) as min_price
            FROM offers 
            WHERE product_id IN ({placeholders}) 
            AND price_currency = 'USD' 
            AND price_amount IS NOT NULL
            GROUP BY product_id
        """, product_ids)
        
        min_prices = {row['product_id']: row['min_price'] for row in cursor.fetchall()}
        
        # Get best ratings (highest count)
        cursor.execute(f"""
            SELECT DISTINCT ON (product_id) 
                product_id, average, count
            FROM ratings 
            WHERE product_id IN ({placeholders}) 
            AND count IS NOT NULL
            ORDER BY product_id, count DESC
        """, product_ids)
        
        best_ratings = {}
        for row in cursor.fetchall():
            best_ratings[row['product_id']] = {
                'average': row['average'],
                'count': row['count']
            }
        
        # Get verdict snippets
        cursor.execute(f"""
            SELECT product_id, verdict
            FROM summaries 
            WHERE product_id IN ({placeholders})
            AND verdict IS NOT NULL
        """, product_ids)
        
        verdicts = {}
        for row in cursor.fetchall():
            if row['verdict']:
                # Extract first sentence
                first_sentence = row['verdict'].split('.')[0] + '.' if '.' in row['verdict'] else row['verdict']
                verdicts[row['product_id']] = first_sentence[:100] + '...' if len(first_sentence) > 100 else first_sentence
        
        # Get key specs
        cursor.execute(f"""
            SELECT product_id, key, value
            FROM specs 
            WHERE product_id IN ({placeholders})
            AND key IN ('size', 'form', 'finish_texture')
        """, product_ids)
        
        key_specs = {}
        for row in cursor.fetchall():
            if row['product_id'] not in key_specs:
                key_specs[row['product_id']] = {}
            key_specs[row['product_id']][row['key']] = row['value']
        
        # Build comparison data
        compare_data = []
        for product_id in product_ids:
            if product_id in products:
                product = products[product_id]
                compare_data.append({
                    'id': product_id,
                    'slug': product['slug'],
                    'name': product['name'],
                    'brand': product['brand'],
                    'hero_image_url': product['hero_image_url'],
                    'min_price_usd': min_prices.get(product_id),
                    'best_rating_avg': best_ratings.get(product_id, {}).get('average'),
                    'best_rating_count': best_ratings.get(product_id, {}).get('count'),
                    'verdict_snippet': verdicts.get(product_id),
                    'key_specs': key_specs.get(product_id, {})
                })
        
        return compare_data
        
    except Exception as e:
        print(f"Error retrieving comparison data: {str(e)}")
        return []
    finally:
        if conn:
            conn.close()

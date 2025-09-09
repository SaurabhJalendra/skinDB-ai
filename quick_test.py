#!/usr/bin/env python3
"""
Quick LLM test for Prism Beauty
"""
import requests
import json
import time

def test_basic_connectivity():
    """Test basic backend connectivity"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend is running: {data.get('message', 'OK')}")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False

def get_first_product():
    """Get the first product for testing"""
    try:
        response = requests.get("http://localhost:8000/products", timeout=5)
        if response.status_code == 200:
            products = response.json()
            if products:
                product = products[0]
                print(f"✅ Found test product: {product.get('brand', 'Unknown')} - {product.get('name', 'Unknown')}")
                return product['id']
            else:
                print("❌ No products found in database")
                return None
        else:
            print(f"❌ Products API failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Products API error: {e}")
        return None

def test_llm_ingestion_simple(product_id):
    """Test LLM ingestion with simple output"""
    print(f"\n🧪 Testing LLM ingestion for product: {product_id}")
    print("⏳ This may take 30-60 seconds with real API calls...")
    
    try:
        start_time = time.time()
        
        response = requests.post(
            f"http://localhost:8000/ingest/{product_id}",
            timeout=120  # Give it 2 minutes for LLM processing
        )
        
        duration = time.time() - start_time
        print(f"⏱️  Request completed in {duration:.1f} seconds")
        
        if response.status_code == 200:
            data = response.json()
            print("🎉 LLM ingestion successful!")
            
            # Check what data we got
            product_name = data.get('product', {}).get('name', 'Unknown')
            offers_count = len(data.get('offers', {}))
            ratings_count = len(data.get('ratings', {}))
            reviews_count = len(data.get('reviews', {}))
            
            print(f"   📦 Product: {product_name}")
            print(f"   💰 Offers: {offers_count}")
            print(f"   ⭐ Ratings: {ratings_count}")
            print(f"   📝 Reviews: {reviews_count}")
            
            if offers_count > 0 or ratings_count > 0:
                print("✅ SUCCESS: LLM populated new data!")
                return True
            else:
                print("⚠️  LLM ran but no offers/ratings data returned")
                return False
                
        elif response.status_code == 422:
            try:
                error_data = response.json()
                print(f"❌ Validation error: {error_data}")
            except:
                print(f"❌ Validation error: {response.text[:200]}")
            return False
        else:
            print(f"❌ HTTP error {response.status_code}: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out - LLM call may be taking too long")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    print("🎨 Prism Beauty - Quick LLM Test")
    print("=" * 40)
    
    # Step 1: Test connectivity
    if not test_basic_connectivity():
        print("💥 Please ensure the backend is running: docker-compose up -d")
        return
    
    # Step 2: Get a product to test
    product_id = get_first_product()
    if not product_id:
        print("💥 Please ensure products are seeded in the database")
        return
    
    # Step 3: Test LLM integration
    success = test_llm_ingestion_simple(product_id)
    
    if success:
        print("\n🎉 LLM integration is working!")
        print("🔄 Refresh your frontend at http://localhost:3000 to see the new data!")
    else:
        print("\n💥 LLM integration needs debugging")
        print("📋 Check the backend logs: docker-compose logs ingestion --tail=20")

if __name__ == "__main__":
    main()

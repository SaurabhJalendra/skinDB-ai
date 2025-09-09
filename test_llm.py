#!/usr/bin/env python3
"""
Test script to verify LLM integration for Prism
"""
import os
import sys
import requests
import json

def test_backend_health():
    """Test if backend is responsive"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"✅ Backend health: {response.status_code} - {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Backend health failed: {e}")
        return False

def test_products_api():
    """Test if products API returns data"""
    try:
        response = requests.get("http://localhost:8000/products", timeout=5)
        products = response.json()
        print(f"✅ Products API: {response.status_code} - Found {len(products)} products")
        if products:
            print(f"   First product: {products[0].get('brand', 'Unknown')} - {products[0].get('name', 'Unknown')}")
        return True, products[0]['id'] if products else None
    except Exception as e:
        print(f"❌ Products API failed: {e}")
        return False, None

def test_llm_ingestion(product_id):
    """Test LLM ingestion for a specific product"""
    try:
        print(f"🧪 Testing LLM ingestion for product: {product_id}")
        response = requests.post(
            f"http://localhost:8000/ingest/{product_id}", 
            timeout=60  # LLM calls can take time
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ LLM ingestion successful!")
            print(f"   Product: {result.get('product', {}).get('name', 'Unknown')}")
            
            # Check if we got new data
            offers = result.get('offers', {})
            ratings = result.get('ratings', {})
            print(f"   Offers found: {len(offers)}")
            print(f"   Ratings found: {len(ratings)}")
            
            return True
        else:
            print(f"❌ LLM ingestion failed: {response.status_code}")
            try:
                error_detail = response.json()
                print(f"   Error: {error_detail}")
            except:
                print(f"   Response: {response.text[:200]}...")
            return False
    except Exception as e:
        print(f"❌ LLM ingestion error: {e}")
        return False

def main():
    print("🎨 Prism - LLM Integration Test")
    print("=" * 50)
    
    # Test 1: Backend Health
    if not test_backend_health():
        print("💥 Backend is not responding. Please start the application first.")
        return
    
    # Test 2: Products API
    products_ok, product_id = test_products_api()
    if not products_ok or not product_id:
        print("💥 No products found. Please seed the database first.")
        return
    
    # Test 3: LLM Ingestion
    print("\n🤖 Testing LLM Integration...")
    print("This will make a real API call to OpenRouter and may take 30-60 seconds...")
    
    if test_llm_ingestion(product_id):
        print("\n🎉 LLM integration is working! Check your frontend for updated data.")
    else:
        print("\n💥 LLM integration failed. Check the logs for details.")

if __name__ == "__main__":
    main()

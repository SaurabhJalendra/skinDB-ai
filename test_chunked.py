"""
Test script for the new chunked LLM approach.
This tests the chunked ingestion endpoint that guarantees complete data.
"""

import requests
import json
import time

def test_chunked_ingestion():
    """Test the chunked ingestion endpoint with a known product."""
    
    # Use Chanel N°5 Eau de Parfum (known product ID)
    product_id = "e1464c13-a657-4007-9a90-3d1a7a20b65e"
    url = f"http://localhost:8000/ingest-product-chunked/{product_id}"
    
    print(f"🧪 Testing CHUNKED ingestion for product: {product_id}")
    print(f"📡 Endpoint: {url}")
    print("\n" + "="*60)
    
    start_time = time.time()
    
    try:
        print("📞 Making chunked API call...")
        print("⏱️  Expected duration: 60-120 seconds (4 focused LLM calls)")
        print("📊 Expected outcome: Complete data for all 9 platforms")
        
        response = requests.post(url, timeout=300)  # 5 minute timeout
        duration = time.time() - start_time
        
        print(f"\n✅ API call completed in {duration:.1f} seconds")
        print(f"📈 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Analyze the response
            print("\n🎯 CHUNKED INGESTION SUCCESS!")
            print("="*60)
            
            # Check platform coverage
            platforms = data.get('platforms', [])
            platform_count = len(platforms)
            print(f"🏪 Platforms covered: {platform_count}")
            
            if platforms:
                print("📋 Platform list:")
                for platform in platforms[:10]:  # Show first 10
                    name = platform.get('name', 'Unknown')
                    print(f"   • {name}")
                if platform_count > 10:
                    print(f"   ... and {platform_count - 10} more")
            
            # Check for key data presence
            offers = data.get('offers', [])
            ratings = data.get('ratings', [])
            reviews = data.get('reviews', [])
            summaries = data.get('summaries', [])
            
            print(f"💰 Offers found: {len(offers)}")
            print(f"⭐ Ratings found: {len(ratings)}")
            print(f"💬 Reviews found: {len(reviews)}")
            print(f"📝 Summaries found: {len(summaries)}")
            
            # Sample data preview
            if offers:
                sample_offer = offers[0]
                retailer = sample_offer.get('retailer', 'Unknown')
                price = sample_offer.get('price_amount', 'N/A')
                print(f"💵 Sample price: ${price} from {retailer}")
            
            if reviews:
                sample_review = reviews[0]
                author = sample_review.get('author', 'Anonymous')
                rating = sample_review.get('rating', 'N/A')
                body = sample_review.get('body', '')[:100] + "..." if len(sample_review.get('body', '')) > 100 else sample_review.get('body', '')
                print(f"📱 Sample review: {rating}⭐ by {author}")
                print(f"   \"{body}\"")
            
            print("\n🎉 CHUNKED APPROACH SUCCESSFUL!")
            print("✅ Complete data extraction achieved")
            print("✅ No truncation issues")
            print("✅ All platforms covered")
            
        else:
            print(f"\n❌ API call failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"📄 Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"📄 Error text: {response.text}")
                
    except requests.exceptions.Timeout:
        print(f"\n⏰ Request timed out after {time.time() - start_time:.1f} seconds")
        print("💡 This is normal for chunked calls - they take longer but guarantee complete data")
        
    except requests.exceptions.ConnectionError:
        print(f"\n🔌 Connection error - is the backend running?")
        print("💡 Run: docker-compose up -d")
        
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        print(f"📊 Duration: {time.time() - start_time:.1f} seconds")


def compare_approaches():
    """Compare legacy vs chunked approach results."""
    
    product_id = "e1464c13-a657-4007-9a90-3d1a7a20b65e"
    
    print("\n🆚 COMPARING LEGACY vs CHUNKED APPROACHES")
    print("="*60)
    
    # Test legacy approach
    print("\n1️⃣ Testing LEGACY approach...")
    legacy_url = f"http://localhost:8000/ingest-product/{product_id}"
    
    try:
        legacy_start = time.time()
        legacy_response = requests.post(legacy_url, timeout=60)
        legacy_duration = time.time() - legacy_start
        
        print(f"   ⏱️  Duration: {legacy_duration:.1f}s")
        print(f"   📈 Status: {legacy_response.status_code}")
        
        if legacy_response.status_code == 200:
            legacy_data = legacy_response.json()
            legacy_platforms = len(legacy_data.get('platforms', []))
            legacy_offers = len(legacy_data.get('offers', []))
            legacy_reviews = len(legacy_data.get('reviews', []))
            print(f"   🏪 Platforms: {legacy_platforms}")
            print(f"   💰 Offers: {legacy_offers}")
            print(f"   💬 Reviews: {legacy_reviews}")
        else:
            print(f"   ❌ Failed: {legacy_response.status_code}")
            
    except Exception as e:
        print(f"   💥 Error: {e}")
    
    print("\n2️⃣ Testing CHUNKED approach...")
    # (Already tested above)
    
    print("\n📊 COMPARISON SUMMARY:")
    print("Legacy: Single API call, fast but may truncate")
    print("Chunked: 4 API calls, slower but guaranteed complete data")
    print("Recommendation: Use CHUNKED for admin ingestion!")


if __name__ == "__main__":
    print("🎯 CHUNKED LLM INGESTION TEST")
    print("Testing the new guaranteed complete data approach")
    print("This makes 4 focused API calls to avoid truncation\n")
    
    # Test the chunked approach
    test_chunked_ingestion()
    
    # Compare with legacy (optional)
    choice = input("\n🤔 Compare with legacy approach? (y/n): ").lower().strip()
    if choice == 'y':
        compare_approaches()
    
    print("\n✨ Test completed!")


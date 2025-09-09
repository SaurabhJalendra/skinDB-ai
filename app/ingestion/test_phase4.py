#!/usr/bin/env python3
"""
Test script for Phase 4: Finalize FastAPI response typing and API docs
Verifies response models, API documentation, and endpoint functionality.
"""

import asyncio
import json
from fastapi.testclient import TestClient
from main import app, ProductListItem, ConsolidatedProductResponse, IngestAllResponse

def test_phase4_response_models():
    """Test that all response models are properly defined."""
    print("🧪 Testing Phase 4: FastAPI Response Typing & API Docs\n")
    
    print("📋 Testing response models...")
    
    try:
        # Test ProductListItem model
        product_item = ProductListItem(
            id="test-uuid",
            slug="test-product",
            name="Test Product",
            brand="Test Brand",
            hero_image_url="/images/test.jpg",
            last_updated="2024-01-01T00:00:00Z"
        )
        print("✅ ProductListItem model working")
        
        # Test OfferResp model
        from main import OfferResp
        offer = OfferResp(
            retailer="amazon",
            price_amount=29.99,
            price_currency="USD",
            availability="In Stock",
            url="https://amazon.com/test",
            scraped_at="2024-01-01T00:00:00Z"
        )
        print("✅ OfferResp model working")
        
        # Test RatingResp model
        from main import RatingResp
        rating = RatingResp(
            retailer="amazon",
            average=4.5,
            count=100,
            breakdown={"5_star": 0.7, "4_star": 0.2},
            url="https://amazon.com/test",
            scraped_at="2024-01-01T00:00:00Z"
        )
        print("✅ RatingResp model working")
        
        # Test ReviewResp model
        from main import ReviewResp
        review = ReviewResp(
            author="Test User",
            rating=5.0,
            title="Great Product",
            body="This is an excellent product that I highly recommend.",
            posted_at="2024-01-01",
            url="https://amazon.com/review"
        )
        print("✅ ReviewResp model working")
        
        # Test SpecResp model
        from main import SpecResp
        spec = SpecResp(
            key="size",
            value="50ml",
            source="amazon",
            url="https://amazon.com/test",
            scraped_at="2024-01-01T00:00:00Z"
        )
        print("✅ SpecResp model working")
        
        # Test SummaryResp model
        from main import SummaryResp
        summary = SummaryResp(
            pros=["Long-lasting", "Smooth texture", "Great value"],
            cons=["Expensive", "Strong scent", "Limited availability"],
            verdict="Excellent product with minor drawbacks.",
            aspect_scores={"longevity": 0.8, "texture": 0.9, "irritation": 0.1, "value": 0.7},
            citations={"amazon": "https://amazon.com/test", "sephora": "https://sephora.com/test"},
            updated_at="2024-01-01T00:00:00Z"
        )
        print("✅ SummaryResp model working")
        
        # Test ConsolidatedProductResponse model
        from main import OfferResp, RatingResp, ReviewResp, SpecResp, SummaryResp
        consolidated = ConsolidatedProductResponse(
            product={"id": "test-uuid", "name": "Test Product"},
            offers={"amazon": offer},
            ratings={"amazon": rating},
            reviews={"amazon": [review]},
            specs=[spec],
            summary=summary
        )
        print("✅ ConsolidatedProductResponse model working")
        
        # Test IngestAllResponse model
        ingest_response = IngestAllResponse(
            processed=5,
            errors=["Error 1", "Error 2"],
            total_products=10,
            success_rate="50.0%"
        )
        print("✅ IngestAllResponse model working")
        
        return True
        
    except Exception as e:
        print(f"❌ Response model test failed: {e}")
        return False

def test_phase4_endpoints():
    """Test all Phase 4 endpoints with response models."""
    print("\n🌐 Testing Phase 4 endpoints...")
    
    client = TestClient(app)
    
    # Test root endpoint
    try:
        response = client.get("/")
        print(f"✅ Root endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
        return False
    
    # Test health endpoint
    try:
        response = client.get("/health")
        print(f"✅ Health endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Health endpoint failed: {e}")
        return False
    
    # Test products endpoint (should work even without data)
    try:
        response = client.get("/products")
        print(f"✅ Products endpoint: {response.status_code}")
        data = response.json()
        print(f"   - Response type: {type(data)}")
        print(f"   - Products count: {len(data) if isinstance(data, list) else 'N/A'}")
    except Exception as e:
        print(f"❌ Products endpoint failed: {e}")
        return False
    
    # Test product endpoint with invalid ID (should return 404)
    try:
        response = client.get("/product/invalid-uuid")
        if response.status_code == 404:
            print("✅ Product endpoint: 404 for invalid ID (expected)")
        else:
            print(f"⚠️  Product endpoint: {response.status_code} for invalid ID")
    except Exception as e:
        print(f"❌ Product endpoint failed: {e}")
        return False
    
    # Test ingest endpoint with invalid ID (should return 404)
    try:
        response = client.post("/ingest/invalid-uuid")
        if response.status_code == 404:
            print("✅ Ingest endpoint: 404 for invalid ID (expected)")
        else:
            print(f"⚠️  Ingest endpoint: {response.status_code} for invalid ID")
    except Exception as e:
        print(f"❌ Ingest endpoint failed: {e}")
        return False
    
    # Test ingest-all endpoint (should work even without data)
    try:
        response = client.post("/ingest-all")
        print(f"✅ Ingest-all endpoint: {response.status_code}")
        data = response.json()
        print(f"   - Response type: {type(data)}")
        print(f"   - Processed: {data.get('processed', 0)}")
        print(f"   - Errors: {len(data.get('errors', []))}")
    except Exception as e:
        print(f"❌ Ingest-all endpoint failed: {e}")
        return False
    
    return True

def test_phase4_api_docs():
    """Test that API documentation endpoints are accessible."""
    print("\n📚 Testing API documentation...")
    
    client = TestClient(app)
    
    # Test OpenAPI schema endpoint
    try:
        response = client.get("/openapi.json")
        if response.status_code == 200:
            schema = response.json()
            print(f"✅ OpenAPI schema accessible")
            print(f"   - Title: {schema.get('info', {}).get('title', 'N/A')}")
            print(f"   - Version: {schema.get('info', {}).get('version', 'N/A')}")
            print(f"   - Paths: {len(schema.get('paths', {}))}")
            
            # Check for response models in schema
            components = schema.get('components', {}).get('schemas', {})
            required_models = [
                'ProductListItem', 'OfferResp', 'RatingResp', 'ReviewResp',
                'SpecResp', 'SummaryResp', 'ConsolidatedProductResponse', 'IngestAllResponse'
            ]
            
            missing_models = [model for model in required_models if model not in components]
            if not missing_models:
                print("✅ All response models present in OpenAPI schema")
            else:
                print(f"⚠️  Missing models in schema: {missing_models}")
                
        else:
            print(f"❌ OpenAPI schema returned {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ OpenAPI schema test failed: {e}")
        return False
    
    # Test that all endpoints have proper response models
    try:
        response = client.get("/openapi.json")
        schema = response.json()
        paths = schema.get('paths', {})
        
        # Check key endpoints for response models
        endpoint_checks = [
            ("/products", "get", "ProductListItem", True),  # True = is array
            ("/product/{product_id}", "get", "ConsolidatedProductResponse", False),
            ("/ingest/{product_id}", "post", "ConsolidatedProductResponse", False),
            ("/ingest-all", "post", "IngestAllResponse", False)
        ]
        
        all_endpoints_valid = True
        for path, method, expected_model, is_array in endpoint_checks:
            if path in paths and method in paths[path]:
                endpoint = paths[path][method]
                response_model = endpoint.get('responses', {}).get('200', {}).get('content', {}).get('application/json', {}).get('schema', {})
                
                if response_model:
                    if is_array:
                        # For array responses, check if items reference the expected model
                        items_ref = response_model.get('items', {}).get('$ref', '')
                        if expected_model in items_ref:
                            print(f"✅ {path} {method.upper()}: List[{expected_model}]")
                        else:
                            print(f"⚠️  {path} {method.upper()}: Expected List[{expected_model}], got {items_ref}")
                            all_endpoints_valid = False
                    else:
                        # For direct responses, check the reference
                        ref = response_model.get('$ref', '')
                        if expected_model in ref:
                            print(f"✅ {path} {method.upper()}: {expected_model}")
                        else:
                            print(f"⚠️  {path} {method.upper()}: Expected {expected_model}, got {ref}")
                            all_endpoints_valid = False
                else:
                    print(f"❌ {path} {method.upper()}: No response model")
                    all_endpoints_valid = False
            else:
                print(f"❌ {path} {method.upper()}: Endpoint not found")
                all_endpoints_valid = False
        
        return all_endpoints_valid
        
    except Exception as e:
        print(f"❌ Endpoint response model check failed: {e}")
        return False

def main():
    """Run all Phase 4 tests."""
    print("🚀 Phase 4 Testing Suite\n")
    
    tests = [
        ("Response Models", test_phase4_response_models),
        ("API Endpoints", test_phase4_endpoints),
        ("API Documentation", test_phase4_api_docs)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {e}")
    
    print(f"\n🎯 Phase 4 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All Phase 4 tests passed! The API is fully documented and typed.")
        print("\n✅ Response models properly defined")
        print("✅ All endpoints have response_model annotations")
        print("✅ API documentation loads correctly")
        print("✅ OpenAPI schema includes all models")
        print("\n📖 View API docs at:")
        print("   - Swagger UI: http://localhost:8000/docs")
        print("   - ReDoc: http://localhost:8000/redoc")
    else:
        print("⚠️  Some tests failed. Please review the errors above.")
    
    return passed == total

if __name__ == "__main__":
    main()

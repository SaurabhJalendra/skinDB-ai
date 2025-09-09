#!/usr/bin/env python3
"""
CLI helper script to trigger batch ingestion for all products.
Useful for development and testing.
"""

import sys
import requests
import json
from typing import Dict, Any


def ingest_all_products(base_url: str = "http://localhost:8000") -> Dict[str, Any]:
    """
    Call the FastAPI ingest-all endpoint and return results.
    
    Args:
        base_url: Base URL of the FastAPI server
        
    Returns:
        Dictionary containing ingestion results
    """
    url = f"{base_url}/ingest-all"
    
    try:
        print(f"Calling {url}...")
        response = requests.post(url, timeout=300)  # 5 minute timeout
        response.raise_for_status()
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        print(f"Error calling ingestion endpoint: {e}")
        return {"error": str(e)}


def main():
    """Main CLI function."""
    # Parse command line arguments
    base_url = "http://localhost:8000"
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    
    print("Beauty Aggregator - Batch Ingestion CLI")
    print("=" * 40)
    
    # Call the ingestion endpoint
    result = ingest_all_products(base_url)
    
    # Display results
    if "error" in result:
        print(f"❌ Failed: {result['error']}")
        sys.exit(1)
    else:
        processed = result.get("processed", 0)
        total = result.get("total_products", 0)
        errors = result.get("errors", [])
        success_rate = result.get("success_rate", "0.0%")
        
        print(f"✅ Batch ingestion complete!")
        print(f"   Processed: {processed}/{total} products")
        print(f"   Success rate: {success_rate}")
        
        if errors:
            print(f"   Errors ({len(errors)}):")
            for error in errors[:5]:  # Show first 5 errors
                print(f"     - {error}")
            if len(errors) > 5:
                print(f"     ... and {len(errors) - 5} more")
        
        # Print summary
        print("\n" + "=" * 40)
        print(f"Summary: {processed} processed, {len(errors)} errors")


if __name__ == "__main__":
    main()


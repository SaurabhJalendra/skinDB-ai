"""
Debug script to see what the chunked approach is actually generating
"""

import sys
import os
sys.path.append('app/ingestion')

from chunked_llama import fetch_product_snapshot_chunked
import json

def debug_chunked_output():
    """Test chunked output and see the actual structure"""
    
    product_name = "Beautyblender Original Sponge"
    
    print(f"🧪 Testing chunked data collection for: {product_name}")
    print("="*60)
    
    try:
        # Call the chunked function directly
        result = fetch_product_snapshot_chunked(product_name, "Beautyblender")
        
        print("✅ Chunked collection successful!")
        print(f"📊 Result type: {type(result)}")
        
        if isinstance(result, dict):
            print(f"🔑 Top-level keys: {list(result.keys())}")
            
            # Check each section
            sections = ['product_identity', 'platforms', 'specifications', 'summarized_review', 'citations']
            for section in sections:
                if section in result:
                    print(f"✅ {section}: Present")
                    if section == 'platforms':
                        platforms = result[section]
                        print(f"   🏪 Platform count: {len(platforms)}")
                        print(f"   📋 Platforms: {list(platforms.keys())}")
                        
                        # Show structure of first platform
                        if platforms:
                            first_platform = next(iter(platforms.keys()))
                            platform_data = platforms[first_platform]
                            print(f"   🔍 {first_platform} structure: {list(platform_data.keys()) if isinstance(platform_data, dict) else type(platform_data)}")
                else:
                    print(f"❌ {section}: Missing")
            
            # Save to file for inspection
            with open('chunked_output_debug.json', 'w') as f:
                json.dump(result, f, indent=2)
            print(f"💾 Full output saved to: chunked_output_debug.json")
            
        else:
            print(f"❌ Unexpected result type: {type(result)}")
            print(f"📄 Result: {result}")
            
    except Exception as e:
        print(f"💥 Error during chunked collection: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_chunked_output()


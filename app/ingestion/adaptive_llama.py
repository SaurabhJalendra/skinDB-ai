"""
Adaptive LLM approach with category-aware, flexible prompting.
Provides rich, context-specific data extraction without rigid schema constraints.
"""

import os
import json
import logging
from typing import Dict, List, Optional
from openai import OpenAI

logger = logging.getLogger(__name__)

# OpenRouter Configuration
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_MODEL = "openai/gpt-4o-mini-search-preview"
OPENROUTER_REFERER = "Prism"
OPENROUTER_TITLE = "Prism API"

# Category-specific specifications and aspects
CATEGORY_SPECS = {
    "Fragrance": {
        "specs": ["fragrance_notes", "concentration", "longevity_hours", "sillage_rating", "season_suitability", "occasion_suitability"],
        "aspects": ["longevity", "sillage", "uniqueness", "versatility", "value_for_money"],
        "description": "perfume, cologne, or fragrance product"
    },
    "Makeup": {
        "specs": ["coverage_level", "finish_type", "shade_range", "undertones", "application_method", "skin_type_suitability"],
        "aspects": ["coverage", "blendability", "longevity", "color_accuracy", "ease_of_application", "value_for_money"],
        "description": "makeup, cosmetics, color cosmetics, foundation, lipstick, mascara, blush, eyeshadow"
    },
    "Skincare": {
        "specs": ["skin_concerns", "active_ingredients", "ph_level", "texture_type", "skin_type_suitability", "usage_frequency"],
        "aspects": ["effectiveness", "gentleness", "absorption", "hydration", "non_comedogenic", "value_for_money"],
        "description": "skincare, serum, moisturizer, cleanser, toner, essence, cream, lotion, treatment"
    },
    "Tools": {
        "specs": ["material", "bristle_type", "handle_design", "cleaning_ease", "durability_rating", "ergonomics"],
        "aspects": ["durability", "ease_of_use", "effectiveness", "ergonomics", "cleaning_ease", "value_for_money"],
        "description": "beauty tools, brushes, sponges, curlers, applicators, devices"
    }
}

def detect_product_category(product_name: str, brand: str = "", description: str = "") -> str:
    """
    Detect product category using intelligent analysis.
    """
    product_text = f"{product_name} {brand} {description}".lower()
    
    # Category keywords with weights
    category_indicators = {
        "Fragrance": ["perfume", "eau de parfum", "eau de toilette", "cologne", "fragrance", "scent"],
        "Makeup": ["foundation", "lipstick", "mascara", "eyeshadow", "blush", "concealer", "powder", "makeup", "cosmetic"],
        "Skincare": ["serum", "moisturizer", "cleanser", "cream", "lotion", "essence", "toner", "treatment", "skincare"],
        "Tools": ["brush", "sponge", "curler", "applicator", "tool", "device", "blender"]
    }
    
    scores = {}
    for category, keywords in category_indicators.items():
        scores[category] = sum(1 for keyword in keywords if keyword in product_text)
    
    # Return category with highest score, default to Makeup if tie
    detected = max(scores, key=scores.get) if max(scores.values()) > 0 else "Makeup"
    logger.info(f"Category detection for '{product_name}': {detected} (scores: {scores})")
    return detected

def fetch_adaptive_retail_chunk(product_name: str, category: str) -> Dict:
    """
    Fetch retail platform data with category-aware specifications.
    """
    category_info = CATEGORY_SPECS.get(category, CATEGORY_SPECS["Makeup"])
    specs_examples = ", ".join(category_info["specs"][:4])
    
    system_prompt = f"""You are a beauty product retail specialist. Extract ONLY retail platform data for {category_info['description']} products.

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no code blocks.

CATEGORY-SPECIFIC APPROACH:
- Product Category: {category}
- Focus on relevant specs: {specs_examples}
- Ignore irrelevant specifications for this category

REQUIRED OUTPUT FORMAT - Return ONLY this JSON structure:
{{
  "platforms": {{
    "amazon": {{
      "url": "https://amazon.com/product-url",
      "price": {{"amount": 25.99, "currency": "USD", "unit_price": "25.99/fl oz", "availability": "in_stock", "promo": "15% off"}},
      "rating": {{"average": 4.2, "count": 1250, "breakdown": {{"5": 650, "4": 300, "3": 150, "2": 100, "1": 50}}}},
      "reviews": [
        {{"author": "VerifiedUser123", "rating": 5, "title": "Amazing {category.lower()}", "body": "Perfect for my needs...", "date": "2024-01-15", "url": "https://amazon.com/review/1"}}
      ],
      "summary": "Amazon customers highlight category-specific benefits"
    }},
    "sephora": {{ /* same structure */ }},
    "ulta": {{ /* same structure */ }},
    "walmart": {{ /* same structure */ }},
    "nordstrom": {{ /* same structure */ }}
  }}
}}

REQUIREMENTS:
- Search current web data for each platform
- Include 3-5 most helpful reviews per platform (body ≤150 chars)
- Focus on {category}-specific aspects in reviews
- Get current pricing with URLs and availability
- Generate platform summary analyzing {category}-specific sentiment
- Return complete JSON - all 5 platforms required"""

    user_prompt = f"""Get current retail data for: {product_name}

This is a {category} product. Focus on gathering:
1. PRICING - Current prices across all retail platforms
2. RATINGS - Customer ratings and satisfaction scores
3. REVIEWS - Customer feedback highlighting {category}-specific aspects
4. AVAILABILITY - Stock status and promotions

Extract {category}-relevant information from customer reviews and ratings."""

    return _make_llm_call(system_prompt, user_prompt, max_tokens=16384)

def fetch_adaptive_summary_chunk(product_name: str, category: str, all_platform_data: Dict) -> Dict:
    """
    Generate comprehensive summary with category-specific analysis.
    """
    category_info = CATEGORY_SPECS.get(category, CATEGORY_SPECS["Makeup"])
    aspects = category_info["aspects"]
    specs = category_info["specs"]
    
    system_prompt = f"""You are a beauty product analyst specializing in {category_info['description']} products. Create comprehensive product analysis.

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no code blocks.

CATEGORY-SPECIFIC ANALYSIS for {category}:
- Relevant aspects to score: {', '.join(aspects)}
- Key specifications to extract: {', '.join(specs[:4])}
- Ignore aspects not applicable to {category} products

REQUIRED OUTPUT FORMAT - Return ONLY this JSON structure:
{{
  "product_identity": {{
    "name": "string",
    "brand": "string", 
    "category": "{category}",
    "subcategory": "string (if applicable)",
    "images": ["url1", "url2"]
  }},
  "specifications": {{
    "size": "string",
    "form": "string",
    "category_specific": {{
      // Add {category}-relevant specs like: {', '.join(specs[:3])}
    }},
    "key_ingredients": ["ingredient1", "ingredient2"],
    "performance_claims": ["claim1", "claim2"],
    "skin_type_suitability": ["type1", "type2"],
    "additional_attributes": {{
      // Any other relevant {category} specifications discovered
    }}
  }},
  "summarized_review": {{
    "verdict": "Comprehensive 2-3 sentence analysis of this {category} product",
    "pros": [
      // 1-7 genuine advantages based on actual findings
    ],
    "cons": [
      // 0-7 genuine disadvantages based on actual findings (empty array if none found)
    ],
    "best_for": ["who this {category} product works best for"],
    "avoid_if": ["who should avoid this product"],
    "usage_tips": ["helpful tips from user reviews"],
    "platform_consensus": {{
      "retail_consensus": "What retail customers consistently say about this {category}",
      "influencer_consensus": "What beauty influencers say (if available)",
      "expert_consensus": "What beauty experts conclude (if available)"
    }},
    "aspect_scores": {{
      "value_for_money": 0.0-1.0,
      "overall_satisfaction": 0.0-1.0,
      "category_aspects": {{
        // Score only relevant {category} aspects: {', '.join(aspects[:4])}
      }}
    }}
  }},
  "citations": {{
    "Source Name": "https://url.com"
  }},
  "data_completeness": {{
    "retail_data": 0.0-1.0,
    "specification_data": 0.0-1.0,
    "review_data": 0.0-1.0
  }}
}}

REQUIREMENTS:
- Analyze ALL provided platform data comprehensively
- Generate 1-7 pros/cons based on actual findings (not forced to exactly 3)
- Score only {category}-relevant aspects (ignore irrelevant ones)
- Extract {category}-specific specifications naturally found
- Provide honest assessment of data completeness
- Return complete JSON structure"""

    # Prepare condensed data for analysis
    data_summary = {
        "retail_platforms": len(all_platform_data.get("retail", {}).get("platforms", {})),
        "editorial_data": bool(all_platform_data.get("editorial", {}).get("platforms", {}).get("editorial")),
        "influencer_data": len(all_platform_data.get("influencer", {}).get("platforms", {})),
        "category": category,
        "sample_data": str(all_platform_data)[:3000] + "..."
    }

    user_prompt = f"""Analyze all collected data for {product_name} ({category}) and generate comprehensive, category-aware analysis.

PLATFORM DATA COLLECTED:
{json.dumps(data_summary, indent=2)}

FULL DATA FOR ANALYSIS:
{json.dumps(all_platform_data, indent=2)[:4000]}...

Generate {category}-specific analysis:
1. PRODUCT IDENTITY - name, brand, category, subcategory, image URLs
2. SPECIFICATIONS - focus on {category}-relevant technical details
3. COMPREHENSIVE REVIEW ANALYSIS:
   - Pros/cons based on actual findings (1-7 each, not forced to 3)
   - {category}-specific usage recommendations
   - Platform consensus tailored to {category}
4. ASPECT SCORES - Rate only {category}-relevant aspects:
   {', '.join(aspects)}
5. DATA QUALITY ASSESSMENT - Honest evaluation of data completeness

Return complete JSON with all analysis sections optimized for {category} products."""

    return _make_llm_call(system_prompt, user_prompt, max_tokens=16384)

def fetch_product_snapshot_adaptive(product_name: str, brand: str = "", description: str = "") -> Dict:
    """
    Main function to fetch complete product data using adaptive, category-aware approach.
    """
    logger.info(f"Starting adaptive product ingestion for: {product_name}")
    
    try:
        # Step 1: Detect product category
        category = detect_product_category(product_name, brand, description)
        logger.info(f"Detected category: {category}")
        
        # Step 2: Collect platform data with category awareness
        logger.info("Fetching retail platform data...")
        retail_data = fetch_adaptive_retail_chunk(product_name, category)
        
        logger.info("Fetching brand and editorial data...")
        editorial_data = fetch_brand_editorial_chunk(product_name)  # Reuse existing
        
        logger.info("Fetching influencer data...")
        influencer_data = fetch_influencer_chunk(product_name)  # Reuse existing
        
        # Step 3: Combine all platform data
        all_platform_data = {
            "retail": retail_data,
            "editorial": editorial_data,
            "influencer": influencer_data
        }
        
        # Step 4: Generate adaptive summary with category-specific analysis
        logger.info(f"Generating {category}-specific comprehensive analysis...")
        summary_data = fetch_adaptive_summary_chunk(product_name, category, all_platform_data)
        
        # Step 5: Merge all data into final snapshot
        final_snapshot = {
            **summary_data,
            "platforms": {
                **(retail_data.get("platforms", {})),
                **(editorial_data.get("platforms", {})),
                **(influencer_data.get("platforms", {}))
            },
            "adaptive_metadata": {
                "detected_category": category,
                "category_specs_used": CATEGORY_SPECS[category]["specs"],
                "category_aspects_used": CATEGORY_SPECS[category]["aspects"],
                "processing_approach": "adaptive_category_aware"
            }
        }
        
        logger.info(f"Adaptive ingestion completed successfully for {product_name} ({category})")
        return final_snapshot
        
    except Exception as e:
        logger.error(f"Adaptive ingestion failed for {product_name}: {str(e)}")
        raise

# Reuse existing helper functions
def fetch_brand_editorial_chunk(product_name: str) -> Dict:
    """Reuse existing brand editorial chunk function"""
    # Import from existing chunked_llama module
    from chunked_llama import fetch_brand_editorial_chunk as original_fetch
    return original_fetch(product_name)

def fetch_influencer_chunk(product_name: str) -> Dict:
    """Reuse existing influencer chunk function"""
    from chunked_llama import fetch_influencer_chunk as original_fetch
    return original_fetch(product_name)

def _make_llm_call(system_prompt: str, user_prompt: str, max_tokens: int = 16384) -> Dict:
    """
    Make a focused LLM call with comprehensive error handling
    """
    try:
        # Get API key
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable is required")

        # Create OpenAI client
        client = OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=api_key,
        )
        
        # Make API call
        response = client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=max_tokens,
            temperature=0.1,  # Low temperature for consistent output
            extra_headers={
                "HTTP-Referer": OPENROUTER_REFERER,
                "X-Title": OPENROUTER_TITLE,
            }
        )
        
        raw_output = response.choices[0].message.content
        
        # Log success
        logger.info(f"Adaptive LLM call successful", extra={
            "model": OPENROUTER_MODEL,
            "tokens_used": response.usage.total_tokens if response.usage else None,
            "max_tokens": max_tokens,
            "output_length": len(raw_output),
            "prompt_type": "adaptive_category_aware"
        })
        
        # Parse JSON response using existing repair utilities
        from json_repair import safe_json_parse
        parsed_data = safe_json_parse(raw_output, max_bytes=50000)
        
        if not parsed_data:
            # Log the raw output for debugging
            debug_file = f"/tmp/failed_adaptive_chunk_{max_tokens}.json"
            try:
                with open(debug_file, 'w') as f:
                    f.write(raw_output)
                logger.error(f"Raw LLM output saved to {debug_file}")
            except:
                pass
            
            raise ValueError(f"Failed to parse JSON response from adaptive LLM chunk")
        
        return parsed_data
        
    except Exception as e:
        logger.error(f"Adaptive LLM call failed: {str(e)}")
        raise

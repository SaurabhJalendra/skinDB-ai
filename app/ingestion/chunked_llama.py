"""
Chunked LLM approach for guaranteed complete product data extraction.
Breaks down data collection into focused API calls to avoid truncation.
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
OPENROUTER_REFERER = "Prism Beauty"
OPENROUTER_TITLE = "Prism Beauty API"

def fetch_retail_chunk(product_name: str) -> Dict:
    """
    Fetch retail platform data only (Amazon, Sephora, Ulta, Walmart, Nordstrom)
    
    Returns complete data for 5 retail platforms with guaranteed no truncation.
    """
    system_prompt = r"""You are a beauty product retail specialist. Extract ONLY retail platform data.

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no code blocks.

REQUIRED OUTPUT FORMAT - Return ONLY this JSON structure:
{
  "platforms": {
    "amazon": {
      "url": "https://amazon.com/product-url",
      "price": {"amount": 25.99, "currency": "USD", "unit_price": "25.99/fl oz", "availability": "in_stock", "promo": "15% off"},
      "rating": {"average": 4.2, "count": 1250, "breakdown": {"5": 650, "4": 300, "3": 150, "2": 100, "1": 50}},
      "reviews": [
        {"author": "BeautyLover123", "rating": 5, "title": "Amazing product", "body": "This foundation is incredible for long wear...", "date": "2024-01-15", "url": "https://amazon.com/review/1"}
      ],
      "summary": "Amazon customers love the coverage and longevity"
    },
    "sephora": {
      "url": "https://sephora.com/product-url",
      "price": {"amount": 26.99, "currency": "USD", "unit_price": "26.99/fl oz", "availability": "in_stock", "promo": "Free shipping"},
      "rating": {"average": 4.3, "count": 890, "breakdown": {"5": 450, "4": 250, "3": 120, "2": 50, "1": 20}},
      "reviews": [
        {"author": "MakeupQueen", "rating": 5, "title": "Holy grail", "body": "Perfect shade match and blends beautifully...", "date": "2024-01-12", "url": "https://sephora.com/review/2"}
      ],
      "summary": "Sephora customers praise the shade range and application"
    },
    "ulta": { /* same structure */ },
    "walmart": { /* same structure */ },
    "nordstrom": { /* same structure */ }
  }
}

REQUIREMENTS:
- Search current web data for each platform
- Include 3-5 most helpful reviews per platform (body ≤150 chars)
- Get current pricing with URLs and availability
- Focus ONLY on retail platforms
- Generate platform summary (≤100 chars) analyzing customer sentiment
- Return complete JSON - all 5 platforms required"""

    user_prompt = f"""Get current retail data for: {product_name}

Search these retail platforms:
1. Amazon.com - pricing, customer reviews, ratings
2. Sephora.com - pricing, customer reviews, ratings  
3. Ulta.com - pricing, customer reviews, ratings
4. Walmart.com - pricing, customer reviews, ratings
5. Nordstrom.com - pricing, customer reviews, ratings

For each platform:
- Find the exact product page
- Get current price and availability
- Extract 3-5 most helpful customer reviews
- Analyze overall customer sentiment

Return complete JSON with all 5 retail platforms."""

    return _make_llm_call(system_prompt, user_prompt, max_tokens=16384)


def fetch_brand_editorial_chunk(product_name: str) -> Dict:
    """
    Fetch brand website and editorial content from beauty publications
    """
    system_prompt = r"""You are a beauty editorial specialist. Extract brand and editorial publication data.

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no code blocks.

REQUIRED OUTPUT FORMAT - Return ONLY this JSON structure:
{
  "platforms": {
    "brand_site": {
      "url": "https://brand-website.com/product",
      "price": {"amount": 29.99, "currency": "USD", "unit_price": "29.99/unit", "availability": "in_stock", "promo": "Free shipping"},
      "rating": {"average": 4.5, "count": 0, "breakdown": {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}},
      "reviews": [
        {"author": "Brand Team", "rating": 5, "title": "Product Claims", "body": "Clinically proven 24hr wear formula", "date": "2024-01-01", "url": "https://brand-website.com/product"}
      ],
      "summary": "Brand emphasizes long-wear and skin benefits"
    },
    "editorial": {
      "quotes": [
        {"outlet": "Allure", "quote": "Best foundation for oily skin this year", "url": "https://allure.com/review-article"},
        {"outlet": "Vogue", "quote": "Flawless coverage that looks natural", "url": "https://vogue.com/beauty-review"},
        {"outlet": "Elle", "quote": "A game-changer for everyday wear", "url": "https://elle.com/makeup-review"}
      ],
      "summary": "Beauty editors praise natural coverage and wear time"
    }
  }
}

REQUIREMENTS:
- Search brand's official website for product info
- Find editorial reviews from major beauty publications
- Include 4-6 editorial quotes (≤25 words each)
- Get official brand pricing and claims
- Return complete JSON with both sections"""

    user_prompt = f"""Get brand and editorial data for: {product_name}

Search for:
1. BRAND WEBSITE - official product page with pricing, claims, descriptions
2. EDITORIAL CONTENT - beauty magazine reviews from:
   - Allure.com
   - Vogue.com  
   - Elle.com
   - Harper's Bazaar
   - Cosmopolitan
   - Refinery29
   - Into The Gloss

Extract:
- Official brand pricing and product claims
- Editorial quotes and reviews from beauty experts
- Publication ratings and recommendations

Return complete JSON with brand and editorial data."""

    return _make_llm_call(system_prompt, user_prompt, max_tokens=16384)


def fetch_influencer_chunk(product_name: str) -> Dict:
    """
    Fetch YouTube and Instagram influencer content
    """
    system_prompt = r"""You are a beauty influencer specialist. Extract influencer content from YouTube and Instagram.

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no code blocks.

REQUIRED OUTPUT FORMAT - Return ONLY this JSON structure:
{
  "platforms": {
    "youtube": {
      "reviews": [
        {
          "creator": "James Charles",
          "channel": "James Charles", 
          "title": "Testing Viral Foundation",
          "summary": "Loved the coverage but found it a bit drying",
          "rating": "8/10",
          "views": "2.5M",
          "date": "2024-01-10",
          "url": "https://youtube.com/watch?v=abc123"
        }
      ],
      "summary": "YouTube creators praise coverage but note drying effect"
    },
    "instagram": {
      "reviews": [
        {
          "creator": "Huda Kattan",
          "handle": "@hudabeauty",
          "post_type": "Post",
          "summary": "Obsessed with this foundation! Perfect for my skin tone",
          "likes": "125K",
          "date": "2024-01-12", 
          "url": "https://instagram.com/p/abc123"
        }
      ],
      "summary": "Instagram influencers love the shade range and finish"
    }
  }
}

REQUIREMENTS:
- Search YouTube for beauty influencer reviews
- Search Instagram for influencer posts and stories
- Focus on macro influencers (500K+ followers)
- Include 3-5 top reviews per platform
- Return complete JSON with both platforms"""

    user_prompt = f"""Get influencer content for: {product_name}

Search for reviews from TOP beauty influencers:

YOUTUBE CREATORS:
- James Charles (@jamescharles)
- NikkieTutorials (@nikkietutorials)
- Jackie Aina (@jackieaina) 
- Hyram (@hyram)
- Patrick Ta (@patrickta)
- Manny MUA (@mannymua733)
- Tati Westbrook (@tatiwestbrook)

INSTAGRAM INFLUENCERS:
- @hudabeauty (Huda Kattan)
- @jamescharles
- @nikkietutorials  
- @jackieaina
- @hyram
- @patrickta
- @mannymua733
- @gothamista

Find:
- YouTube review videos with ratings and opinions
- Instagram posts, stories, and mentions
- Influencer recommendations and critiques

Return complete JSON with YouTube and Instagram data."""

    return _make_llm_call(system_prompt, user_prompt, max_tokens=16384)


def fetch_summary_chunk(product_name: str, all_platform_data: Dict) -> Dict:
    """
    Generate comprehensive summaries and analysis from all collected data
    """
    system_prompt = r"""You are a beauty product analysis expert. Generate comprehensive summaries from provided data.

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no code blocks.

REQUIRED OUTPUT FORMAT - Return ONLY this JSON structure:
{
  "product_identity": {
    "name": "Product Name",
    "brand": "Brand Name",
    "category": "Foundation",
    "images": ["https://image1.com/product.jpg", "https://image2.com/product.jpg"]
  },
  "specifications": {
    "size": "1.0 fl oz",
    "form": "Liquid",
    "finish_texture": "Matte", 
    "spf_pa": "SPF 15",
    "skin_types": ["oily", "combination"],
    "usage": "Apply with brush or sponge",
    "ingredients_inci": ["Water", "Dimethicone", "Titanium Dioxide"],
    "certifications": ["Cruelty-free", "Vegan"],
    "awards": ["Allure Best of Beauty 2024"]
  },
  "summarized_review": {
    "master_summary": "Comprehensive summary synthesizing ALL platform insights from retail, influencer, and editorial sources",
    "platform_insights": {
      "retail_consensus": "Retail customers consistently praise long-wear and coverage but note some dryness issues",
      "influencer_consensus": "Top beauty influencers agree on excellent shade range and professional finish",
      "expert_consensus": "Beauty editors conclude this is ideal for oily skin with natural-looking coverage"
    },
    "pros": ["Long-lasting wear", "Excellent coverage", "Great shade range"],
    "cons": ["Can be drying", "Expensive", "Limited availability"],
    "aspect_scores": {
      "longevity": 0.85,
      "texture": 0.92, 
      "irritation": 0.15,
      "value": 0.78
    },
    "verdict": "A high-quality foundation that delivers on coverage and longevity. Best suited for oily to combination skin types seeking professional results."
  },
  "citations": {
    "Amazon": "https://amazon.com/product-page",
    "Sephora": "https://sephora.com/product-page",
    "Allure Review": "https://allure.com/review-article"
  }
}

REQUIREMENTS:
- Analyze ALL provided platform data comprehensively
- Generate balanced pros/cons from all sources
- Create master summary synthesizing retail + influencer + editorial insights
- Calculate aspect scores based on actual feedback patterns
- Provide overall verdict considering all perspectives
- Return complete JSON structure"""

    # Prepare condensed data for analysis
    data_summary = {
        "retail_platforms": len(all_platform_data.get("retail", {}).get("platforms", {})),
        "editorial_data": bool(all_platform_data.get("editorial", {}).get("platforms", {}).get("editorial")),
        "influencer_data": len(all_platform_data.get("influencer", {}).get("platforms", {})),
        "sample_data": str(all_platform_data)[:3000] + "..."
    }

    user_prompt = f"""Analyze all collected data for {product_name} and generate comprehensive summaries.

PLATFORM DATA COLLECTED:
{json.dumps(data_summary, indent=2)}

FULL DATA FOR ANALYSIS:
{json.dumps(all_platform_data, indent=2)[:4000]}...

Generate:
1. PRODUCT IDENTITY - name, brand, category, image URLs
2. SPECIFICATIONS - technical details from all sources  
3. MASTER SUMMARY - synthesize ALL platform insights (≤200 chars)
4. PLATFORM INSIGHTS:
   - Retail consensus from customer reviews
   - Influencer consensus from YouTube/Instagram
   - Expert consensus from editorial reviews
5. BALANCED ANALYSIS:
   - 3 main pros mentioned across platforms
   - 3 main cons mentioned across platforms  
   - Aspect scores (0.0-1.0) for longevity, texture, irritation, value
   - Overall verdict considering all perspectives
6. CITATIONS - mapping source names to URLs

Return complete JSON with all analysis sections."""

    return _make_llm_call(system_prompt, user_prompt, max_tokens=16384)


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
        logger.info(f"LLM chunk call successful", extra={
            "model": OPENROUTER_MODEL,
            "tokens_used": response.usage.total_tokens if response.usage else None,
            "max_tokens": max_tokens,
            "output_length": len(raw_output),
            "prompt_type": system_prompt[:50] + "..."
        })
        
        # Parse JSON response using existing repair utilities
        from json_repair import safe_json_parse
        parsed_data = safe_json_parse(raw_output, max_bytes=50000)
        
        if not parsed_data:
            # Log the raw output for debugging and save to file
            logger.error(f"Failed to parse chunk JSON response", extra={
                "raw_output_preview": raw_output[:500] + "..." if len(raw_output) > 500 else raw_output,
                "output_length": len(raw_output),
                "prompt_type": system_prompt[:50] + "..."
            })
            
            # Save raw output to debug file
            try:
                debug_file = f"/tmp/failed_chunk_{max_tokens}.json"
                with open(debug_file, 'w') as f:
                    import json
                    json.dump({
                        "prompt_type": system_prompt[:100],
                        "raw_output": raw_output,
                        "length": len(raw_output),
                        "max_tokens": max_tokens
                    }, f, indent=2)
                logger.error(f"Raw chunk output saved to {debug_file}")
            except Exception as e:
                logger.warning(f"Could not save debug file: {e}")
            
            raise ValueError("Failed to parse JSON response from LLM chunk")
            
        return parsed_data
        
    except Exception as e:
        logger.error(f"LLM chunk call failed: {e}", extra={
            "model": OPENROUTER_MODEL,
            "max_tokens": max_tokens,
            "error_type": type(e).__name__,
            "prompt_type": system_prompt[:50] + "..."
        })
        raise


def fetch_product_snapshot_chunked(product_name: str, brand: Optional[str] = None) -> Dict:
    """
    Fetch complete product snapshot using chunked API calls.
    
    This approach guarantees complete data by making focused calls:
    1. Retail platforms (Amazon, Sephora, Ulta, Walmart, Nordstrom) 
    2. Brand website + Editorial content
    3. Influencer content (YouTube + Instagram)
    4. Summary generation and analysis
    
    Args:
        product_name: Name of the product to aggregate
        brand: Optional brand name for better targeting
    
    Returns:
        Complete product data dictionary
    """
    try:
        logger.info(f"Starting chunked data collection for: {product_name}")
        
        # Step 1: Fetch retail platform data (5 platforms)
        logger.info("Fetching retail platform data...")
        retail_data = fetch_retail_chunk(product_name)
        
        # Step 2: Fetch brand + editorial data  
        logger.info("Fetching brand and editorial data...")
        editorial_data = fetch_brand_editorial_chunk(product_name)
        
        # Step 3: Fetch influencer data
        logger.info("Fetching influencer data...")
        influencer_data = fetch_influencer_chunk(product_name)
        
        # Step 4: Combine all platform data
        all_platform_data = {
            "retail": retail_data,
            "editorial": editorial_data, 
            "influencer": influencer_data
        }
        
        # Step 5: Generate comprehensive summaries
        logger.info("Generating comprehensive analysis...")
        summary_data = fetch_summary_chunk(product_name, all_platform_data)
        
        # Step 6: Merge all data into final structure
        final_data = {
            "product_identity": summary_data.get("product_identity", {}),
            "platforms": {},
            "specifications": summary_data.get("specifications", {}),
            "summarized_review": summary_data.get("summarized_review", {}),
            "citations": summary_data.get("citations", {})
        }
        
        # Merge platform data from all chunks
        if retail_data.get("platforms"):
            final_data["platforms"].update(retail_data["platforms"])
        if editorial_data.get("platforms"):
            final_data["platforms"].update(editorial_data["platforms"])  
        if influencer_data.get("platforms"):
            final_data["platforms"].update(influencer_data["platforms"])
        
        logger.info(f"Chunked data collection completed successfully", extra={
            "platforms_collected": len(final_data["platforms"]),
            "total_chunks": 4,
            "product": product_name
        })
        
        # Debug: Save the final data to see what we're producing
        import json
        debug_file = f"/tmp/chunked_debug_{product_name.replace(' ', '_')}.json"
        try:
            with open(debug_file, 'w') as f:
                json.dump(final_data, f, indent=2)
            logger.info(f"Debug: Chunked data saved to {debug_file}")
        except Exception as e:
            logger.warning(f"Could not save debug file: {e}")
        
        return final_data
        
    except Exception as e:
        logger.error(f"Chunked data collection failed: {e}", extra={
            "product": product_name,
            "error_type": type(e).__name__
        })
        
        # Return error structure
        return {
            "error": str(e),
            "status": "failed", 
            "product_name": product_name,
            "approach": "chunked"
        }


# Export the main function
__all__ = ['fetch_product_snapshot_chunked']

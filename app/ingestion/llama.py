"""
LlamaIndex integration with OpenRouter for beauty product data aggregation.
"""

import os
import json
import logging
from typing import Optional
from openai import OpenAI
from llama_index.llms.openai import OpenAI as LlamaOpenAI
from llama_index.core import Settings

# OpenRouter Configuration
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_MODEL = "openai/gpt-4o-mini-search-preview"

# SYSTEM_PROMPT with explicit JSON schema
SYSTEM_PROMPT = r"""You are a cautious, citation-first web aggregator for beauty products. Use web search/browsing to collect PUBLIC data from: Amazon, Sephora, Ulta, Walmart, Nordstrom, the official brand site. For review text only, use Reddit and YouTube. 

CRITICAL: Return ONLY one JSON object matching this EXACT schema:

{
  "product_identity": {
    "name": "string",
    "brand": "string", 
    "category": "string",
    "images": ["url1", "url2"]
  },
  "platforms": {
        "amazon": {
          "url": "string",
          "price": {"amount": number, "currency": "USD", "unit_price": "string", "availability": "string", "promo": "string"},
          "rating": {"average": number, "count": number, "breakdown": {"5": number, "4": number, "3": number, "2": number, "1": number}},
          "reviews": [{"author": "string", "rating": number, "title": "string", "body": "string ≤150 chars", "date": "string", "url": "string"}],
          "summary": "string ≤100 chars - Platform sentiment summary"
        },
    "sephora": { /* same structure as amazon */ },
    "ulta": { /* same structure as amazon */ },
    "walmart": { /* same structure as amazon */ },
    "nordstrom": { /* same structure as amazon */ },
                "brand_site": { /* same structure as amazon */ },
                "editorial": {
                  "quotes": [{"outlet": "string", "quote": "string ≤25 words", "url": "string"}]
                },
                "youtube": {
                  "reviews": [{"creator": "string", "channel": "string", "title": "string", "summary": "string ≤100 chars", "rating": "string", "views": "string", "date": "string", "url": "string"}],
                  "summary": "string ≤100 chars - YouTube consensus"
                },
                "instagram": {
                  "reviews": [{"creator": "string", "handle": "string", "post_type": "string", "summary": "string ≤100 chars", "likes": "string", "date": "string", "url": "string"}],
                  "summary": "string ≤100 chars - Instagram consensus"
                }
  },
  "specifications": {
    "size": "string",
    "form": "string", 
    "finish_texture": "string",
    "spf_pa": "string",
    "skin_types": ["string1", "string2"],
    "usage": "string",
    "ingredients_inci": ["ingredient1", "ingredient2"],
    "certifications": ["cert1", "cert2"],
    "awards": ["award1", "award2"]
  },
  "summarized_review": {
    "master_summary": "string ≤300 chars - Collective summary synthesizing ALL platform insights",
    "platform_insights": {
      "retail_consensus": "string ≤150 chars - What retail customers consistently say",
      "influencer_consensus": "string ≤150 chars - What top beauty influencers agree on",
      "expert_consensus": "string ≤150 chars - What beauty editors/publications conclude"
    },
    "pros": ["pro1", "pro2", "pro3"],
    "cons": ["con1", "con2", "con3"],
    "aspect_scores": {"longevity": 0.0-1.0, "texture": 0.0-1.0, "irritation": 0.0-1.0, "value": 0.0-1.0},
    "verdict": "2-3 line summary"
  },
  "citations": {
    "Source Name": "https://url.com"
  }
}

CRITICAL REQUIREMENTS:
- Search TOP 4 platforms: amazon, sephora, ulta, walmart (focus on complete data)
- Exact field names: "product_identity", "platforms" (not "product"/"retailers")
- Platform keys lowercase: "amazon", "sephora", "ulta", "walmart" (4 platforms for reliable completion)
- Include review "body" text (≤300 chars), editorial quotes (≤25 words)
- MANDATORY: Add "summary" field to each platform (≤150 chars) with AI analysis of that platform's sentiment
- MANDATORY: Include master_summary (≤300 chars) and platform_insights in summarized_review
- CRITICAL: Generate COMPLETE JSON - do not truncate or stop before closing brace
- Use nulls for missing data, keep all fields
- USD currency only, no invented data
- Return pure JSON only (no markdown blocks)"""

def build_user_prompt(product_name: str, brand: Optional[str] = None) -> str:
    """
    Build the user prompt template for product aggregation.
    
    Args:
        product_name: Name of the product to aggregate
        brand: Optional brand name
    
    Returns:
        Formatted user prompt string
    """
    brand_part = f" {brand}" if brand else ""
    brand_name = product_name.split()[0] if product_name else "brand"
    
    return f"""TASK: Search and aggregate live data for this beauty product.

PRODUCT: {product_name}{brand_part}
REGION: United States (USD pricing)

TOP 4 PLATFORMS TO SEARCH (for complete data):
- amazon.com (search: "{product_name}")
- sephora.com (search: "{product_name}")  
- ulta.com (search: "{product_name}")
- walmart.com (search: "{product_name}")

INFLUENCER SOURCES (dedicated reviews):
- YouTube: Search for reviews from TOP beauty creators like James Charles, NikkieTutorials, Jackie Aina, Hyram, Gothamista, Mixed Makeup, Tati Westbrook, Jeffree Star, Manny MUA, Patrick Ta
- Instagram: Search posts/stories from beauty influencers like @jamescharles, @nikkietutorials, @jackieaina, @hyram, @gothamista, @patrickta, @mannymua733

ADDITIONAL SOURCES (community reviews):  
- Reddit (r/SkincareAddiction, r/MakeupAddiction, r/BeautyBoxes)

EXTRACTION STEPS:
1. Search each RETAIL platform for the exact product:
   - Direct product page URL
   - Current price (amount, currency=USD, availability, any promos)
   - Customer ratings (average score, total count, star breakdown)
   - 3-4 recent review snippets (author, rating, title, body text ≤150 chars, date, URL)
   - PLATFORM SUMMARY: Platform sentiment summary (≤100 chars)

2. Search YOUTUBE for 2-3 TOP influencer reviews:
   - Creator, channel, title, opinion summary (≤100 chars), rating, views, date, URL
   - YOUTUBE SUMMARY: Brief consensus (≤100 chars)

3. Search INSTAGRAM for 2-3 TOP influencer posts:
   - Creator, handle, post type, opinion summary (≤100 chars), likes, date, URL
   - INSTAGRAM SUMMARY: Brief consensus (≤100 chars)

4. Product specifications (size, form, texture, SPF, skin types array, usage, ingredients array, certifications, awards)
5. Editorial quotes from beauty publications (outlet name, quote ≤25 words, source URL)
6. MULTI-LEVEL AI SUMMARIES:
   - MASTER SUMMARY: Synthesize ALL platform data into ≤300 char overview
   - PLATFORM INSIGHTS: 
     * retail_consensus: What retail customers consistently say (≤150 chars)
     * influencer_consensus: What top beauty influencers agree on (≤150 chars)  
     * expert_consensus: What beauty editors/publications conclude (≤150 chars)
   - Classic analysis: exactly 3 pros, 3 cons, aspect scores 0.0-1.0, verdict 2-3 sentences
7. Citations mapping all source names to URLs

CRITICAL OUTPUT FORMAT:
- Use EXACT schema field names: "product_identity", "platforms" (not "product", "retailers")
- Platform keys: "amazon", "sephora", "ulta", "walmart", "nordstrom", "brand_site", "editorial", "youtube", "instagram"
- Include TOP 4 platform sections: "amazon", "sephora", "ulta", "walmart"
- Return pure JSON only, no markdown blocks
- Use null for missing data, don't omit fields
- IMPORTANT: Generate the COMPLETE JSON structure with proper closing braces - do not truncate

EXAMPLE OUTPUT STRUCTURE:
{{
  "product_identity": {{...}},
  "platforms": {{
    "amazon": {{...}},
    "sephora": {{...}}, 
    "ulta": {{...}},
    "walmart": {{...}}
  }},
  "specifications": {{...}},
  "summarized_review": {{...}},
  "citations": {{...}}
}}"""

def get_openai_client() -> OpenAI:
    """
    Get OpenAI client configured for OpenRouter.
    
    Returns:
        OpenAI client instance
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable is required")
    
    # Get optional headers
    referer = os.getenv("OPENROUTER_REFERER", "Prism Beauty")
    title = os.getenv("OPENROUTER_TITLE", "Prism Beauty")
    
    headers = {
        "HTTP-Referer": referer,
        "X-Title": title
    }
    
    return OpenAI(
        base_url=OPENROUTER_BASE_URL,
        api_key=api_key,
        default_headers=headers
    )

def get_llama_llm() -> LlamaOpenAI:
    """
    Get LlamaIndex OpenAI LLM configured for OpenRouter.
    
    Returns:
        LlamaIndex OpenAI LLM instance
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable is required")
    
    # Get optional headers
    referer = os.getenv("OPENROUTER_REFERER", "Prism Beauty")
    title = os.getenv("OPENROUTER_TITLE", "Prism Beauty")
    
    # Configure LlamaIndex to use OpenRouter with explicit headers
    llm = LlamaOpenAI(
        model=OPENROUTER_MODEL,
        api_key=api_key,
        api_base=OPENROUTER_BASE_URL,
        default_headers={
            "HTTP-Referer": referer,
            "X-Title": title
        }
    )
    
    # Set as default LLM for LlamaIndex
    Settings.llm = llm
    
    return llm

def fetch_product_snapshot(product_name: str, brand: Optional[str] = None) -> str:
    """
    Fetch product snapshot using direct OpenAI client with OpenRouter.
    
    Args:
        product_name: Name of the product to aggregate
        brand: Optional brand name
    
    Returns:
        Raw JSON string response from the model
    """
    try:
        # Get API key
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable is required")
        
        # Create OpenAI client configured for OpenRouter
        client = OpenAI(
            api_key=api_key,
            base_url=OPENROUTER_BASE_URL
        )
        
        # Build the prompt
        user_prompt = build_user_prompt(product_name, brand)
        
        # Get optional headers for the request
        referer = os.getenv("OPENROUTER_REFERER", "Prism Beauty")
        title = os.getenv("OPENROUTER_TITLE", "Prism Beauty")
        
        # Make the API call with proper headers and increased token limit
        response = client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=16384,  # Set to 16,384 tokens as specified
            temperature=0.1,  # Low temperature for consistent structured output
            extra_headers={
                "HTTP-Referer": referer,
                "X-Title": title
            }
        )
        
        # Return the raw response text
        return response.choices[0].message.content
        
    except Exception as e:
        # Log the error and return a basic error response
        error_msg = f"Error fetching product snapshot: {str(e)}"
        logging.error(f"ERROR in fetch_product_snapshot: {error_msg}")
        
        # Return a basic error JSON structure
        return f'{{"error": "{error_msg}", "status": "failed"}}'

# Initialize LlamaIndex settings on module import
try:
    get_llama_llm()
    print("✅ LlamaIndex configured successfully with OpenRouter")
except Exception as e:
    print(f"⚠️  LlamaIndex configuration warning: {e}")
    print("   Some features may not work until OPENROUTER_API_KEY is set")

# Export functions for main.py
__all__ = ['fetch_product_snapshot', 'SYSTEM_PROMPT', 'build_user_prompt']

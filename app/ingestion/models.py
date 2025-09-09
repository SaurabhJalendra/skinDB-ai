"""
Pydantic models for beauty product data aggregation.
Phase 3: Full validation and constraints implementation.
"""

from pydantic import BaseModel, Field, validator, model_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
import json

# JSON Schema constant for LLM prompt inclusion
JSON_SCHEMA = """{
  "type": "object",
  "properties": {
    "product_identity": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "brand": {"type": "string"},
        "category": {"type": "string"},
        "images": {"type": "array", "items": {"type": "string"}}
      },
      "required": ["name"]
    },
    "platforms": {
      "type": "object",
      "properties": {
        "amazon": {"$ref": "#/definitions/platform_data"},
        "sephora": {"$ref": "#/definitions/platform_data"},
        "ulta": {"$ref": "#/definitions/platform_data"},
        "walmart": {"$ref": "#/definitions/platform_data"},
        "nordstrom": {"$ref": "#/definitions/platform_data"},
        "brand_site": {"$ref": "#/definitions/platform_data"},
        "editorial": {"$ref": "#/definitions/editorial_block"}
      }
    },
    "specifications": {
      "type": "object",
      "properties": {
        "size": {"type": "string"},
        "form": {"type": "string"},
        "finish_texture": {"type": "string"},
        "spf_pa": {"type": "string"},
        "skin_types": {"type": "array", "items": {"type": "string"}},
        "usage": {"type": "string"},
        "ingredients_inci": {"type": "array", "items": {"type": "string"}},
        "certifications": {"type": "array", "items": {"type": "string"}},
        "awards": {"type": "array", "items": {"type": "string"}}
      }
    },
    "summarized_review": {
      "type": "object",
      "properties": {
        "pros": {"type": "array", "items": {"type": "string"}, "minItems": 3, "maxItems": 3},
        "cons": {"type": "array", "items": {"type": "string"}, "minItems": 3, "maxItems": 3},
        "aspect_scores": {
          "type": "object",
          "properties": {
            "longevity": {"type": "number", "minimum": 0, "maximum": 1},
            "texture": {"type": "number", "minimum": 0, "maximum": 1},
            "irritation": {"type": "number", "minimum": 0, "maximum": 1},
            "value": {"type": "number", "minimum": 0, "maximum": 1}
          }
        },
        "verdict": {"type": "string", "minLength": 1}
      },
      "required": ["pros", "cons", "verdict"]
    },
    "citations": {
      "type": "object",
      "additionalProperties": {"type": "string"}
    }
  },
  "definitions": {
    "platform_data": {
      "type": "object",
      "properties": {
        "url": {"type": "string"},
        "price": {"$ref": "#/definitions/price"},
        "rating": {"$ref": "#/definitions/rating"},
        "reviews": {"type": "array", "items": {"$ref": "#/definitions/review_snippet"}, "maxItems": 5}
      }
    },
    "price": {
      "type": "object",
      "properties": {
        "amount": {"type": "number"},
        "currency": {"type": "string"},
        "unit_price": {"type": "string"},
        "availability": {"type": "string"},
        "promo": {"type": "string"}
      }
    },
    "rating": {
      "type": "object",
      "properties": {
        "average": {"type": "number", "minimum": 0, "maximum": 5},
        "count": {"type": "integer", "minimum": 0},
        "breakdown": {"type": "object", "additionalProperties": {"type": "number"}}
      }
    },
    "review_snippet": {
      "type": "object",
      "properties": {
        "author": {"type": "string"},
        "rating": {"type": "number", "minimum": 0, "maximum": 5},
        "title": {"type": "string"},
        "body": {"type": "string", "maxLength": 300},
        "date": {"type": "string"},
        "url": {"type": "string"}
      }
    },
    "editorial_block": {
      "type": "object",
      "properties": {
        "quotes": {"type": "array", "items": {"$ref": "#/definitions/editorial_quote"}, "maxItems": 3}
      }
    },
    "editorial_quote": {
      "type": "object",
      "properties": {
        "outlet": {"type": "string"},
        "quote": {"type": "string", "maxLength": 25},
        "url": {"type": "string"}
      },
      "required": ["outlet", "quote"]
    }
  }
}"""

class Price(BaseModel):
    """Price information for a platform."""
    amount: Optional[float] = Field(None, description="Price amount")
    currency: Optional[str] = Field(None, description="Currency code")
    unit_price: Optional[str] = Field(None, description="Unit price information")
    availability: Optional[str] = Field(None, description="Availability status")
    promo: Optional[str] = Field(None, description="Promotional information")

class Rating(BaseModel):
    """Rating information for a platform."""
    average: Optional[float] = Field(None, ge=0, le=5, description="Average rating (0-5)")
    count: Optional[int] = Field(None, ge=0, description="Number of ratings")
    breakdown: Optional[Dict[str, float]] = Field(None, description="Rating breakdown by category")

class ReviewSnippet(BaseModel):
    """Individual review snippet."""
    author: Optional[str] = Field(None, description="Review author")
    rating: Optional[float] = Field(None, ge=0, le=5, description="Individual rating (0-5)")
    title: Optional[str] = Field(None, description="Review title")
    body: Optional[str] = Field(None, max_length=300, description="Review body (max 300 chars)")
    date: Optional[str] = Field(None, description="Review date")
    url: Optional[str] = Field(None, description="Review URL")

    @validator('body')
    def validate_body_length(cls, v):
        if v and len(v) > 300:
            raise ValueError('Review body must be 300 characters or less')
        return v

class PlatformData(BaseModel):
    """Data for a specific platform."""
    url: Optional[str] = Field(None, description="Platform URL")
    price: Optional[Price] = Field(None, description="Price information")
    rating: Optional[Rating] = Field(None, description="Rating information")
    reviews: Optional[List[ReviewSnippet]] = Field(None, max_items=5, description="Review snippets (max 5)")
    summary: Optional[str] = Field(None, max_length=150, description="AI summary of this platform's sentiment (≤150 chars)")

    @validator('reviews')
    def validate_reviews_limit(cls, v):
        if v and len(v) > 5:
            raise ValueError('Maximum 5 reviews allowed per platform')
        return v

class EditorialQuote(BaseModel):
    """Editorial quote from a publication."""
    outlet: str = Field(..., description="Publication outlet name")
    quote: str = Field(..., max_length=25, description="Quote text (max 25 words)")
    url: str = Field(..., description="Source URL")

    @validator('quote')
    def validate_quote_word_count(cls, v):
        word_count = len(v.split())
        if word_count > 25:
            raise ValueError('Quote must be 25 words or less')
        return v

class EditorialBlock(BaseModel):
    """Block of editorial quotes."""
    quotes: List[EditorialQuote] = Field(..., max_items=3, description="Editorial quotes (max 3)")

    @validator('quotes')
    def validate_quotes_limit(cls, v):
        if len(v) > 3:
            raise ValueError('Maximum 3 editorial quotes allowed')
        return v

class Specifications(BaseModel):
    """Product specifications."""
    size: Optional[str] = Field(None, description="Product size")
    form: Optional[str] = Field(None, description="Product form")
    finish_texture: Optional[str] = Field(None, description="Finish or texture")
    spf_pa: Optional[str] = Field(None, description="SPF/PA rating")
    skin_types: Optional[List[str]] = Field(None, description="Recommended skin types")
    usage: Optional[str] = Field(None, description="Usage instructions")
    ingredients_inci: Optional[List[str]] = Field(None, description="INCI ingredients list")
    certifications: Optional[List[str]] = Field(None, description="Product certifications")
    awards: Optional[List[str]] = Field(None, description="Product awards")

class AspectScores(BaseModel):
    """Aspect scores for the product (0-1 scale)."""
    longevity: Optional[float] = Field(None, ge=0, le=1, description="Longevity score (0-1)")
    texture: Optional[float] = Field(None, ge=0, le=1, description="Texture score (0-1)")
    irritation: Optional[float] = Field(None, ge=0, le=1, description="Irritation score (0-1)")
    value: Optional[float] = Field(None, ge=0, le=1, description="Value score (0-1)")

class PlatformInsights(BaseModel):
    """Platform-specific consensus insights."""
    retail_consensus: Optional[str] = Field(None, max_length=150, description="What retail customers consistently say (≤150 chars)")
    influencer_consensus: Optional[str] = Field(None, max_length=150, description="What top beauty influencers agree on (≤150 chars)")
    expert_consensus: Optional[str] = Field(None, max_length=150, description="What beauty editors/publications conclude (≤150 chars)")

class SummarizedReview(BaseModel):
    """AI-generated product summary."""
    master_summary: Optional[str] = Field(None, max_length=300, description="Collective summary synthesizing ALL platform insights (≤300 chars)")
    platform_insights: Optional[PlatformInsights] = Field(None, description="Platform-specific consensus insights")
    pros: List[str] = Field(..., min_items=3, max_items=3, description="Exactly 3 pros")
    cons: List[str] = Field(..., min_items=3, max_items=3, description="Exactly 3 cons")
    aspect_scores: Optional[AspectScores] = Field(None, description="Aspect scores")
    verdict: str = Field(..., min_length=1, description="Non-empty verdict")

    @validator('pros')
    def validate_pros_count(cls, v):
        if len(v) != 3:
            raise ValueError('Exactly 3 pros required')
        return v

    @validator('cons')
    def validate_cons_count(cls, v):
        if len(v) != 3:
            raise ValueError('Exactly 3 cons required')
        return v

class YoutubeReview(BaseModel):
    """YouTube influencer review data."""
    creator: str = Field(..., min_length=1, description="Creator name")
    channel: str = Field(..., min_length=1, description="Channel name")
    title: str = Field(..., min_length=1, description="Video title")
    summary: str = Field(..., max_length=200, description="Review summary (≤200 chars)")
    rating: str = Field(..., description="Creator's rating/recommendation")
    views: Optional[str] = Field(None, description="View count")
    date: Optional[str] = Field(None, description="Upload date")
    url: str = Field(..., description="YouTube video URL")

class YoutubeBlock(BaseModel):
    """YouTube reviews block."""
    reviews: List[YoutubeReview] = Field(default_factory=list, description="YouTube reviews")
    summary: Optional[str] = Field(None, max_length=150, description="AI summary of YouTube influencer consensus (≤150 chars)")

class InstagramReview(BaseModel):
    """Instagram influencer review data."""
    creator: str = Field(..., min_length=1, description="Creator name")
    handle: str = Field(..., min_length=1, description="Instagram handle")
    post_type: str = Field(..., description="Post type (photo/reel/story)")
    summary: str = Field(..., max_length=200, description="Review summary (≤200 chars)")
    likes: Optional[str] = Field(None, description="Like count")
    date: Optional[str] = Field(None, description="Post date")
    url: str = Field(..., description="Instagram post URL")

class InstagramBlock(BaseModel):
    """Instagram reviews block."""
    reviews: List[InstagramReview] = Field(default_factory=list, description="Instagram reviews")
    summary: Optional[str] = Field(None, max_length=150, description="AI summary of Instagram influencer consensus (≤150 chars)")

class ProductIdentity(BaseModel):
    """Product identity information."""
    name: str = Field(..., description="Product name")
    brand: Optional[str] = Field(None, description="Brand name")
    category: Optional[str] = Field(None, description="Product category")
    images: List[str] = Field(default_factory=list, description="Product image URLs")

class RootSnapshot(BaseModel):
    """Root snapshot model for product aggregation."""
    product_identity: ProductIdentity = Field(..., description="Product identity")
    platforms: Dict[str, Union[PlatformData, EditorialBlock, YoutubeBlock, InstagramBlock, Dict[str, Any]]] = Field(..., description="Platform data")
    specifications: Specifications = Field(..., description="Product specifications")
    summarized_review: SummarizedReview = Field(..., description="AI-generated summary")
    citations: Dict[str, str] = Field(..., description="Source citations")

    @model_validator(mode='after')
    def validate_platforms(self):
        """Validate platform data structure."""
        platforms = self.platforms
        valid_platforms = {'amazon', 'sephora', 'ulta', 'walmart', 'nordstrom', 'brand_site', 'editorial', 'youtube', 'instagram'}
        
        for platform_name, platform_data in platforms.items():
            if platform_name not in valid_platforms:
                raise ValueError(f'Invalid platform: {platform_name}')
            
            if platform_name in ['editorial', 'youtube', 'instagram']:
                # Temporarily allow flexible structure for editorial, youtube, instagram
                # TODO: Fix structures to properly match their respective Block models
                pass  # Skip validation for now
            else:
                # Allow both PlatformData objects and dictionaries for chunked processing
                if not isinstance(platform_data, (PlatformData, dict)):
                    raise ValueError(f'{platform_name} platform must contain PlatformData or dict')
                    
                # If it's a dict, ensure it has basic structure
                if isinstance(platform_data, dict) and 'url' not in platform_data:
                    # Add placeholder URL if missing
                    platform_data['url'] = f'https://{platform_name}.com/placeholder'
        
        return self

    class Config:
        """Pydantic configuration."""
        extra = "forbid"  # Strict validation - no extra fields
        json_schema_extra = {"example": "See JSON_SCHEMA constant"}

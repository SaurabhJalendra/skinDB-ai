"""
JSON repair utilities for handling malformed LLM outputs.
Provides non-LLM "safe fix" attempts before rejecting invalid JSON.
"""

import json
import re
from typing import Dict, Optional


def _repair_truncated_json(json_str: str) -> Optional[str]:
    """
    Attempt to repair truncated JSON by finding the last complete platform 
    and properly closing the JSON structure.
    """
    try:
        # Find the last complete platform section
        platforms_end = json_str.rfind('"summary"')
        if platforms_end == -1:
            # No complete platform found
            return None
            
        # Find the end of the last complete summary
        summary_end = json_str.find('"', platforms_end + len('"summary": "'))
        if summary_end == -1:
            return None
            
        summary_end = json_str.find('"', summary_end + 1)  # Find closing quote
        if summary_end == -1:
            return None
            
        # Truncate at the end of the last complete platform
        truncated = json_str[:summary_end + 1]
        
        # Add proper closing braces
        # Close the platform object
        truncated += '\n    }'
        # Close the platforms object  
        truncated += '\n  }'
        # Add minimal required fields to make valid JSON
        truncated += ',\n  "specifications": {},'
        truncated += '\n  "summarized_review": {"pros": [], "cons": [], "verdict": "Partial data - processing incomplete"},'
        truncated += '\n  "citations": {}'
        # Close the root object
        truncated += '\n}'
        
        return truncated
        
    except Exception:
        return None


def try_repair_to_json(raw: str, max_bytes: int = 300000) -> Optional[Dict]:
    """
    Attempt to repair malformed JSON from LLM output.
    
    This is a non-LLM "safe fix" that applies common JSON repair patterns:
    1. Truncate to max_bytes
    2. Extract substring between first "{" and last "}"
    3. Remove control characters
    4. Remove trailing commas before } or ]
    5. Attempt json.loads()
    
    Args:
        raw: Raw string output from LLM
        max_bytes: Maximum bytes to process
        
    Returns:
        Parsed JSON dict if successful, None if repair failed
    """
    if not raw or not isinstance(raw, str):
        return None
    
    try:
        # Step 1: Truncate to max_bytes
        if len(raw.encode('utf-8')) > max_bytes:
            # Truncate by character count to avoid cutting UTF-8 sequences
            truncated = raw[:max_bytes]
            # Find last complete character
            while len(truncated.encode('utf-8')) > max_bytes:
                truncated = truncated[:-1]
            raw = truncated
        
        # Step 2: Extract substring between first "{" and last "}"
        first_brace = raw.find('{')
        last_brace = raw.rfind('}')
        
        if first_brace == -1:
            return None
            
        if last_brace == -1 or first_brace >= last_brace:
            # Handle truncated JSON - try to salvage partial data
            json_str = raw[first_brace:]
            json_str = _repair_truncated_json(json_str)
            if not json_str:
                return None
        else:
            json_str = raw[first_brace:last_brace + 1]
        
        # Step 3: Remove control characters (\x00-\x1F, \x7F)
        json_str = re.sub(r'[\x00-\x1F\x7F]', '', json_str)
        
        # Step 4: Remove trailing commas before } or ]
        # Pattern: comma followed by optional whitespace and closing brace/bracket
        json_str = re.sub(r',\s*([}\]])', r'\1', json_str)
        
        # Step 5: Attempt json.loads()
        return json.loads(json_str)
        
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError) as e:
        # Log the specific error for debugging
        import logging
        logger = logging.getLogger("json_repair")
        logger.debug(f"JSON repair failed: {e}", extra={
            "error_type": type(e).__name__,
            "error_message": str(e),
            "input_length": len(raw),
            "extracted_length": len(json_str) if 'json_str' in locals() else 0
        })
        return None


def validate_json_structure(data: Dict, required_keys: list = None) -> bool:
    """
    Validate that the JSON has the expected structure.
    
    Args:
        data: Parsed JSON data
        required_keys: List of required top-level keys
        
    Returns:
        True if structure is valid, False otherwise
    """
    if not isinstance(data, dict):
        return False
    
    if required_keys:
        for key in required_keys:
            if key not in data:
                return False
    
    return True


def extract_json_from_markdown(text: str) -> Optional[Dict]:
    """
    Extract JSON from markdown code blocks.
    
    Args:
        text: Text that may contain JSON in markdown code blocks
        
    Returns:
        Parsed JSON dict if found, None otherwise
    """
    if not text:
        return None
    
    # Look for JSON in markdown code blocks
    json_pattern = r'```(?:json)?\s*(\{.*?\})\s*```'
    matches = re.findall(json_pattern, text, re.DOTALL)
    
    for match in matches:
        try:
            return json.loads(match)
        except json.JSONDecodeError:
            continue
    
    # If no code blocks, try the repair function on the whole text
    return try_repair_to_json(text)


def safe_json_parse(raw: str, max_bytes: int = 300000) -> Optional[Dict]:
    """
    Safely parse JSON with multiple fallback strategies.
    
    Args:
        raw: Raw string to parse
        max_bytes: Maximum bytes to process
        
    Returns:
        Parsed JSON dict if successful, None otherwise
    """
    if not raw:
        return None
    
    # Strategy 1: Direct JSON parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    
    # Strategy 2: Extract from markdown
    result = extract_json_from_markdown(raw)
    if result:
        return result
    
    # Strategy 3: JSON repair
    result = try_repair_to_json(raw, max_bytes)
    if result:
        return result
    
    return None


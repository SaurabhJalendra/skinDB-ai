"""
Structured logging configuration for the Beauty Aggregator ingestion service.
Provides JSON-formatted logs for production and human-readable logs for development.
"""

import json
import logging
import logging.handlers
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional


class JSONFormatter(logging.Formatter):
    """Custom formatter that outputs structured JSON logs."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "ts": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "msg": record.getMessage(),
            "path": getattr(record, "path", ""),
            "method": getattr(record, "method", ""),
            "status": getattr(record, "status", ""),
            "dur_ms": getattr(record, "dur_ms", ""),
            "product_id": getattr(record, "product_id", ""),
            "logger": record.name,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_entry, ensure_ascii=False)


def configure_logging(level: str = "INFO", log_dir: str = "./logs") -> None:
    """
    Configure structured logging for the application.
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Directory to store log files
    """
    # Ensure log directory exists
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper()))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Console handler (human-readable for development)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, level.upper()))
    console_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # File handler (JSON format for production)
    file_handler = logging.handlers.TimedRotatingFileHandler(
        filename=log_path / "app.log",
        when="midnight",
        interval=1,
        backupCount=7,
        encoding="utf-8"
    )
    file_handler.setLevel(getattr(logging, level.upper()))
    file_handler.setFormatter(JSONFormatter())
    root_logger.addHandler(file_handler)
    
    # Configure specific loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    
    # Log configuration
    logger = logging.getLogger(__name__)
    logger.info("Logging configured", extra={
        "level": level,
        "log_dir": str(log_path.absolute()),
        "console_handler": True,
        "file_handler": True,
        "json_format": True
    })


def log_request(
    path: str,
    method: str,
    status_code: int,
    duration_ms: float,
    product_id: Optional[int] = None
) -> None:
    """
    Log HTTP request details in structured format.
    
    Args:
        path: Request path
        method: HTTP method
        status_code: Response status code
        duration_ms: Request duration in milliseconds
        product_id: Product ID if applicable
    """
    logger = logging.getLogger("request")
    level = logging.INFO if status_code < 400 else logging.WARNING
    
    logger.log(level, f"{method} {path} - {status_code}", extra={
        "path": path,
        "method": method,
        "status": status_code,
        "dur_ms": round(duration_ms, 2),
        "product_id": product_id
    })


def log_ingestion_start(product_id: int, product_name: str) -> None:
    """Log the start of product ingestion."""
    logger = logging.getLogger("ingestion")
    logger.info(f"Starting ingestion for product {product_id}: {product_name}", extra={
        "product_id": product_id,
        "action": "ingestion_start"
    })


def log_ingestion_success(product_id: int, duration_ms: float) -> None:
    """Log successful product ingestion."""
    logger = logging.getLogger("ingestion")
    logger.info(f"Ingestion completed for product {product_id}", extra={
        "product_id": product_id,
        "action": "ingestion_success",
        "dur_ms": round(duration_ms, 2)
    })


def log_ingestion_error(product_id: int, error: str, duration_ms: float) -> None:
    """Log product ingestion error."""
    logger = logging.getLogger("ingestion")
    logger.error(f"Ingestion failed for product {product_id}: {error}", extra={
        "product_id": product_id,
        "action": "ingestion_error",
        "error": error,
        "dur_ms": round(duration_ms, 2)
    })


def save_invalid_output(product_id: int, raw_output: str) -> None:
    """
    Save invalid LLM output to a file for debugging.
    
    Args:
        product_id: Product ID
        raw_output: Raw output from LLM
    """
    log_dir = Path(os.getenv("LOG_DIR", "./logs"))
    log_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = log_dir / f"invalid_{product_id}_{timestamp}.json"
    
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump({
                "product_id": product_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "raw_output": raw_output,
                "output_length": len(raw_output)
            }, f, indent=2, ensure_ascii=False)
        
        logger = logging.getLogger("invalid_output")
        logger.warning(f"Invalid LLM output saved to {filename}", extra={
            "product_id": product_id,
            "filename": str(filename),
            "output_length": len(raw_output)
        })
    except Exception as e:
        logger = logging.getLogger("invalid_output")
        logger.error(f"Failed to save invalid output: {e}", extra={
            "product_id": product_id,
            "error": str(e)
        })


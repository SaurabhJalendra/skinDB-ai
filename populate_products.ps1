# Prism - Automated Product Data Population Script
# This script populates all products with rich LLM-generated data

Write-Host "🎭 PRISM - AUTOMATED DATA POPULATION" -ForegroundColor Magenta
Write-Host "===========================================" -ForegroundColor Magenta
Write-Host ""

# Configuration
$API_BASE = "http://localhost:8000"
$METHOD = "chunked"  # Options: chunked, adaptive, quick
$TIMEOUT = 300  # 5 minutes per product

Write-Host "⚙️  Configuration:" -ForegroundColor Cyan
Write-Host "   API Base: $API_BASE" -ForegroundColor White
Write-Host "   Method: $METHOD ingestion" -ForegroundColor White
Write-Host "   Timeout: $TIMEOUT seconds per product" -ForegroundColor White
Write-Host ""

try {
    # Get all products
    Write-Host "📦 Fetching product list..." -ForegroundColor Cyan
    $response = Invoke-WebRequest -Uri "$API_BASE/products" -TimeoutSec 15
    $products = ($response.Content | ConvertFrom-Json)
    
    Write-Host "✅ Found $($products.Count) products to process" -ForegroundColor Green
    Write-Host ""
    
    # Process each product
    $successCount = 0
    $errorCount = 0
    $startTime = Get-Date
    
    for ($i = 0; $i -lt $products.Count; $i++) {
        $product = $products[$i]
        $current = $i + 1
        
        Write-Host "🎯 [$current/$($products.Count)] Processing: $($product.name)" -ForegroundColor Yellow
        Write-Host "   Category: $(if ($product.name -like '*Fragrance*' -or $product.name -like '*Parfum*') { 'Fragrance' } elseif ($product.name -like '*Lipstick*' -or $product.name -like '*Makeup*') { 'Makeup' } elseif ($product.name -like '*Serum*' -or $product.name -like '*Cream*' -or $product.name -like '*Water*') { 'Skincare' } elseif ($product.name -like '*Sponge*' -or $product.name -like '*Tool*') { 'Tools' } else { 'Beauty Product' })" -ForegroundColor Gray
        
        try {
            # Choose endpoint based on method
            $endpoint = switch ($METHOD) {
                "adaptive" { "$API_BASE/ingest-product-adaptive/$($product.id)" }
                "chunked" { "$API_BASE/ingest-product-chunked/$($product.id)" }
                "quick" { "$API_BASE/ingest/$($product.id)" }
                default { "$API_BASE/ingest-product-chunked/$($product.id)" }
            }
            
            $productStartTime = Get-Date
            $ingestResponse = Invoke-WebRequest -Uri $endpoint -Method POST -TimeoutSec $TIMEOUT
            $productDuration = (Get-Date) - $productStartTime
            
            Write-Host "   ✅ SUCCESS (took $([math]::Round($productDuration.TotalSeconds, 1))s)" -ForegroundColor Green
            $successCount++
            
        } catch {
            Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
        
        Write-Host ""
    }
    
    # Summary
    $totalDuration = (Get-Date) - $startTime
    Write-Host "🎉 POPULATION COMPLETE!" -ForegroundColor Magenta
    Write-Host "================================" -ForegroundColor Magenta
    Write-Host "✅ Successful: $successCount products" -ForegroundColor Green
    Write-Host "❌ Failed: $errorCount products" -ForegroundColor Red
    Write-Host "⏱️  Total Time: $([math]::Round($totalDuration.TotalMinutes, 1)) minutes" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌟 Your Prism platform now has rich data!" -ForegroundColor Green
    Write-Host "👉 Visit http://localhost:3000 to see the enhanced product cards" -ForegroundColor Cyan
    Write-Host "👉 Click any product to see comprehensive analysis" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Script Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Ensure Docker containers are running: docker-compose up -d" -ForegroundColor White
    Write-Host "   2. Check API is accessible: curl http://localhost:8000/products" -ForegroundColor White
    Write-Host "   3. Verify OpenRouter API key is configured in .env" -ForegroundColor White
}

Write-Host ""
Write-Host "📚 For manual processing, visit: http://localhost:3000/admin" -ForegroundColor Info

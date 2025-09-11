import { API_BASE } from './config';
import type { ProductListItem, ConsolidatedProductResponse } from './types';

// Base fetcher for SWR
export const fetcher = (url: string) => 
  fetch(url).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

// API functions
export async function getProducts(): Promise<ProductListItem[]> {
  const response = await fetch(`${API_BASE}/products`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function getProduct(id: string): Promise<ConsolidatedProductResponse> {
  const response = await fetch(`${API_BASE}/product/${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function ingestAll(): Promise<any> {
  const response = await fetch(`${API_BASE}/ingest-all`, { method: 'POST' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function ingestOne(id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/ingest/${id}`, { method: 'POST' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function ingestOneChunked(id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/ingest-product-chunked/${id}`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function ingestOneAdaptive(id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/ingest-product-adaptive/${id}`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function ingestOneParallel(id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/ingest-product-parallel/${id}`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function benchmarkParallel(id: string): Promise<any> {
  const response = await fetch(`${API_BASE}/benchmark-parallel/${id}`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
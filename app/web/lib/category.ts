/**
 * Category-aware utilities for frontend display
 * Mirrors backend adaptive LLM categories for consistent UX
 */

export type ProductCategory = 'Fragrance' | 'Makeup' | 'Skincare' | 'Tools' | 'Unknown';

export interface CategoryInfo {
  category: ProductCategory;
  specs: string[];
  aspects: string[];
  description: string;
  icon: string;
  color: string;
}

export const CATEGORY_INFO: Record<ProductCategory, CategoryInfo> = {
  Fragrance: {
    category: 'Fragrance',
    specs: ['fragrance_notes', 'concentration', 'longevity_hours', 'sillage_rating', 'season_suitability', 'occasion_suitability'],
    aspects: ['longevity', 'sillage', 'uniqueness', 'versatility', 'value_for_money'],
    description: 'perfume, cologne, or fragrance product',
    icon: '🌸',
    color: 'purple'
  },
  Makeup: {
    category: 'Makeup',
    specs: ['coverage_level', 'finish_type', 'shade_range', 'undertones', 'application_method', 'skin_type_suitability'],
    aspects: ['coverage', 'blendability', 'longevity', 'color_accuracy', 'ease_of_application', 'value_for_money'],
    description: 'makeup, cosmetics, color cosmetics, foundation, lipstick, mascara, blush, eyeshadow',
    icon: '💄',
    color: 'pink'
  },
  Skincare: {
    category: 'Skincare',
    specs: ['skin_concerns', 'active_ingredients', 'ph_level', 'texture_type', 'skin_type_suitability', 'usage_frequency'],
    aspects: ['effectiveness', 'gentleness', 'absorption', 'hydration', 'non_comedogenic', 'value_for_money'],
    description: 'skincare, serum, moisturizer, cleanser, toner, essence, cream, lotion, treatment',
    icon: '🧴',
    color: 'green'
  },
  Tools: {
    category: 'Tools',
    specs: ['material', 'bristle_type', 'handle_design', 'cleaning_ease', 'durability_rating', 'ergonomics'],
    aspects: ['durability', 'ease_of_use', 'effectiveness', 'ergonomics', 'cleaning_ease', 'value_for_money'],
    description: 'beauty tools, brushes, sponges, curlers, applicators, devices',
    icon: '🔧',
    color: 'gray'
  },
  Unknown: {
    category: 'Unknown',
    specs: [],
    aspects: ['longevity', 'texture', 'irritation', 'value'],
    description: 'unknown beauty product',
    icon: '❓',
    color: 'gray'
  }
};

/**
 * Detect product category from name and brand (mirrors backend logic)
 */
export function detectProductCategory(productName: string, brand: string = '', description: string = ''): ProductCategory {
  const text = `${productName} ${brand} ${description}`.toLowerCase();
  
  const scores: Record<ProductCategory, number> = {
    Fragrance: 0,
    Makeup: 0,
    Skincare: 0,
    Tools: 0,
    Unknown: 0
  };
  
  // Fragrance keywords
  const fragranceKeywords = ['parfum', 'fragrance', 'cologne', 'eau de', 'scent', 'perfume', 'edt', 'edp'];
  fragranceKeywords.forEach(keyword => {
    if (text.includes(keyword)) scores.Fragrance += 1;
  });
  
  // Makeup keywords
  const makeupKeywords = ['lipstick', 'mascara', 'foundation', 'blush', 'eyeshadow', 'concealer', 'bronzer', 'highlighter', 'lip', 'eye', 'face', 'powder', 'rouge', 'gloss', 'liner', 'color', 'matte', 'retro'];
  makeupKeywords.forEach(keyword => {
    if (text.includes(keyword)) scores.Makeup += 1;
  });
  
  // Skincare keywords
  const skincareKeywords = ['serum', 'cream', 'moisturizer', 'cleanser', 'toner', 'essence', 'repair', 'night', 'anti', 'hydrating', 'treatment', 'acid', 'vitamin', 'spf', 'sunscreen', 'micellar', 'water'];
  skincareKeywords.forEach(keyword => {
    if (text.includes(keyword)) scores.Skincare += 1;
  });
  
  // Tools keywords  
  const toolsKeywords = ['brush', 'sponge', 'curler', 'applicator', 'tool', 'blender', 'eyelash', 'beauty'];
  toolsKeywords.forEach(keyword => {
    if (text.includes(keyword)) scores.Tools += 1;
  });
  
  // Find highest scoring category
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'Unknown';
  
  const detected = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as ProductCategory;
  return detected || 'Unknown';
}

/**
 * Get category info for a product
 */
export function getCategoryInfo(productName: string, brand?: string, category?: string): CategoryInfo {
  // Use provided category first, then detect
  const detectedCategory = category || detectProductCategory(productName, brand || '');
  return CATEGORY_INFO[detectedCategory as ProductCategory] || CATEGORY_INFO.Unknown;
}

/**
 * Get category-specific spec priorities for display
 */
export function getCategorySpecPriorities(category: ProductCategory): string[] {
  return CATEGORY_INFO[category]?.specs || [];
}

/**
 * Get category-specific aspect priorities for scoring
 */
export function getCategoryAspectPriorities(category: ProductCategory): string[] {
  return CATEGORY_INFO[category]?.aspects || [];
}

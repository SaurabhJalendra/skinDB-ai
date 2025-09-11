/**
 * Retailer configuration with labels and color schemes.
 * Provides consistent branding and styling across the UI.
 */

export const RETAILERS = {
  amazon: {
    label: "Amazon",
    colorClass: "bg-orange-500 text-white",
    borderClass: "border-orange-200",
    textClass: "text-orange-700"
  },
  sephora: {
    label: "Sephora",
    colorClass: "bg-pink-500 text-white",
    borderClass: "border-pink-200",
    textClass: "text-pink-700"
  },
  ulta: {
    label: "Ulta",
    colorClass: "bg-purple-500 text-white",
    borderClass: "border-purple-200",
    textClass: "text-purple-700"
  },
  walmart: {
    label: "Walmart",
    colorClass: "bg-blue-500 text-white",
    borderClass: "border-blue-200",
    textClass: "text-blue-700"
  },
  nordstrom: {
    label: "Nordstrom",
    colorClass: "bg-gray-800 text-white",
    borderClass: "border-gray-200",
    textClass: "text-gray-700"
  },
  brand_site: {
    label: "Brand Site",
    colorClass: "bg-lilac text-white",
    borderClass: "border-lilac/20",
    textClass: "text-lilac"
  }
} as const;

export type RetailerKey = keyof typeof RETAILERS;

/**
 * Get the display label for a retailer key.
 */
export function retailerLabel(key: string): string {
  return RETAILERS[key as RetailerKey]?.label || key;
}

/**
 * Get the color class for a retailer key.
 */
export function retailerColor(key: string): string {
  return RETAILERS[key as RetailerKey]?.colorClass || "bg-gray-500 text-white";
}

/**
 * Get the border color class for a retailer key.
 */
export function retailerBorder(key: string): string {
  return RETAILERS[key as RetailerKey]?.borderClass || "border-gray-200";
}

/**
 * Get the text color class for a retailer key.
 */
export function retailerText(key: string): string {
  return RETAILERS[key as RetailerKey]?.textClass || "text-gray-700";
}

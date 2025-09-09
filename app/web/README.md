# Prism Beauty Frontend

Premium Next.js application with luxury beauty aesthetic, featuring AI-powered product insights and multi-platform data aggregation.

## 🎨 Design System

### Color Palette
- **Ivory** (#FFFDF8) - Primary background
- **Charcoal** (#232323) - Text and accents
- **Lilac** (#E9D7FE) - Highlights and interactive elements
- **Blush** (#FDE1E1) - Subtle accents and gradients

### Typography
- **Playfair Display** - Headlines and brand elements (serif)
- **Inter** - Body text and UI elements (sans-serif)

### Components
Built with shadcn/ui components:
- Cards, Tabs, Buttons, Badges
- Drawer, Dialog, Toast notifications
- Table, Skeleton loaders

## 🚀 Setup

### Prerequisites
- Node.js 18+
- pnpm (preferred) or npm

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
# Application available at http://localhost:3000
```

## 🏗️ Architecture

### Tech Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **SWR** for data fetching
- **Framer Motion** for animations
- **Lucide React** for icons

### Project Structure
```
app/web/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles & Tailwind
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── p/[slug]/          # Product detail pages
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── NavBar.tsx         # Navigation
│   ├── ProductCard.tsx    # Product grid cards
│   ├── ProductHeader.tsx  # Product page header
│   ├── SummaryTab.tsx     # AI summary display
│   ├── PricesTab.tsx      # Multi-platform pricing
│   ├── RatingsTab.tsx     # Aggregated ratings
│   ├── ReviewsTab.tsx     # Review snippets
│   ├── SpecsTab.tsx       # Product specifications
│   └── SourcesDrawer.tsx  # Data sources drawer
├── lib/                   # Utilities and configuration
│   ├── types.ts           # TypeScript type definitions
│   ├── config.ts          # App configuration
│   ├── fetcher.ts         # API helpers with SWR
│   ├── resolve.ts         # Data processing utilities
│   └── utils.ts           # General utilities
└── public/
    └── images/            # Product images (local storage)
```

## 🎭 Pages & Features

### Home Page (`/`)
- **Product Grid**: Responsive 2-4 column layout
- **Scroll Animations**: Fade-in effects with Framer Motion
- **Product Cards**: Image, brand, name, pricing, rating preview
- **Loading States**: Skeleton components during data fetch

### Product Detail (`/p/[slug]`)
- **Product Header**: Large image, brand, name, freshness indicator
- **Tabbed Interface**: Summary, Prices, Ratings, Reviews, Specs
- **AI Summary**: Pros/cons chips, animated aspect score bars
- **Multi-platform Data**: Pricing across retailers, aggregated ratings
- **Sources Drawer**: Citation management with copy functionality

### Admin Dashboard (`/admin`)
- **Product Management**: List view with ingestion controls
- **Batch Operations**: "Ingest All" for bulk processing
- **Individual Refresh**: Per-product data updates
- **Toast Notifications**: Success/error feedback
- **Real-time Updates**: SWR cache invalidation

## 🔄 Data Management

### SWR Configuration
```typescript
// Optimized for performance
{
  revalidateOnFocus: false,    // Prevent noisy refreshes
  revalidateOnReconnect: true, // Refresh on reconnection
  dedupingInterval: 60000,     // 1 minute deduping
  errorRetryCount: 3,          // Retry failed requests
  errorRetryInterval: 5000     // 5 second retry interval
}
```

### API Integration
- **Base URL**: `http://localhost:8000` (FastAPI backend)
- **Endpoints**: Products list, individual product, ingestion
- **Error Handling**: Graceful fallbacks with user feedback
- **Loading States**: Skeleton components and spinners

## ✨ Animations & Interactions

### Micro-interactions
- **Card Hover**: Lift effect with shadow transitions
- **Gradient Sheen**: Subtle animation on hover borders
- **Tab Transitions**: Smooth underline animations
- **Aspect Bars**: Spring physics for score visualization

### Accessibility
- **Keyboard Navigation**: Full tab support across interface
- **Focus Management**: Visible focus rings on all interactive elements
- **Screen Reader**: Proper ARIA labels and alt text
- **Color Contrast**: WCAG AA compliance for all text

## 🎯 Performance

### Optimizations
- **Next.js Image**: Automatic optimization and lazy loading
- **Code Splitting**: Dynamic imports for heavy components
- **Memoization**: React.useMemo for expensive calculations
- **SWR Caching**: Intelligent data caching and revalidation

### Core Web Vitals
- **LCP**: < 2.5s through image optimization
- **FID**: < 100ms with efficient event handlers
- **CLS**: < 0.1 with consistent layout design

## 🔧 Development

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript type checking
```

### Environment Variables
```bash
# API Configuration
API_BASE=http://localhost:8000
```

### TypeScript
Strict type checking enabled with:
- Type definitions for all API responses
- Component prop typing
- Utility function typing
- Error boundary typing

## 🧪 Testing

### Manual Testing Checklist
- [ ] Home page loads with product grid
- [ ] Product cards link to detail pages
- [ ] All tabs function on product pages
- [ ] Admin ingestion buttons work
- [ ] Toast notifications appear
- [ ] Mobile responsive design
- [ ] Keyboard navigation works
- [ ] Loading states display properly

### Browser Testing
- Chrome/Chromium (primary)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Android Chrome)

## 🎨 Styling Guidelines

### TailwindCSS Classes
- **Shadows**: `shadow-luxury` for premium depth
- **Buttons**: `beauty-button-primary`, `beauty-button-secondary`
- **Cards**: `beauty-card` for consistent styling
- **Animations**: `transition-all duration-200` for smooth interactions

### Custom CSS Variables
```css
:root {
  --color-ivory: #FFFDF8;
  --color-charcoal: #232323;
  --color-lilac: #E9D7FE;
  --color-blush: #FDE1E1;
}
```

## 🔍 Debugging

### Browser DevTools
- Check Network tab for API calls
- Monitor Console for errors
- Use React DevTools for component state
- Performance tab for Core Web Vitals

### Common Issues
- **CORS errors**: Ensure backend CORS is configured
- **404 errors**: Verify API endpoints are running
- **Type errors**: Check TypeScript strict mode compliance
- **Image 404s**: Ensure images exist in `/public/images/`


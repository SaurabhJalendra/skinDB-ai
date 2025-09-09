FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* package-lock.json* yarn.lock* ./

# Install dependencies based on lock file
RUN if [ -f pnpm-lock.yaml ]; then \
        npm i -g pnpm && pnpm i; \
    elif [ -f yarn.lock ]; then \
        yarn; \
    else \
        npm i; \
    fi

# Copy source code
COPY . .

# Build the application
RUN if [ -f pnpm-lock.yaml ]; then \
        pnpm build; \
    elif [ -f yarn.lock ]; then \
        yarn build; \
    else \
        npm run build; \
    fi

# Production stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["node", "server.js"]


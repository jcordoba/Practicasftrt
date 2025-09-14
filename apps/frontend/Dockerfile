# Production Dockerfile for Next.js app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline
COPY . .
# Add executable permissions to binaries
RUN find ./node_modules -type f -name "*.bin" -exec chmod +x {} \;
# Asegurar que next tiene permisos de ejecución
RUN chmod +x ./node_modules/.bin/next
# Dar permisos a todos los binarios en node_modules/.bin
RUN chmod -R +x ./node_modules/.bin/
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production --prefer-offline

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 80
CMD ["npx", "next", "start", "-p", "80"]
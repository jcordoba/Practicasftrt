# Production Dockerfile for Node.js backend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Copy source code
COPY . .

# Add executable permissions to binaries
RUN find ./node_modules -type f -name "*.bin" -exec chmod +x {} \;
RUN chmod +x ./node_modules/.bin/prisma
RUN chmod -R +x ./node_modules/.bin/

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript code
RUN npm install -g typescript
RUN chmod +x ./node_modules/.bin/tsc
RUN npm run build || npx tsc

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production --prefer-offline

# Copy built app from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/src/generated ./dist/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./.env

# Expose API port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
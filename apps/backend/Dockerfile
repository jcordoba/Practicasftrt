# Production Dockerfile for Node.js backend

FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY apps/backend/package.json apps/backend/package-lock.json ./
RUN npm ci

# Copy source code and configuration (incluye prisma con migraciones)
COPY apps/backend/src ./src
COPY apps/backend/prisma ./prisma
COPY apps/backend/tsconfig.json ./
COPY apps/backend/.env ./

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript code
RUN npx tsc --pretty

# ---------------------------

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY apps/backend/package.json apps/backend/package-lock.json ./
RUN npm ci --only=production

# Copy built app and generated Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./.env

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

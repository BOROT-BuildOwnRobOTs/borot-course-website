# syntax=docker/dockerfile:1

# 1) deps
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only files needed to install deps (cache friendly)
COPY package.json package-lock.json* ./

RUN npm ci

# 2) build
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
RUN npm run build

# 3) run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# For access from other devices / containers
ENV HOSTNAME=0.0.0.0

# Copy runtime files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "run", "start"]

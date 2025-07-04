# syntax=docker/dockerfile:1

# Base image with Node.js
FROM node:20-alpine AS base

# Install build dependencies
RUN apk --no-cache add git

# Set work directory
WORKDIR /app

# =====================
# Dependencies stage
# =====================
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# =====================
# Build stage
# =====================
FROM base AS builder

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies including dev dependencies
RUN npm ci

# Copy the source code
COPY . .

# Set build environment variables with defaults
ENV NUXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
ENV NUXT_PUBLIC_KEYCLOAK_REALM=betterGR
ENV NUXT_PUBLIC_KEYCLOAK_CLIENT_ID=web-app
ENV NUXT_PUBLIC_GRAPHQL_HOST=http://localhost:8080
ENV NUXT_BUILD=true
ENV NODE_ENV=production

# Build the Nuxt application
# The existing generated/graphql.ts file should be used
RUN npm run build

# =====================
# Production stage
# =====================
FROM node:20-alpine AS production

# Add security and utilities
RUN apk --no-cache add dumb-init

# Create app directory and user
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# Copy built application
COPY --from=builder --chown=nuxtjs:nodejs /app/.output /app/.output

# Switch to non-root user
USER nuxtjs

# Expose the server port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run the Nuxt application
CMD ["dumb-init", "node", ".output/server/index.mjs"]

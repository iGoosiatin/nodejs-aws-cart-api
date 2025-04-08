# Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build:webpack

##################
# Production stage
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Combine user creation and ownership change in the same layer
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    rm -rf /var/cache/apk/*

# Copy package files
COPY --chown=appuser:appgroup package.json ./

# Copy built application from builder stage
COPY --chown=appuser:appgroup --from=builder /app/dist ./dist

USER appuser

# Expose application port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start:prod"]

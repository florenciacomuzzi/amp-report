# Build stage for backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build the backend
RUN npm run build

# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy client package files
COPY client/package.json client/package-lock.json ./

# Install client dependencies
RUN npm install

# Copy client source code
COPY client ./

# Build the frontend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm install --only=production && \
    npm cache clean --force

# Copy built backend from builder stage
COPY --from=backend-builder /app/dist ./dist

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/client/build ./client/build

# Copy other necessary files
COPY .env.example ./

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
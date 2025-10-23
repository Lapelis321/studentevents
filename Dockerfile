# ========================================
# StudentEvents Backend v2.0 - NEW BACKEND
# CRITICAL: This uses backend-new/ ONLY
# Build Date: 2024-10-23
# ========================================
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from NEW backend
COPY backend-new/package*.json ./

# Install production dependencies
RUN npm ci --only=production --silent 2>&1 | grep -v "^npm" || true

# Copy NEW backend application files
COPY backend-new/ ./

# Verify we're using the new backend by checking for version endpoint
RUN grep -q "NEW-BACKEND" server.js || (echo "ERROR: Wrong backend!" && exit 1)

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV BACKEND_VERSION=2.0.0-NEW

# Start the NEW backend server
CMD ["node", "server.js"]


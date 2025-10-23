# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend-new package files
COPY backend-new/package*.json ./

# Install production dependencies only (suppress warnings)
RUN npm ci --only=production --silent 2>&1 | grep -v "^npm" || true

# Copy backend-new application files
COPY backend-new/ ./

# Expose port (Railway will override this with PORT env var)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]


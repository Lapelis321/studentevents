# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only (suppress warnings)
RUN npm ci --only=production --silent 2>&1 | grep -v "^npm" || true

# Copy backend application files
COPY backend/ ./

# Expose port (Railway will override this with PORT env var)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "railway-server.js"]


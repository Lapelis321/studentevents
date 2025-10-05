# Simple Dockerfile for Railway deployment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the production server
COPY production-server.js ./

# Expose port
EXPOSE 3001

# Start the production server
CMD ["node", "production-server.js"]
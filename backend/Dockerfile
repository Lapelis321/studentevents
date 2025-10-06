# Simple Dockerfile for Railway deployment
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the simple server
COPY simple-server.js ./

# Expose port
EXPOSE 3001

# Start the simple server
CMD ["node", "simple-server.js"]
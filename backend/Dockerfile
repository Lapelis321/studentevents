# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only (suppress warnings)
RUN npm ci --only=production --silent 2>&1 | grep -v "^npm" || true

# Copy ALL application files (including railway-server.js and any dependencies)
COPY . .

# Expose port (Railway will override this with PORT env var)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "railway-server.js"]


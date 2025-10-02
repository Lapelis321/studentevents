#!/bin/bash

# StudentEvents Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting StudentEvents Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    print_success "Requirements check passed"
}

# Install CLI tools
install_cli_tools() {
    print_status "Installing deployment CLI tools..."
    
    # Install Railway CLI
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Install Netlify CLI
    if ! command -v netlify &> /dev/null; then
        print_status "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    print_success "CLI tools installed"
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Build the project
    print_status "Building backend..."
    npm run build
    
    # Check if Railway is configured
    if [ ! -f "railway.toml" ] && [ ! -f ".railway" ]; then
        print_status "Initializing Railway project..."
        railway init
    fi
    
    # Deploy to Railway
    print_status "Deploying to Railway..."
    railway up
    
    cd ..
    print_success "Backend deployed successfully!"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to Netlify..."
    
    # Check if Netlify is configured
    if [ ! -f ".netlify/state.json" ]; then
        print_status "Initializing Netlify site..."
        netlify init
    fi
    
    # Deploy to Netlify
    print_status "Deploying to Netlify..."
    netlify deploy --prod --dir=.
    
    print_success "Frontend deployed successfully!"
}

# Update configuration
update_config() {
    print_status "Updating configuration..."
    
    # Get Railway backend URL
    cd backend
    BACKEND_URL=$(railway status --json | jq -r '.deployments[0].url' 2>/dev/null || echo "")
    cd ..
    
    if [ -n "$BACKEND_URL" ]; then
        print_status "Updating frontend config with backend URL: $BACKEND_URL"
        
        # Update config.js with the actual backend URL
        sed -i.bak "s|https://your-backend-domain.railway.app|$BACKEND_URL|g" scripts/config.js
        
        # Update netlify.toml
        sed -i.bak "s|https://your-backend-domain.railway.app|$BACKEND_URL|g" netlify.toml
        
        # Update vercel.json
        sed -i.bak "s|https://your-backend-domain.railway.app|$BACKEND_URL|g" vercel.json
        
        print_success "Configuration updated"
    else
        print_warning "Could not automatically detect backend URL. Please update manually."
    fi
}

# Main deployment function
main() {
    echo "🎯 StudentEvents Deployment Script"
    echo "=================================="
    
    # Check what to deploy
    DEPLOY_BACKEND=true
    DEPLOY_FRONTEND=true
    
    if [ "$1" = "backend" ]; then
        DEPLOY_FRONTEND=false
    elif [ "$1" = "frontend" ]; then
        DEPLOY_BACKEND=false
    fi
    
    check_requirements
    install_cli_tools
    
    if [ "$DEPLOY_BACKEND" = true ]; then
        deploy_backend
    fi
    
    if [ "$DEPLOY_FRONTEND" = true ]; then
        update_config
        deploy_frontend
    fi
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Set up your environment variables in Railway dashboard"
    echo "2. Configure your Supabase database"
    echo "3. Set up Stripe webhooks"
    echo "4. Test your deployed application"
    echo ""
    echo "📚 For detailed instructions, see DEPLOYMENT.md"
}

# Handle script arguments
case "$1" in
    "backend")
        main backend
        ;;
    "frontend")
        main frontend
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [backend|frontend|help]"
        echo ""
        echo "Options:"
        echo "  backend   Deploy only the backend"
        echo "  frontend  Deploy only the frontend"
        echo "  help      Show this help message"
        echo ""
        echo "If no option is provided, both backend and frontend will be deployed."
        ;;
    *)
        main
        ;;
esac

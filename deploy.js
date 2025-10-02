#!/usr/bin/env node

/**
 * StudentEvents Deployment Script (Node.js)
 * Cross-platform deployment automation
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Utility functions
const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`)
};

// Check if command exists
function commandExists(command) {
    try {
        execSync(`${command} --version`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

// Execute command with error handling
function executeCommand(command, options = {}) {
    try {
        log.info(`Executing: ${command}`);
        const result = execSync(command, { 
            stdio: 'inherit', 
            encoding: 'utf8',
            ...options 
        });
        return result;
    } catch (error) {
        log.error(`Command failed: ${command}`);
        throw error;
    }
}

// Check requirements
function checkRequirements() {
    log.info('Checking requirements...');
    
    if (!commandExists('node')) {
        log.error('Node.js is not installed. Please install Node.js 18+ from https://nodejs.org');
        process.exit(1);
    }
    
    if (!commandExists('npm')) {
        log.error('npm is not installed. Please install npm');
        process.exit(1);
    }
    
    log.success('Requirements check passed');
}

// Install CLI tools
async function installCLITools() {
    log.info('Installing deployment CLI tools...');
    
    // Install Railway CLI
    if (!commandExists('railway')) {
        log.info('Installing Railway CLI...');
        executeCommand('npm install -g @railway/cli');
    }
    
    // Install Netlify CLI
    if (!commandExists('netlify')) {
        log.info('Installing Netlify CLI...');
        executeCommand('npm install -g netlify-cli');
    }
    
    log.success('CLI tools installed');
}

// Deploy backend
async function deployBackend() {
    log.info('Deploying backend to Railway...');
    
    // Change to backend directory
    process.chdir('backend');
    
    try {
        // Install dependencies
        log.info('Installing backend dependencies...');
        executeCommand('npm install');
        
        // Build the project
        log.info('Building backend...');
        executeCommand('npm run build');
        
        // Check if Railway is configured
        if (!fs.existsSync('railway.toml') && !fs.existsSync('.railway')) {
            log.info('Initializing Railway project...');
            executeCommand('railway init');
        }
        
        // Deploy to Railway
        log.info('Deploying to Railway...');
        executeCommand('railway up');
        
        log.success('Backend deployed successfully!');
        
    } catch (error) {
        log.error('Backend deployment failed');
        throw error;
    } finally {
        // Change back to root directory
        process.chdir('..');
    }
}

// Deploy frontend
async function deployFrontend() {
    log.info('Deploying frontend to Netlify...');
    
    try {
        // Check if Netlify is configured
        if (!fs.existsSync('.netlify/state.json')) {
            log.info('Initializing Netlify site...');
            executeCommand('netlify init');
        }
        
        // Deploy to Netlify
        log.info('Deploying to Netlify...');
        executeCommand('netlify deploy --prod --dir=.');
        
        log.success('Frontend deployed successfully!');
        
    } catch (error) {
        log.error('Frontend deployment failed');
        throw error;
    }
}

// Update configuration with deployed URLs
async function updateConfig() {
    log.info('Updating configuration...');
    
    try {
        // Try to get Railway backend URL
        process.chdir('backend');
        
        let backendUrl = '';
        try {
            const status = execSync('railway status --json', { encoding: 'utf8' });
            const statusData = JSON.parse(status);
            if (statusData.deployments && statusData.deployments[0]) {
                backendUrl = statusData.deployments[0].url;
            }
        } catch (error) {
            log.warning('Could not automatically detect backend URL');
        }
        
        process.chdir('..');
        
        if (backendUrl) {
            log.info(`Updating frontend config with backend URL: ${backendUrl}`);
            
            // Update config.js
            const configPath = path.join('scripts', 'config.js');
            if (fs.existsSync(configPath)) {
                let configContent = fs.readFileSync(configPath, 'utf8');
                configContent = configContent.replace(
                    /https:\/\/your-backend-domain\.railway\.app/g,
                    backendUrl
                );
                fs.writeFileSync(configPath, configContent);
            }
            
            // Update netlify.toml
            const netlifyPath = 'netlify.toml';
            if (fs.existsSync(netlifyPath)) {
                let netlifyContent = fs.readFileSync(netlifyPath, 'utf8');
                netlifyContent = netlifyContent.replace(
                    /https:\/\/your-backend-domain\.railway\.app/g,
                    backendUrl
                );
                fs.writeFileSync(netlifyPath, netlifyContent);
            }
            
            log.success('Configuration updated');
        } else {
            log.warning('Could not automatically detect backend URL. Please update manually.');
        }
        
    } catch (error) {
        log.warning('Configuration update failed, but deployment can continue');
    }
}

// Main deployment function
async function main() {
    console.log('🎯 StudentEvents Deployment Script');
    console.log('==================================');
    
    const args = process.argv.slice(2);
    const deployBackendOnly = args.includes('backend');
    const deployFrontendOnly = args.includes('frontend');
    const showHelp = args.includes('help') || args.includes('-h') || args.includes('--help');
    
    if (showHelp) {
        console.log('Usage: node deploy.js [backend|frontend|help]');
        console.log('');
        console.log('Options:');
        console.log('  backend   Deploy only the backend');
        console.log('  frontend  Deploy only the frontend');
        console.log('  help      Show this help message');
        console.log('');
        console.log('If no option is provided, both backend and frontend will be deployed.');
        return;
    }
    
    try {
        checkRequirements();
        await installCLITools();
        
        if (!deployFrontendOnly) {
            await deployBackend();
        }
        
        if (!deployBackendOnly) {
            await updateConfig();
            await deployFrontend();
        }
        
        console.log('');
        log.success('🎉 Deployment completed successfully!');
        console.log('');
        console.log('📋 Next Steps:');
        console.log('1. Set up your environment variables in Railway dashboard');
        console.log('2. Configure your Supabase database using supabase-setup.sql');
        console.log('3. Set up Stripe webhooks');
        console.log('4. Test your deployed application');
        console.log('');
        console.log('📚 For detailed instructions, see DEPLOYMENT.md');
        
    } catch (error) {
        log.error('Deployment failed');
        console.error(error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, deployBackend, deployFrontend };

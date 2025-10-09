#!/usr/bin/env node

/**
 * Environment Setup Script
 * This script helps set up the development environment
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up StudentEvents development environment...\n');

// Check if .env file exists
const envPath = path.join(__dirname, 'backend', '.env');
const envExamplePath = path.join(__dirname, 'backend', 'env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');
    
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ .env file created successfully!');
        console.log('⚠️  Please update the values in backend/.env with your actual API keys');
    } else {
        console.log('❌ env.example file not found!');
        process.exit(1);
    }
} else {
    console.log('✅ .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'backend', 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing backend dependencies...');
    const { execSync } = require('child_process');
    try {
        execSync('npm install', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
        console.log('✅ Backend dependencies installed');
    } catch (error) {
        console.log('❌ Failed to install dependencies:', error.message);
    }
} else {
    console.log('✅ Backend dependencies already installed');
}

console.log('\n🎯 Next steps:');
console.log('1. Update backend/.env with your actual API keys');
console.log('2. Run: cd backend && npm start');
console.log('3. Run: python -m http.server 8000 (in project root)');
console.log('4. Visit: http://localhost:8000');

console.log('\n✅ Environment setup complete!');

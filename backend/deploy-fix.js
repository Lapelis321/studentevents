#!/usr/bin/env node

// Deployment fix script to ensure proper configuration
console.log('🔧 Checking deployment configuration...');

const fs = require('fs');
const path = require('path');

// Check if production-server.js exists
const serverFile = path.join(__dirname, 'production-server.js');
if (!fs.existsSync(serverFile)) {
    console.error('❌ production-server.js not found!');
    process.exit(1);
}

console.log('✅ production-server.js exists');

// Check package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
if (packageJson.main !== 'production-server.js') {
    console.error('❌ package.json main field is incorrect');
    process.exit(1);
}

if (packageJson.scripts.start !== 'node production-server.js') {
    console.error('❌ package.json start script is incorrect');
    process.exit(1);
}

console.log('✅ package.json configuration is correct');

// Check railway.json
const railwayJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'railway.json'), 'utf8'));
if (railwayJson.deploy.startCommand !== 'node production-server.js') {
    console.error('❌ railway.json startCommand is incorrect');
    process.exit(1);
}

console.log('✅ railway.json configuration is correct');

// Check nixpacks.toml
const nixpacksToml = fs.readFileSync(path.join(__dirname, 'nixpacks.toml'), 'utf8');
if (!nixpacksToml.includes('cmd = "node production-server.js"')) {
    console.error('❌ nixpacks.toml start command is incorrect');
    process.exit(1);
}

console.log('✅ nixpacks.toml configuration is correct');

// Check Procfile
const procfile = fs.readFileSync(path.join(__dirname, 'Procfile'), 'utf8');
if (!procfile.includes('web: node production-server.js')) {
    console.error('❌ Procfile is incorrect');
    process.exit(1);
}

console.log('✅ Procfile configuration is correct');

console.log('🎉 All deployment configurations are correct!');
console.log('📦 Ready for deployment');

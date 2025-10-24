// Generate correct bcrypt hash for admin password
const bcrypt = require('bcryptjs');

const password = 'admin123';
const saltRounds = 10;

console.log('🔐 Generating password hash for:', password);
console.log('');

// Generate new hash
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('❌ Error generating hash:', err);
    return;
  }
  
  console.log('✅ Generated Hash:');
  console.log(hash);
  console.log('');
  console.log('📋 Copy this SQL and run in Supabase:');
  console.log('');
  console.log(`UPDATE admin SET password_hash = '${hash}' WHERE email = 'admin@afterstate.events';`);
  console.log('');
  console.log('Then try logging in with:');
  console.log('Email: admin@afterstate.events');
  console.log('Password: admin123');
});

// Also test if the existing hash works
const existingHash = '$2a$10$8K1p/a0dL3LclLe7FP8yCu8kDECxzKzLd1Hm0P7EcKFJq.0F3Z0KO';
bcrypt.compare(password, existingHash, (err, result) => {
  console.log('');
  console.log('🔍 Testing existing hash from seed file:');
  console.log('Existing hash:', existingHash);
  console.log('Password matches:', result ? '✅ YES' : '❌ NO');
  
  if (!result) {
    console.log('');
    console.log('⚠️  WARNING: The hash in seed.sql does NOT match "admin123"!');
    console.log('This explains why login is failing.');
  }
});


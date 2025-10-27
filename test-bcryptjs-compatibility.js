// Test bcryptjs compatibility with $2a vs $2b hash formats
const bcryptjs = require('bcryptjs');

const password = 'admin123';

console.log('🧪 Testing bcryptjs Hash Format Compatibility\n');

// Test 1: Generate hash using bcryptjs (will be $2a format)
console.log('TEST 1: Generate hash with bcryptjs.hashSync()');
const hash2a = bcryptjs.hashSync(password, 10);
console.log('Generated hash:', hash2a);
console.log('Format:', hash2a.substring(0, 4));
console.log('');

// Test 2: Verify our $2b hash works with bcryptjs
console.log('TEST 2: Test $2b hash (from my generator script)');
const hash2b = '$2b$10$GgP51trRlA/e52x9EA9ZnOXEnBrCWQk7LiIXBdAyA9yP68ZogqW3u';
const result2b = bcryptjs.compareSync(password, hash2b);
console.log('Hash:', hash2b);
console.log('Format:', hash2b.substring(0, 4));
console.log('compareSync result:', result2b ? '✅ SUCCESS' : '❌ FAILED');
console.log('');

// Test 3: Verify old $2a hash (from seed.sql)
console.log('TEST 3: Test $2a hash (from seed.sql)');
const hash2a_old = '$2a$10$8K1p/a0dL3LclLe7FP8yCu8kDECxzKzLd1Hm0P7EcKFJq.0F3Z0KO';
const result2a_old = bcryptjs.compareSync(password, hash2a_old);
console.log('Hash:', hash2a_old);
console.log('Format:', hash2a_old.substring(0, 4));
console.log('compareSync result:', result2a_old ? '✅ SUCCESS' : '❌ FAILED');
console.log('');

// Test 4: Generate fresh hash and verify it
console.log('TEST 4: Fresh hash generation and verification');
const freshHash = bcryptjs.hashSync(password, 10);
const freshResult = bcryptjs.compareSync(password, freshHash);
console.log('Fresh hash:', freshHash);
console.log('Fresh verification:', freshResult ? '✅ SUCCESS' : '❌ FAILED');
console.log('');

// Summary
console.log('=' .repeat(60));
console.log('SUMMARY:');
console.log('=' .repeat(60));
console.log('$2a hash from seed.sql works:', result2a_old ? '✅' : '❌');
console.log('$2b hash from generator works:', result2b ? '✅' : '❌');
console.log('Fresh bcryptjs hash works:', freshResult ? '✅' : '❌');
console.log('');

if (!result2a_old && !result2b) {
  console.log('❌ CRITICAL: NEITHER hash works! Problem is NOT the hash.');
  console.log('   Check: Password, bcryptjs version, or other issues.');
} else if (result2b && !result2a_old) {
  console.log('✅ SOLUTION: Use $2b hash from generator.');
  console.log(`   UPDATE SQL: UPDATE admin SET password_hash = '${hash2b}' WHERE email = 'admin@afterstate.events';`);
} else if (!result2b && result2a_old) {
  console.log('⚠️  WARNING: bcryptjs doesn\'t support $2b format!');
  console.log('   Use freshly generated $2a hash instead:');
  console.log(`   UPDATE SQL: UPDATE admin SET password_hash = '${freshHash}' WHERE email = 'admin@afterstate.events';`);
} else {
  console.log('✅ Both formats work. Problem is likely:');
  console.log('   1. SQL UPDATE was never run in database');
  console.log('   2. Multiple admin accounts exist');
  console.log('   3. User typing wrong password');
}


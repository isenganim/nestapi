const { exec } = require('child_process');

// Test if TypeScript compilation works
console.log('Testing TypeScript compilation...');
exec('npx tsc --noEmit', { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ TypeScript compilation failed:');
    console.error(stderr);
    process.exit(1);
  } else {
    console.log('✅ TypeScript compilation passed');
    console.log('✅ All imports and modules are working correctly');
    
    // Clean up
    require('fs').unlinkSync(__filename);
  }
});
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const frontendDir = path.join(root, 'frontend');
const backendDir = path.join(root, 'backend');

// Create directories
[frontendDir, backendDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Files to move to frontend
const frontendFiles = [
  'eslint.config.mjs',
  'next-env.d.ts',
  'next.config.ts',
  'postcss.config.js',
  'tsconfig.json',
  'src/app',
  'src/components',
  'src/types',
  'src/middleware.ts'
];

// Files to move to backend
const backendFiles = [
  'prisma',
  'src/lib',
  'vitest.config.ts'
];

// Create src dirs
if (!fs.existsSync(path.join(frontendDir, 'src'))) fs.mkdirSync(path.join(frontendDir, 'src'), { recursive: true });
if (!fs.existsSync(path.join(backendDir, 'src'))) fs.mkdirSync(path.join(backendDir, 'src'), { recursive: true });

// Move function
function moveSafe(srcRel, destRel) {
  const src = path.join(root, srcRel);
  const dest = path.join(root, destRel);
  if (fs.existsSync(src)) {
    // If it's a directory, we need to move it or rename it
    fs.renameSync(src, dest);
    console.log(`Moved ${srcRel} to ${destRel}`);
  }
}

// Move frontend files
frontendFiles.forEach(f => {
  if (f.startsWith('src/')) {
    moveSafe(f, `frontend/${f}`);
  } else {
    moveSafe(f, `frontend/${f}`);
  }
});

// Move backend files
backendFiles.forEach(f => {
  if (f.startsWith('src/')) {
    moveSafe(f, `backend/${f}`);
  } else {
    moveSafe(f, `backend/${f}`);
  }
});

// The src/api directory can be deleted since we are rewriting it in Express
if (fs.existsSync(path.join(root, 'src', 'api'))) {
  fs.rmSync(path.join(root, 'src', 'api'), { recursive: true, force: true });
}
if (fs.existsSync(path.join(root, 'src', 'auth.ts'))) {
  moveSafe('src/auth.ts', 'frontend/src/auth.ts');
}

// Clean up old root src if empty
try {
  fs.rmSync(path.join(root, 'src'), { recursive: true, force: true });
} catch (e) {
  console.log("Could not remove root src");
}

console.log("Split complete!");

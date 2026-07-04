const fs = require('fs');
const path = require('path');

const root = __dirname;
const frontendDir = path.join(root, 'frontend');
const backendDir = path.join(root, 'backend');

function moveSafe(srcRel, destRel) {
  const src = path.join(root, srcRel);
  const dest = path.join(root, destRel);
  if (fs.existsSync(src)) {
    // ensure dest dir exists
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.renameSync(src, dest);
    console.log(`Restored ${destRel}`);
  }
}

// Restore frontend files
moveSafe('frontend/eslint.config.mjs', 'eslint.config.mjs');
moveSafe('frontend/next-env.d.ts', 'next-env.d.ts');
moveSafe('frontend/next.config.ts', 'next.config.ts');
moveSafe('frontend/postcss.config.js', 'postcss.config.js');
moveSafe('frontend/tsconfig.json', 'tsconfig.json');
moveSafe('frontend/src/app', 'src/app');
moveSafe('frontend/src/components', 'src/components');
moveSafe('frontend/src/types', 'src/types');
moveSafe('frontend/src/middleware.ts', 'src/middleware.ts');
moveSafe('frontend/src/auth.ts', 'src/auth.ts');

// Restore backend files
moveSafe('backend/prisma', 'prisma');
moveSafe('backend/src/lib', 'src/lib');
moveSafe('backend/vitest.config.ts', 'vitest.config.ts');

// Cleanup
fs.rmSync(frontendDir, { recursive: true, force: true });
fs.rmSync(backendDir, { recursive: true, force: true });

console.log("Restoration complete!");

@echo off
cd /d e:\Projects\SplitWise
call npm install
call npx prisma generate
call npx prisma db push
call npx tsx prisma/seed.ts
echo.
echo === Setup complete! ===
echo Run "npm run dev" to start the app.

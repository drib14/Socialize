@echo off
echo ==============================================
echo Socialize Modernization - Phase 1 Setup
echo ==============================================
echo.
echo [1/3] Removing old log files and reportWebVitals...
git rm backend.log client/frontend.log 2>nul
del /q /f scratch_test_cloudinary.js 2>nul
del /q /f client\src\reportWebVitals.js 2>nul
echo Done.
echo.
echo [2/3] Installing client dependencies (Vite, DayJS)...
cd client
call npm install
echo Done.
echo.
echo [3/3] Phase 1 setup completed successfully!
echo You can now run "npm run dev" from the root directory to test the Vite dev server.
echo ==============================================
pause

@echo off
echo ========================================
echo MONSpark Setup Script
echo ========================================
echo.

echo [1/4] Installing contract dependencies...
cd contracts
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install contract dependencies
    exit /b 1
)
echo ✅ Contract dependencies installed
echo.

echo [2/4] Installing backend dependencies...
cd ..\backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    exit /b 1
)

if not exist .env (
    echo Creating backend .env file...
    copy .env.example .env
)
echo ✅ Backend dependencies installed
echo.

echo [3/4] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    exit /b 1
)

if not exist .env (
    echo Creating frontend .env file...
    copy .env.example .env
)
echo ✅ Frontend dependencies installed
echo.

echo [4/4] Compiling contracts...
cd ..\contracts
call npx hardhat compile
if %errorlevel% neq 0 (
    echo ERROR: Failed to compile contracts
    exit /b 1
)
echo ✅ Contracts compiled
echo.

echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Open Terminal 1: cd contracts ^&^& npx hardhat node
echo 2. Open Terminal 2: cd contracts ^&^& npx hardhat run scripts/deploy.ts --network localhost
echo 3. Open Terminal 3: cd backend ^&^& npm run dev
echo 4. Open Terminal 4: cd frontend ^&^& npm run dev
echo.
echo Then open http://localhost:8080 in your browser
echo.
pause

#!/bin/bash

echo "========================================"
echo "MONSpark Setup Script"
echo "========================================"
echo ""

echo "[1/4] Installing contract dependencies..."
cd contracts
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install contract dependencies"
    exit 1
fi
echo "✅ Contract dependencies installed"
echo ""

echo "[2/4] Installing backend dependencies..."
cd ../backend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi

if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
fi
echo "✅ Backend dependencies installed"
echo ""

echo "[3/4] Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi

if [ ! -f .env ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
fi
echo "✅ Frontend dependencies installed"
echo ""

echo "[4/4] Compiling contracts..."
cd ../contracts
npx hardhat compile
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to compile contracts"
    exit 1
fi
echo "✅ Contracts compiled"
echo ""

echo "========================================"
echo "✅ Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Open Terminal 1: cd contracts && npx hardhat node"
echo "2. Open Terminal 2: cd contracts && npx hardhat run scripts/deploy.ts --network localhost"
echo "3. Open Terminal 3: cd backend && npm run dev"
echo "4. Open Terminal 4: cd frontend && npm run dev"
echo ""
echo "Then open http://localhost:8080 in your browser"
echo ""

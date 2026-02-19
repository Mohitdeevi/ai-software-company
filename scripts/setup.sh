#!/bin/bash
set -e

echo "🚀 PromptCorp OS - Local Development Setup"
echo "============================================"

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required. Install from https://docker.com"; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required. Current: $(node -v)"
  exit 1
fi

echo "✅ Prerequisites check passed"

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  Created .env from .env.example"
fi
npm install
echo "✅ Backend dependencies installed"

# Setup frontend
echo ""
echo "📦 Setting up frontend..."
cd ../frontend
if [ ! -f .env.local ]; then
  cp .env.local.example .env.local
  echo "  Created .env.local from .env.local.example"
fi
npm install
echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "============================================"
echo "✅ Setup complete!"
echo ""
echo "To start with Docker Compose:"
echo "  docker compose up -d"
echo ""
echo "To start individually:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Prerequisites: MongoDB on :27017, Redis on :6379"
echo "============================================"

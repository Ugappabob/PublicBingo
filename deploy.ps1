# PowerShell deployment script

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Run linting
Write-Host "🔍 Running linting..." -ForegroundColor Cyan
npm run lint

# Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Cyan
npm test

# Build for production
Write-Host "🏗️ Building for production..." -ForegroundColor Cyan
npm run build:prod

# Deploy to Firebase
Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Cyan
firebase deploy

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green 
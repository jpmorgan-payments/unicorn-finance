#!/bin/bash

# Build script for AWS Lambda Layer and Function
echo "🚀 Building Lambda Layer and Function for Unicorn Finance"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf lambda-layer
rm -rf lambda-function
rm -f dependencies-layer.zip
rm -f function.zip

# Create layer directory structure
echo "📦 Creating Lambda Layer..."
mkdir -p lambda-layer/nodejs
cp ../package-layer.json lambda-layer/nodejs/package.json

# Install production dependencies in layer
cd lambda-layer/nodejs
echo "📥 Installing dependencies for layer..."
npm install --production --no-optional

# Remove unnecessary files to reduce size
echo "🗑️  Removing unnecessary files..."
find node_modules -name "*.md" -type f -delete
find node_modules -name "*.txt" -type f -delete
find node_modules -name "*.yml" -type f -delete
find node_modules -name "*.yaml" -type f -delete
find node_modules -name "CHANGELOG*" -type f -delete
find node_modules -name "LICENSE*" -type f -delete
find node_modules -name "README*" -type f -delete
find node_modules -name "*.d.ts" -type f -delete
find node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "*.test.js" -type f -delete
find node_modules -name "*.spec.js" -type f -delete

cd ../..

# Create layer zip
echo "🗜️  Creating layer zip..."
cd lambda-layer
zip -r ../dependencies-layer.zip . -q
cd ..

# Check layer size
LAYER_SIZE=$(du -sh dependencies-layer.zip | cut -f1)
echo "📏 Layer size: $LAYER_SIZE"

# Create function directory
echo "📦 Creating Lambda Function..."
mkdir -p lambda-function

# Copy function files (excluding node_modules and dev files)
cp ../index.js lambda-function/
cp ../app.js lambda-function/
cp ../digitalSignature.js lambda-function/
cp ../grabSecret.js lambda-function/
cp ../package-lambda.json lambda-function/package.json

# Create function zip
echo "🗜️  Creating function zip..."
cd lambda-function
zip -r ../function.zip . -q
cd ..

# Check function size
FUNCTION_SIZE=$(du -sh function.zip | cut -f1)
echo "📏 Function size: $FUNCTION_SIZE"

echo "✅ Build complete!"
echo "   📦 Layer: dependencies-layer.zip ($LAYER_SIZE)"
echo "   🚀 Function: function.zip ($FUNCTION_SIZE)"
echo ""
echo "Next steps:"
echo "1. Deploy layer: aws lambda publish-layer-version --layer-name unicorn-finance-deps --zip-file fileb://dependencies-layer.zip --compatible-runtimes nodejs18.x nodejs20.x"
echo "2. Deploy function with layer ARN"

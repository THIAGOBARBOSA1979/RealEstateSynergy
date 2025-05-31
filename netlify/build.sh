#!/bin/bash

# Netlify build script
echo "Starting Netlify build process..."

# Install dependencies
npm ci --include=dev

# Build the frontend
echo "Building frontend with Vite..."
npx vite build

# Ensure the dist/public directory exists and has content
echo "Checking build output..."
ls -la dist/
ls -la dist/public/

echo "Build completed successfully!"
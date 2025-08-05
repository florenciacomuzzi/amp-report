#!/bin/bash
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Installing dependencies..."
npm install
echo "Checking if react-scripts is installed:"
ls -la node_modules/.bin/react-scripts || echo "react-scripts not found"
echo "Running build..."
./node_modules/.bin/react-scripts build
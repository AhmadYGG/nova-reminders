#!/bin/bash

# Script untuk setup HTTPS di development
# Usage: ./setup-https.sh

set -e

echo "🔐 Setting up HTTPS for development..."
echo ""

# Create certs directory
mkdir -p certs

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "⚠️  mkcert not found. Installing..."
    echo ""
    
    # Detect OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "📦 Installing mkcert on Linux..."
        
        # Try different package managers
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y libnss3-tools
            curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
            chmod +x mkcert-v*-linux-amd64
            sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
        elif command -v yum &> /dev/null; then
            sudo yum install -y nss-tools
            curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
            chmod +x mkcert-v*-linux-amd64
            sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
        else
            echo "❌ Could not install mkcert automatically."
            echo "Please install manually: https://github.com/FiloSottile/mkcert"
            exit 1
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "📦 Installing mkcert on macOS..."
        brew install mkcert
        brew install nss # for Firefox
    else
        echo "❌ Unsupported OS: $OSTYPE"
        echo "Please install mkcert manually: https://github.com/FiloSottile/mkcert"
        exit 1
    fi
fi

echo ""
echo "✅ mkcert is installed"
echo ""

# Install local CA
echo "🔑 Installing local Certificate Authority..."
mkcert -install

echo ""
echo "📜 Generating SSL certificates..."

# Get local IP
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "🌐 Local IP: $LOCAL_IP"

# Generate certificates
cd certs
mkcert localhost 127.0.0.1 ::1 $LOCAL_IP

# Rename files for easier use
mv localhost+*.pem localhost.pem 2>/dev/null || true
mv localhost+*-key.pem localhost-key.pem 2>/dev/null || true

cd ..

echo ""
echo "✅ SSL certificates generated!"
echo ""
echo "📁 Certificate files:"
echo "   - certs/localhost.pem (certificate)"
echo "   - certs/localhost-key.pem (private key)"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm run dev:https"
echo "   2. Open: https://localhost:3000"
echo ""
echo "💡 Note: Your browser will trust these certificates automatically!"
echo ""

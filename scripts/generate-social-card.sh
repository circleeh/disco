#!/usr/bin/env bash

# Generate social media card PNG from SVG
# This script converts the SVG social card to PNG format for better social media compatibility

set -euo pipefail

# Error handling function
handle_error() {
    local exit_code=$?
    local line_number=$1
    echo "Error occurred in script at line: $line_number"
    echo "Exit code: $exit_code"
    exit $exit_code
}

# Set error handler
trap 'handle_error $LINENO' ERR

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if we're in the right directory
if [[ ! -f "frontend/public/social-card.svg" ]]; then
    print_status $RED "Error: social-card.svg not found in frontend/public/"
    print_status $YELLOW "Please run this script from the project root directory"
    exit 1
fi

print_status $GREEN "🎨 Generating social media card..."

# Check for required tools
if command -v convert >/dev/null 2>&1; then
    # Use ImageMagick if available
    print_status $YELLOW "Using ImageMagick to convert SVG to PNG..."
    convert "frontend/public/social-card.svg" "frontend/public/social-card.png"
elif command -v rsvg-convert >/dev/null 2>&1; then
    # Use rsvg-convert if available
    print_status $YELLOW "Using rsvg-convert to convert SVG to PNG..."
    rsvg-convert -w 1200 -h 630 "frontend/public/social-card.svg" -o "frontend/public/social-card.png"
elif command -v inkscape >/dev/null 2>&1; then
    # Use Inkscape if available
    print_status $YELLOW "Using Inkscape to convert SVG to PNG..."
    inkscape --export-type=png --export-width=1200 --export-height=630 \
             "frontend/public/social-card.svg" --export-filename="frontend/public/social-card.png"
else
    print_status $RED "Error: No suitable conversion tool found"
    print_status $YELLOW "Please install one of the following:"
    echo "  - ImageMagick (recommended): sudo apt-get install imagemagick"
    echo "  - librsvg2-bin: sudo apt-get install librsvg2-bin"
    echo "  - Inkscape: sudo apt-get install inkscape"
    echo ""
    print_status $YELLOW "For now, the SVG file will be used directly"
    exit 1
fi

# Check if conversion was successful
if [[ -f "frontend/public/social-card.png" ]]; then
    print_status $GREEN "✅ Social media card generated successfully!"
    print_status $GREEN "📁 File: frontend/public/social-card.png"

    # Get file size
    local file_size=$(du -h "frontend/public/social-card.png" | cut -f1)
    print_status $GREEN "📏 Size: $file_size"

    # Get dimensions
    if command -v identify >/dev/null 2>&1; then
        local dimensions=$(identify -format "%wx%h" "frontend/public/social-card.png")
        print_status $GREEN "📐 Dimensions: $dimensions"
    fi
else
    print_status $RED "❌ Failed to generate PNG file"
    exit 1
fi

print_status $GREEN "🎉 Social media card is ready for sharing!"
print_status $YELLOW "💡 The card will now appear when your app is shared on:"
echo "  - Facebook"
echo "  - Twitter"
echo "  - LinkedIn"
echo "  - WhatsApp"
echo "  - Discord"
echo "  - And other social platforms"

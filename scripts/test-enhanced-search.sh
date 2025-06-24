#!/usr/bin/env bash

# Test script for the enhanced MusicBrainz search functionality
# This script tests the new separate artist and album search endpoints

set -euo pipefail

# Error handling function
handle_error() {
    local exit_code=$?
    local line_number=$1
    echo "Error occurred in script at line: $line_number"
    echo "Exit code: $exit_code"
    exit "$exit_code"
}

# Set error handler
trap 'handle_error $LINENO' ERR

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:5000/api}"
TEST_TOKEN="${TEST_TOKEN:-}"

echo -e "${BLUE}🔍 Testing Enhanced MusicBrainz Search Functionality${NC}"
echo "=================================================="

# Function to make API request
make_request() {
    local method="$1"
    local endpoint="$2"
    local token="$3"
    local data="$4"

    local headers=""
    if [[ -n "$token" ]]; then
        headers="-H 'Authorization: Bearer $token'"
    fi

    local curl_cmd="curl -s -w '\nHTTP_STATUS:%{http_code}' $headers"

    if [[ -n "$data" ]]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi

    curl_cmd="$curl_cmd -X $method '$API_BASE_URL$endpoint'"

    echo -e "${YELLOW}Testing: $method $endpoint${NC}"
    if [[ -n "$token" ]]; then
        echo -e "${YELLOW}With authentication${NC}"
    else
        echo -e "${YELLOW}Without authentication${NC}"
    fi

    local response
    response=$(eval "$curl_cmd")

    local http_status
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    local body
    body=$(echo "$response" | sed '/HTTP_STATUS:/d')

    echo -e "Status: $http_status"
    echo -e "Response: $body"
    echo "---"

    echo "$http_status"
}

# Test cases
echo -e "${BLUE}📖 Testing Enhanced Search Endpoints${NC}"
echo "=========================================="

# Test 1: Search by artist only
echo -e "${BLUE}1. Testing Artist-Only Search${NC}"
status=$(make_request "GET" "/metadata/artist/Black%20Flag" "$TEST_TOKEN" "")
if [[ "$status" == "200" ]]; then
    echo -e "${GREEN}✅ Artist-only search works${NC}"
else
    echo -e "${RED}❌ Artist-only search failed (status: $status)${NC}"
fi

echo ""

# Test 2: Search by album only
echo -e "${BLUE}2. Testing Album-Only Search${NC}"
status=$(make_request "GET" "/metadata/album?album=Damaged" "$TEST_TOKEN" "")
if [[ "$status" == "200" ]]; then
    echo -e "${GREEN}✅ Album-only search works${NC}"
else
    echo -e "${RED}❌ Album-only search failed (status: $status)${NC}"
fi

echo ""

# Test 3: Search by artist and album separately
echo -e "${BLUE}3. Testing Artist + Album Search${NC}"
status=$(make_request "GET" "/metadata/artist-album?artist=Black%20Flag&album=Damaged" "$TEST_TOKEN" "")
if [[ "$status" == "200" ]]; then
    echo -e "${GREEN}✅ Artist + Album search works${NC}"
else
    echo -e "${RED}❌ Artist + Album search failed (status: $status)${NC}"
fi

echo ""

# Test 4: Original combined search (for comparison)
echo -e "${BLUE}4. Testing Original Combined Search${NC}"
status=$(make_request "GET" "/metadata/search?query=Black%20Flag%20Damaged" "$TEST_TOKEN" "")
if [[ "$status" == "200" ]]; then
    echo -e "${GREEN}✅ Original combined search still works${NC}"
else
    echo -e "${RED}❌ Original combined search failed (status: $status)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Enhanced search test completed!${NC}"

# Instructions for manual testing
echo ""
echo -e "${BLUE}📋 Manual Testing Instructions:${NC}"
echo "1. Start your backend server"
echo "2. Open the frontend application"
echo "3. Try adding a new vinyl record"
echo "4. Click 'Search MusicBrainz for Album Info'"
echo "5. Test the different search modes:"
echo "   - Combined Search: Enter 'Black Flag Damaged'"
echo "   - Artist Only: Enter 'Black Flag'"
echo "   - Album Only: Enter 'Damaged'"
echo "   - Artist + Album: Enter 'Black Flag' and 'Damaged' separately"
echo ""
echo -e "${BLUE}🔑 To test with authentication:${NC}"
echo "1. Login through the frontend"
echo "2. Copy the JWT token from localStorage (auth_token)"
echo "3. Set TEST_TOKEN='your_token_here' and run this script again"

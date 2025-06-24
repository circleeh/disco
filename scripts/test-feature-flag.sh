#!/usr/bin/env bash

# Test script for the feature flag functionality
# This script tests the vinyl API endpoints with and without authentication

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

echo -e "${BLUE}🔧 Testing Feature Flag Functionality${NC}"
echo "=================================="

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

# Test GET /api/vinyl (read operation)
echo -e "${BLUE}📖 Testing READ operations${NC}"
echo "================================"

# Test without authentication
status=$(make_request "GET" "/vinyl" "" "")
if [[ "$status" == "200" ]]; then
    echo -e "${GREEN}✅ READ operation works without authentication${NC}"
else
    echo -e "${RED}❌ READ operation failed without authentication (status: $status)${NC}"
fi

# Test with authentication (if token provided)
if [[ -n "$TEST_TOKEN" ]]; then
    status=$(make_request "GET" "/vinyl" "$TEST_TOKEN" "")
    if [[ "$status" == "200" ]]; then
        echo -e "${GREEN}✅ READ operation works with authentication${NC}"
    else
        echo -e "${RED}❌ READ operation failed with authentication (status: $status)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping authenticated READ test (no token provided)${NC}"
fi

echo ""

# Test POST /api/vinyl (write operation)
echo -e "${BLUE}✏️  Testing WRITE operations${NC}"
echo "================================="

# Test without authentication
test_data='{"artistName":"Test Artist","albumName":"Test Album","year":2024,"format":"LP","genre":"Test","price":25.00,"owner":"Test Owner","status":"Owned"}'
status=$(make_request "POST" "/vinyl" "" "$test_data")
if [[ "$status" == "401" ]]; then
    echo -e "${GREEN}✅ WRITE operation correctly requires authentication${NC}"
else
    echo -e "${RED}❌ WRITE operation should require authentication (status: $status)${NC}"
fi

# Test with authentication (if token provided)
if [[ -n "$TEST_TOKEN" ]]; then
    status=$(make_request "POST" "/vinyl" "$TEST_TOKEN" "$test_data")
    if [[ "$status" == "201" || "$status" == "200" ]]; then
        echo -e "${GREEN}✅ WRITE operation works with authentication${NC}"
    else
        echo -e "${RED}❌ WRITE operation failed with authentication (status: $status)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping authenticated WRITE test (no token provided)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Feature flag test completed!${NC}"

# Instructions for manual testing
echo ""
echo -e "${BLUE}📋 Manual Testing Instructions:${NC}"
echo "1. Set ALLOW_PUBLIC_READ=false in your .env file to disable public read access"
echo "2. Set ALLOW_PUBLIC_READ=true (or remove the variable) to enable public read access"
echo "3. Restart your backend server after changing the environment variable"
echo "4. Test the frontend to see if edit buttons appear only when logged in"
echo ""
echo -e "${BLUE}🔑 To test with authentication:${NC}"
echo "1. Login through the frontend"
echo "2. Copy the JWT token from localStorage (auth_token)"
echo "3. Set TEST_TOKEN='your_token_here' and run this script again"

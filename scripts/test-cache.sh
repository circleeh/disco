#!/usr/bin/env bash

# Test script for Google Sheets cache functionality
# This script tests the caching mechanism to ensure it reduces API calls

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

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:5000/api}"
AUTH_TOKEN="${AUTH_TOKEN:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if API is running
check_api_health() {
    log_info "Checking API health..."
    if curl -s -f "${API_BASE_URL}/health" > /dev/null 2>&1; then
        log_success "API is running"
    else
        log_error "API is not running. Please start the backend server first."
        exit 1
    fi
}

# Get cache status
get_cache_status() {
    log_info "Getting cache status..."
    local response
    response=$(curl -s -H "Authorization: Bearer ${AUTH_TOKEN}" "${API_BASE_URL}/metadata/cache/status")
    echo "$response" | jq -r '.'
}

# Invalidate cache
invalidate_cache() {
    log_info "Invalidating cache..."
    local response
    response=$(curl -s -X POST -H "Authorization: Bearer ${AUTH_TOKEN}" "${API_BASE_URL}/metadata/cache/invalidate")
    echo "$response" | jq -r '.'
}

# Make API call and measure time
make_api_call() {
    local endpoint="$1"
    local description="$2"

    log_info "Making API call: $description"
    local start_time
    start_time=$(date +%s%N)

    local response
    response=$(curl -s -H "Authorization: Bearer ${AUTH_TOKEN}" "${API_BASE_URL}${endpoint}")

    local end_time
    end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds

    log_success "API call completed in ${duration}ms"
    echo "$response" | jq -r '.records | length' > /dev/null 2>&1 && log_success "Response contains records"

    return $duration
}

# Main test function
run_cache_test() {
    log_info "Starting cache functionality test..."

    # Check API health
    check_api_health

    # Get initial cache status
    log_info "=== Initial Cache Status ==="
    get_cache_status

    # Make first API call (should hit Google Sheets API)
    log_info "=== First API Call (Should hit Google Sheets API) ==="
    make_api_call "/vinyl" "Get vinyl records (first call)"

    # Get cache status after first call
    log_info "=== Cache Status After First Call ==="
    get_cache_status

    # Make second API call (should use cache)
    log_info "=== Second API Call (Should use cache) ==="
    make_api_call "/vinyl" "Get vinyl records (second call - cached)"

    # Make third API call (should use cache)
    log_info "=== Third API Call (Should use cache) ==="
    make_api_call "/vinyl" "Get vinyl records (third call - cached)"

    # Test different endpoints that should use the same cached data
    log_info "=== Testing Different Endpoints ==="
    make_api_call "/vinyl/stats" "Get vinyl stats (should use cache)"
    make_api_call "/metadata/artists" "Get artists (should use cache)"
    make_api_call "/metadata/genres" "Get genres (should use cache)"

    # Invalidate cache
    log_info "=== Invalidating Cache ==="
    invalidate_cache

    # Make API call after invalidation (should hit Google Sheets API again)
    log_info "=== API Call After Cache Invalidation ==="
    make_api_call "/vinyl" "Get vinyl records (after invalidation)"

    # Final cache status
    log_info "=== Final Cache Status ==="
    get_cache_status

    log_success "Cache functionality test completed!"
}

# Check dependencies
check_dependencies() {
    local missing_deps=()

    if ! command -v curl > /dev/null 2>&1; then
        missing_deps+=("curl")
    fi

    if ! command -v jq > /dev/null 2>&1; then
        missing_deps+=("jq")
    fi

    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install the missing dependencies and try again."
        exit 1
    fi
}

# Main execution
main() {
    log_info "Google Sheets Cache Test Script"
    log_info "================================"

    # Check dependencies
    check_dependencies

    # Check if AUTH_TOKEN is provided
    if [ -z "$AUTH_TOKEN" ]; then
        log_warning "AUTH_TOKEN not provided. Some endpoints may fail."
        log_info "Set AUTH_TOKEN environment variable to test authenticated endpoints."
    fi

    # Run the test
    run_cache_test
}

# Run main function
main "$@"

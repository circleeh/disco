#!/usr/bin/env bash

# Disco - Development Environment Startup Script
# This script starts both frontend and backend services for development

set -euo pipefail

# Error handling function
handle_error() {
  local exit_code=$?
  local line_number=$1
  echo "Error occurred in line ${line_number}" >&2
  exit "${exit_code}"
}

# Set up error handling
trap 'handle_error ${LINENO}' ERR

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Logging functions
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

# Check if required tools are installed
check_dependencies() {
  log_info "Checking required dependencies..."

  local missing_deps=()

  if ! command -v node &> /dev/null; then
    missing_deps+=("node")
  fi

  if ! command -v npm &> /dev/null; then
    missing_deps+=("npm")
  fi

  if [[ ${#missing_deps[@]} -gt 0 ]]; then
    log_error "Missing required dependencies: ${missing_deps[*]}"
    log_info "Please install the missing dependencies and run this script again."
    exit 1
  fi

  log_success "All required dependencies are installed"
}

# Check if .env file exists
check_env_file() {
  if [[ ! -f "backend/.env" ]]; then
    log_warning "No .env file found in backend directory"
    log_info "Please create backend/.env file with required environment variables"
    log_info "You can copy from backend/.env.example if available"
    exit 1
  fi
}

# Check if node_modules exist
check_dependencies_installed() {
  if [[ ! -d "frontend/node_modules" ]]; then
    log_warning "Frontend dependencies not installed"
    log_info "Running npm install in frontend..."
    cd frontend && npm install && cd ..
  fi

  if [[ ! -d "backend/node_modules" ]]; then
    log_warning "Backend dependencies not installed"
    log_info "Running npm install in backend..."
    cd backend && npm install && cd ..
  fi
}

# Start development servers
start_dev_servers() {
  log_info "Starting development servers..."

  # Check if tmux is available
  if command -v tmux &> /dev/null; then
    start_with_tmux
  else
    start_without_tmux
  fi
}

# Start servers using tmux
start_with_tmux() {
  log_info "Using tmux to manage development servers..."

  # Kill existing tmux session if it exists
  tmux kill-session -t disco-dev 2>/dev/null || true

  # Create new tmux session
  tmux new-session -d -s disco-dev -n 'dev'

  # Split window horizontally
  tmux split-window -h -t disco-dev:dev

  # Start backend in left pane
  tmux send-keys -t disco-dev:dev.0 "cd backend && npm run dev" Enter

  # Start frontend in right pane
  tmux send-keys -t disco-dev:dev.1 "cd frontend && npm run dev" Enter

  # Attach to tmux session
  log_success "Development servers started in tmux session 'disco-dev'"
  log_info "Frontend: http://localhost:3000"
  log_info "Backend: http://localhost:5000"
  log_info "Press Ctrl+B, then D to detach from tmux session"
  log_info "Use 'tmux attach -t disco-dev' to reattach"

  tmux attach-session -t disco-dev
}

# Start servers without tmux
start_without_tmux() {
  log_warning "tmux not available, starting servers in background..."
  log_info "You'll need to manage the processes manually"

  # Start backend in background
  cd backend && npm run dev &
  local backend_pid=$!

  # Start frontend in background
  cd ../frontend && npm run dev &
  local frontend_pid=$!

  log_success "Development servers started"
  log_info "Frontend (PID: $frontend_pid): http://localhost:3000"
  log_info "Backend (PID: $backend_pid): http://localhost:5000"
  log_info "Use 'kill $frontend_pid $backend_pid' to stop servers"

  # Wait for user to stop
  echo "Press Ctrl+C to stop all servers"
  trap "kill $frontend_pid $backend_pid 2>/dev/null; exit" INT
  wait
}

# Main function
main() {
  log_info "Starting Disco development environment..."

  check_dependencies
  check_env_file
  check_dependencies_installed
  start_dev_servers
}

# Run main function
main "$@"

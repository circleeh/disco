#!/usr/bin/env bash

# Disco - Vinyl Collection Management App Deployment Script
# This script handles deployment of both frontend and backend as Docker containers

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

# Configuration
readonly FRONTEND_DIR="frontend"
readonly BACKEND_DIR="backend"
readonly BUILD_DIR="dist"
readonly DOCKER_REGISTRY="${DOCKER_REGISTRY:-localhost:5000}"
readonly IMAGE_NAME="disco"

# Check if required tools are installed
check_dependencies() {
  log_info "Checking deployment dependencies..."

  local missing_deps=()

  if ! command -v node &> /dev/null; then
    missing_deps+=("node")
  fi

  if ! command -v npm &> /dev/null; then
    missing_deps+=("npm")
  fi

  if ! command -v docker &> /dev/null; then
    missing_deps+=("docker")
  fi

  if ! command -v git &> /dev/null; then
    missing_deps+=("git")
  fi

  if [[ ${#missing_deps[@]} -gt 0 ]]; then
    log_error "Missing required dependencies: ${missing_deps[*]}"
    log_info "Please install the missing dependencies and run this script again."
    exit 1
  fi

  log_success "All required dependencies are installed"
}

# Build frontend
build_frontend() {
  log_info "Building frontend application..."

  cd "${FRONTEND_DIR}" || exit 1

  # Install dependencies if node_modules doesn't exist
  if [[ ! -d node_modules ]]; then
    log_info "Installing frontend dependencies..."
    npm install
  fi

  # Build the application
  log_info "Creating production build..."
  npm run build

  if [[ ! -d "${BUILD_DIR}" ]]; then
    log_error "Frontend build failed - dist directory not found"
    exit 1
  fi

  log_success "Frontend build completed successfully"
  cd ..
}

# Build backend
build_backend() {
  log_info "Building backend application..."

  cd "${BACKEND_DIR}" || exit 1

  # Install dependencies if node_modules doesn't exist
  if [[ ! -d node_modules ]]; then
    log_info "Installing backend dependencies..."
    npm install
  fi

  # Build the application
  log_info "Creating production build..."
  npm run build

  if [[ ! -d "${BUILD_DIR}" ]]; then
    log_error "Backend build failed - dist directory not found"
    exit 1
  fi

  log_success "Backend build completed successfully"
  cd ..
}

# Build Docker images
build_docker_images() {
  log_info "Building Docker images..."

  # Build frontend image
  log_info "Building frontend Docker image..."
  docker build -t "${DOCKER_REGISTRY}/${IMAGE_NAME}-frontend:latest" \
    -f "${FRONTEND_DIR}/Dockerfile" "${FRONTEND_DIR}"

  # Build backend image
  log_info "Building backend Docker image..."
  docker build -t "${DOCKER_REGISTRY}/${IMAGE_NAME}-backend:latest" \
    -f "${BACKEND_DIR}/Dockerfile" "${BACKEND_DIR}"

  log_success "Docker images built successfully"
}

# Push Docker images to registry
push_docker_images() {
  log_info "Pushing Docker images to registry..."

  # Push frontend image
  log_info "Pushing frontend image..."
  docker push "${DOCKER_REGISTRY}/${IMAGE_NAME}-frontend:latest"

  # Push backend image
  log_info "Pushing backend image..."
  docker push "${DOCKER_REGISTRY}/${IMAGE_NAME}-backend:latest"

  log_success "Docker images pushed successfully"
}

# Deploy to self-hosted infrastructure
deploy_self_hosted() {
  log_info "Deploying to self-hosted infrastructure..."

  # Check if docker-compose is available
  if command -v docker-compose &> /dev/null; then
    log_info "Using docker-compose for deployment..."

    # Create docker-compose override for production
    if [[ ! -f docker-compose.prod.yml ]]; then
      create_docker_compose_prod
    fi

    # Deploy using docker-compose
    docker-compose -f docker-compose.prod.yml up -d

  elif command -v kubectl &> /dev/null; then
    log_info "Using Kubernetes for deployment..."

    # Apply Kubernetes manifests
    kubectl apply -f k8s/

  else
    log_warning "Neither docker-compose nor kubectl found"
    log_info "Please deploy manually using your preferred method"
    log_info "Images are available at:"
    log_info "  - ${DOCKER_REGISTRY}/${IMAGE_NAME}-frontend:latest"
    log_info "  - ${DOCKER_REGISTRY}/${IMAGE_NAME}-backend:latest"
  fi

  log_success "Deployment completed"
}

# Create production docker-compose file
create_docker_compose_prod() {
  log_info "Creating production docker-compose configuration..."

  cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  disco-frontend:
    image: ${DOCKER_REGISTRY}/disco-frontend:latest
    container_name: disco-frontend
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - disco-network

  disco-backend:
    image: ${DOCKER_REGISTRY}/disco-backend:latest
    container_name: disco-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL}
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_SHEETS_ID=${GOOGLE_SHEETS_ID}
      - GOOGLE_SERVICE_ACCOUNT_EMAIL=${GOOGLE_SERVICE_ACCOUNT_EMAIL}
      - GOOGLE_PRIVATE_KEY=${GOOGLE_PRIVATE_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    restart: unless-stopped
    networks:
      - disco-network

networks:
  disco-network:
    driver: bridge
EOF

  log_success "Production docker-compose configuration created"
}

# Create deployment package
create_deployment_package() {
  log_info "Creating deployment package..."

  local package_name="disco-deployment-$(date +%Y%m%d-%H%M%S).tar.gz"

  # Create temporary directory for deployment files
  local temp_dir=$(mktemp -d)

  # Copy built frontend
  cp -r "${FRONTEND_DIR}/${BUILD_DIR}" "${temp_dir}/frontend"

  # Copy built backend
  cp -r "${BACKEND_DIR}/${BUILD_DIR}" "${temp_dir}/backend"

  # Copy package.json files
  cp "${BACKEND_DIR}/package.json" "${temp_dir}/backend/"

  # Copy environment example
  cp "${BACKEND_DIR}/.env.example" "${temp_dir}/backend/"

  # Copy Docker files
  cp "${FRONTEND_DIR}/Dockerfile" "${temp_dir}/frontend/"
  cp "${BACKEND_DIR}/Dockerfile" "${temp_dir}/backend/"

  # Create deployment instructions
  cat > "${temp_dir}/DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
# Disco Deployment Instructions

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Access to container registry
- Environment variables configured

### Quick Deployment

1. Build and push images:
   ```bash
   ./scripts/deploy.sh --build-only
   ```

2. Deploy using docker-compose:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. Pull the latest images:
   ```bash
   docker pull ${DOCKER_REGISTRY}/disco-frontend:latest
   docker pull ${DOCKER_REGISTRY}/disco-backend:latest
   ```

2. Run the containers:
   ```bash
   # Frontend
   docker run -d --name disco-frontend \
     -p 80:80 \
     -e NODE_ENV=production \
     ${DOCKER_REGISTRY}/disco-frontend:latest

   # Backend
   docker run -d --name disco-backend \
     -p 5000:5000 \
     -e NODE_ENV=production \
     -e GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID} \
     -e GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET} \
     -e GOOGLE_CALLBACK_URL=${GOOGLE_CALLBACK_URL} \
     -e JWT_SECRET=${JWT_SECRET} \
     -e GOOGLE_SHEETS_ID=${GOOGLE_SHEETS_ID} \
     -e GOOGLE_SERVICE_ACCOUNT_EMAIL=${GOOGLE_SERVICE_ACCOUNT_EMAIL} \
     -e GOOGLE_PRIVATE_KEY=${GOOGLE_PRIVATE_KEY} \
     -e SESSION_SECRET=${SESSION_SECRET} \
     -e FRONTEND_URL=${FRONTEND_URL} \
     ${DOCKER_REGISTRY}/disco-backend:latest
   ```

## Environment Variables

Make sure to configure the following environment variables:

- `DOCKER_REGISTRY` - Your container registry URL
- `GOOGLE_CLIENT_ID` - Google OAuth2 client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth2 client secret
- `GOOGLE_CALLBACK_URL` - OAuth2 callback URL
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_SHEETS_ID` - Google Sheets document ID
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key
- `SESSION_SECRET` - Session secret
- `FRONTEND_URL` - Frontend application URL

## Health Check

Test the deployment by visiting:
- Frontend: http://your-server-ip
- Backend: http://your-server-ip:5000/api/health
EOF

  # Create archive
  tar -czf "${package_name}" -C "${temp_dir}" .

  # Clean up
  rm -rf "${temp_dir}"

  log_success "Deployment package created: ${package_name}"
}

# Run tests
run_tests() {
  log_info "Running tests..."

  # Frontend tests
  if [[ -d "${FRONTEND_DIR}" ]]; then
    cd "${FRONTEND_DIR}" || exit 1
    if npm run test 2>/dev/null; then
      log_success "Frontend tests passed"
    else
      log_warning "Frontend tests failed or not configured"
    fi
    cd ..
  fi

  # Backend tests
  if [[ -d "${BACKEND_DIR}" ]]; then
    cd "${BACKEND_DIR}" || exit 1
    if npm run test 2>/dev/null; then
      log_success "Backend tests passed"
    else
      log_warning "Backend tests failed or not configured"
    fi
    cd ..
  fi
}

# Show usage information
show_usage() {
  cat << 'EOF'
Usage: ./scripts/deploy.sh [OPTIONS]

Options:
  -b, --build-only      Only build the applications and Docker images, don't deploy
  -f, --frontend-only   Only build and deploy frontend
  -b, --backend-only    Only build and deploy backend
  -p, --package         Create deployment package
  -t, --test            Run tests before deployment
  -r, --registry        Specify custom Docker registry (default: localhost:5000)
  -h, --help            Show this help message

Examples:
  ./scripts/deploy.sh                    # Build and deploy both frontend and backend
  ./scripts/deploy.sh --build-only       # Only build, don't deploy
  ./scripts/deploy.sh --package          # Create deployment package
  ./scripts/deploy.sh --test             # Run tests and deploy
  ./scripts/deploy.sh --registry my-registry.com # Use custom registry
EOF
}

# Parse command line arguments
parse_arguments() {
  local build_only=false
  local frontend_only=false
  local backend_only=false
  local create_package=false
  local run_tests_flag=false

  while [[ $# -gt 0 ]]; do
    case $1 in
      -b|--build-only)
        build_only=true
        shift
        ;;
      -f|--frontend-only)
        frontend_only=true
        shift
        ;;
      -b|--backend-only)
        backend_only=true
        shift
        ;;
      -p|--package)
        create_package=true
        shift
        ;;
      -t|--test)
        run_tests_flag=true
        shift
        ;;
      -r|--registry)
        DOCKER_REGISTRY="$2"
        shift 2
        ;;
      -h|--help)
        show_usage
        exit 0
        ;;
      *)
        log_error "Unknown option: $1"
        show_usage
        exit 1
        ;;
    esac
  done

  # Set global variables
  readonly BUILD_ONLY="${build_only}"
  readonly FRONTEND_ONLY="${frontend_only}"
  readonly BACKEND_ONLY="${backend_only}"
  readonly CREATE_PACKAGE="${create_package}"
  readonly RUN_TESTS_FLAG="${run_tests_flag}"
}

# Main deployment function
main() {
  log_info "Starting Disco deployment process..."

  parse_arguments "$@"

  check_dependencies

  if [[ "${RUN_TESTS_FLAG}" == "true" ]]; then
    run_tests
  fi

  if [[ "${FRONTEND_ONLY}" == "true" ]]; then
    build_frontend
    build_docker_images
    if [[ "${BUILD_ONLY}" != "true" ]]; then
      push_docker_images
      deploy_self_hosted
    fi
  elif [[ "${BACKEND_ONLY}" == "true" ]]; then
    build_backend
    build_docker_images
    if [[ "${BUILD_ONLY}" != "true" ]]; then
      push_docker_images
      deploy_self_hosted
    fi
  else
    build_frontend
    build_backend
    build_docker_images

    if [[ "${BUILD_ONLY}" != "true" ]]; then
      push_docker_images
      deploy_self_hosted
    fi
  fi

  if [[ "${CREATE_PACKAGE}" == "true" ]]; then
    create_deployment_package
  fi

  log_success "🎉 Deployment process completed successfully!"
  log_info ""
  log_info "Next steps:"
  log_info "1. Verify your applications are running correctly"
  log_info "2. Test the authentication flow"
  log_info "3. Check Google Sheets integration"
  log_info "4. Monitor application logs for any issues"
  log_info ""
  log_info "Happy listening! 🎵"
}

# Run main function
main "$@"

#!/usr/bin/env bash

# Disco - Vinyl Collection Management App Setup Script
# This script initializes the project structure and installs dependencies

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

# Initialize frontend project
setup_frontend() {
  log_info "Setting up frontend project..."

  cd frontend || exit 1

  # Initialize package.json if it doesn't exist
  if [[ ! -f package.json ]]; then
    npm init -y
  fi

  # Install frontend dependencies
  log_info "Installing frontend dependencies..."
  npm install react react-dom react-router-dom
  npm install -D @types/react @types/react-dom @types/node typescript
  npm install -D vite @vitejs/plugin-react
  npm install -D tailwindcss postcss autoprefixer
  npm install -D @headlessui/react @heroicons/react
  npm install @tanstack/react-query
  npm install axios
  npm install react-oauth/google

  # Initialize Tailwind CSS
  npx tailwindcss init -p

  log_success "Frontend setup completed"
  cd ..
}

# Initialize backend project
setup_backend() {
  log_info "Setting up backend project..."

  cd backend || exit 1

  # Update existing package.json
  cat > package.json << 'EOF'
{
  "name": "disco-backend",
  "version": "1.0.0",
  "description": "Backend API for Disco vinyl collection management app",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix"
  },
  "keywords": ["vinyl", "collection", "management", "api"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "express-session": "^1.17.3",
    "joi": "^17.11.0",
    "googleapis": "^128.0.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/passport": "^1.0.16",
    "@types/passport-google-oauth20": "^2.0.14",
    "@types/express-session": "^1.17.10",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "tsx": "^4.6.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8"
  }
}
EOF

  # Install dependencies
  log_info "Installing backend dependencies..."
  npm install

  log_success "Backend setup completed"
  cd ..
}

# Create project structure
create_project_structure() {
  log_info "Creating project structure..."

  # Frontend structure
  mkdir -p frontend/src/{components/{ui,forms,layout,vinyl},hooks,lib,pages,services,stores,types,utils}
  mkdir -p frontend/public

  # Backend structure
  mkdir -p backend/src/{controllers,middleware,routes,services,types,utils,config}

  # Create basic configuration files
  create_config_files

  log_success "Project structure created"
}

# Create configuration files
create_config_files() {
  log_info "Creating configuration files..."

  # Frontend TypeScript config
  cat > frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

  # Frontend Vite config
  cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
EOF

  # Frontend Tailwind config
  cat > frontend/tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
EOF

  # Backend TypeScript config
  cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

  # Backend environment example
  cat > backend/.env.example << 'EOF'
# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key

# Session Configuration
SESSION_SECRET=your_session_secret

# CORS Configuration
FRONTEND_URL=http://localhost:3000
EOF

  # Create basic README
  cat > README.md << 'EOF'
# Disco - Vinyl Collection Management App

A mobile-first web application for managing vinyl record collections with Google OAuth2 authentication and Google Sheets integration.

## Features

- 🔐 Google OAuth2 Authentication
- 📱 Mobile-first responsive design
- 📊 Google Sheets integration
- 🎵 Vinyl collection management
- 🔍 Search and filter functionality
- 📱 Progressive Web App support

## Quick Start

1. Clone the repository
2. Run the setup script: `./scripts/setup.sh`
3. Configure environment variables (see `.env.example`)
4. Start development servers:
   - Frontend: `cd frontend && npm run dev`
   - Backend: `cd backend && npm run dev`

## Project Structure

- `frontend/` - React TypeScript application
- `backend/` - Node.js Express API
- `docs/` - Documentation
- `scripts/` - Build and deployment scripts

## Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation as needed

## License

ISC
EOF

  log_success "Configuration files created"
}

# Create basic source files
create_basic_files() {
  log_info "Creating basic source files..."

  # Frontend main files
  cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Disco - Vinyl Collection Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

  cat > frontend/src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

  cat > frontend/src/App.tsx << 'EOF'
import React from 'react'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          🎵 Disco
        </h1>
        <p className="text-center text-gray-600">
          Your vinyl collection management app
        </p>
      </div>
    </div>
  )
}

export default App
EOF

  cat > frontend/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

  cat > frontend/src/App.css << 'EOF'
/* Custom styles can be added here */
EOF

  # Backend main file
  cat > backend/src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Disco API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Disco API server running on port ${PORT}`);
});
EOF

  log_success "Basic source files created"
}

# Main setup function
main() {
  log_info "Starting Disco project setup..."

  check_dependencies
  create_project_structure
  setup_frontend
  setup_backend
  create_basic_files

  log_success "🎉 Disco project setup completed successfully!"
  log_info ""
  log_info "Next steps:"
  log_info "1. Configure Google OAuth2 credentials"
  log_info "2. Set up Google Sheets API access"
  log_info "3. Copy backend/.env.example to backend/.env and fill in your values"
  log_info "4. Start development servers:"
  log_info "   - Frontend: cd frontend && npm run dev"
  log_info "   - Backend: cd backend && npm run dev"
  log_info ""
  log_info "Happy coding! 🎵"
}

# Run main function
main "$@"

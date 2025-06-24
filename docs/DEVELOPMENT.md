# Development Guide

## Architecture Overview

Disco is a full-stack web application with a clear separation between frontend and backend services:

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React/Vite)  │◄──►│  (Express/TS)   │
│   Port: 3000    │    │   Port: 5000    │
└─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Browser       │    │  Google Sheets  │
│   (User)        │    │   (Database)    │
└─────────────────┘    └─────────────────┘
```

## Port Configuration

### Development Ports

- **Frontend**: `http://localhost:3000`
  - React development server (Vite)
  - Serves the user interface
  - Proxies API calls to backend

- **Backend**: `http://localhost:5000`
  - Express API server
  - Handles authentication and data operations
  - Communicates with Google Sheets

### API Proxy Configuration

The frontend automatically proxies API requests to the backend using Vite's proxy configuration:

```typescript
// frontend/vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

This means:
- Frontend makes requests to `/api/*`
- Vite automatically forwards these to `http://localhost:5000/api/*`
- No CORS issues in development

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Google Cloud account (for OAuth2 and Sheets integration)

### Quick Start

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd disco
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

2. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your Google Cloud credentials
   ```

3. **Start development servers**

   **Option A: Use the development script (recommended)**
   ```bash
   chmod +x scripts/dev.sh
   ./scripts/dev.sh
   ```

   **Option B: Manual startup**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

   **Option C: Docker Compose**
   ```bash
   docker-compose up
   ```

### Environment Variables

Create `backend/.env` with the following variables:

```bash
# Google OAuth2
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# Google Sheets
GOOGLE_SHEETS_ID=your_google_sheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Session
SESSION_SECRET=your_session_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Development Workflow

### Starting Development

1. **Backend first**: Always start the backend before the frontend
2. **Check health**: Visit `http://localhost:5000/api/health` to verify backend is running
3. **Frontend second**: Start frontend and visit `http://localhost:3000`

### Common Development Tasks

#### Adding New API Endpoints

1. Create route in `backend/src/routes/`
2. Create controller in `backend/src/controllers/`
3. Add validation in `backend/src/middleware/validation.ts`
4. Test with Postman or curl

#### Adding New Frontend Features

1. Create components in `frontend/src/components/`
2. Add services in `frontend/src/services/`
3. Update types in `frontend/src/types/`
4. Test in browser

#### Database Changes (Google Sheets)

1. Update the sheet structure
2. Update types in both frontend and backend
3. Update validation schemas
4. Test data operations

### Debugging

#### Backend Debugging

- Check console output for errors
- Use `console.log()` for debugging
- Check `http://localhost:5000/api/health` for server status
- Review environment variables

#### Frontend Debugging

- Use browser developer tools
- Check Network tab for API calls
- Use React Developer Tools extension
- Check Vite dev server console

#### Common Issues

**Port already in use**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

**Environment variables not loaded**
```bash
# Check if .env file exists
ls -la backend/.env

# Verify variables are loaded
cd backend && node -e "require('dotenv').config(); console.log(process.env.GOOGLE_CLIENT_ID)"
```

**CORS issues**
- Ensure `FRONTEND_URL` is set correctly in backend `.env`
- Check that frontend is running on port 3000
- Verify proxy configuration in `vite.config.ts`

## Testing

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

### Manual Testing

1. **Authentication flow**
   - Test Google OAuth2 login
   - Verify session persistence
   - Test logout functionality

2. **CRUD operations**
   - Create new vinyl records
   - Read/display records
   - Update existing records
   - Delete records

3. **Data synchronization**
   - Verify changes sync to Google Sheets
   - Test offline functionality
   - Check data consistency

## Deployment

### Development to Production

1. **Environment variables**: Update for production URLs
2. **Google Cloud**: Configure production OAuth2 credentials
3. **CORS**: Update allowed origins
4. **Security**: Ensure all secrets are properly configured

### Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Backend Won't Start

1. Check environment variables
2. Verify Google Cloud credentials
3. Check port availability
4. Review error logs

### Frontend Won't Connect to Backend

1. Verify backend is running on port 5000
2. Check proxy configuration
3. Verify CORS settings
4. Check network requests in browser

### Authentication Issues

1. Verify Google OAuth2 credentials
2. Check callback URL configuration
3. Verify session configuration
4. Check browser cookies

### Data Sync Issues

1. Verify Google Sheets permissions
2. Check service account configuration
3. Review API quotas
4. Check error logs

## Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

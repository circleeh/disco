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

### Prerequisites

- Node.js 18+ and npm
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd disco
   ```

2. **Run the setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp backend/.env.example backend/.env

   # Edit the file with your Google Cloud credentials
   nano backend/.env
   ```

4. **Start the development servers**

   **Option A: Run services separately (recommended for development)**

   ```bash
   # Terminal 1: Start the backend
   cd backend
   npm run dev
   # Backend will run on http://localhost:5000

   # Terminal 2: Start the frontend
   cd frontend
   npm run dev
   # Frontend will run on http://localhost:3000
   ```

   **Option B: Use Docker Compose**

   ```bash
   docker-compose up
   # Frontend: http://localhost:3000
   # Backend: http://localhost:5000
   ```

5. **Access the application**

   - Frontend: <http://localhost:3000>
   - Backend API: <http://localhost:5000>
   - Health check: <http://localhost:5000/api/health>

### Port Configuration

- **Frontend**: Port 3000 (React/Vite development server)
- **Backend**: Port 5000 (Express API server)
- **API Proxy**: Frontend automatically proxies `/api/*` requests to backend

The frontend and backend run on different ports and communicate via Vite's proxy
configuration. This is the intended architecture for development.

## Documentation

- **[Development Guide](docs/DEVELOPMENT.md)** - Comprehensive development setup and workflow
- **[API Documentation](docs/API.md)** - Backend API endpoints and usage
- **[Architecture Plan](ARCHITECTURE_PLAN.md)** - System architecture and design decisions

## Google Cloud Configuration

To integrate this app with Google Sheets, you'll need to configure several
things in Google Cloud Console:

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing (required for API usage)

### 2. Enable Required APIs

Enable these APIs in your Google Cloud project:

- **Google Sheets API** - for reading/writing to your spreadsheet
- **Google+ API** (or Google Identity API) - for OAuth2 authentication

You can enable them by:

1. Going to "APIs & Services" > "Library"
2. Search for each API and click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
5. Note down the **Client ID** and **Client Secret**

### 4. Create Service Account (for Google Sheets access)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details
4. Once created, click on the service account
5. Go to "Keys" tab
6. Click "Add Key" > "Create new key" > "JSON"
7. Download the JSON key file

**TODO**: Move to Workload Identity Federation

### 5. Share Your Google Sheet

1. Open your Google Sheet
2. Click "Share" button
3. Add the service account email (found in the JSON key file) with "Editor"
   permissions
4. The email will look like:
   `your-service-account@your-project.iam.gserviceaccount.com`

### 6. Update Your Backend Configuration

You'll need to update your backend environment variables with the credentials:

```bash
# OAuth2 credentials
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret

# Google Sheets service account
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Your Google Sheet ID (from the URL)
GOOGLE_SHEET_ID=your_sheet_id_here
```

### 7. Get Your Google Sheet ID

The sheet ID is in the URL of your Google Sheet:

```text
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
```

### 8. Configure Vite Proxy (for development)

Make sure your `vite.config.ts` has the proxy configuration to forward API calls
to your backend:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### Security Notes

- Never commit the service account JSON file or client secrets to version
  control
- Use environment variables for all sensitive configuration
- Consider using Google Cloud Secret Manager for production deployments
- Set up proper CORS configuration in your backend

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

GPL v3

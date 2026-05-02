# eng-api-ts

TypeScript Express API for City of Franklin Engineering Department applications

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Express](https://img.shields.io/badge/Express-4.21-green)
![Sequelize](https://img.shields.io/badge/Sequelize-6.37-orange)
![Node](https://img.shields.io/badge/Node-22.x-brightgreen)

## Overview

Backend API service that handles database CRUD operations for Engineering department applications at the City of Franklin. Manages multiple domain-specific modules including stormwater construction site tracking, capital improvement projects, development vesting periods, and traffic calming petitions. Built with TypeScript, Express, and Sequelize ORM connecting to SQL Server databases.

## Features

- **Multi-Database Architecture**: Connects to 5 separate SQL Server databases for different domain modules
- **Azure AD Authentication**: Secure Entra ID integration for user authentication
- **Comprehensive Security**: Helmet, CORS, HPP, CSP, and input sanitization middleware
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Path Aliases**: Clean imports using @ prefixes for better code organization
- **Editor Tracking**: Automatic user tracking for all create/update operations
- **Rate Limiting**: Built-in API rate limiting protection
- **Image Processing**: Sharp integration for image optimization
- **Email Notifications**: Automated email workflows using Nodemailer

## Prerequisites

- Node.js >= 22.x
- npm >= 10.x
- Access to SQL Server databases
- Azure AD tenant with configured app registration

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd eng-api-ts

# Install dependencies
npm install

# Create environment configuration
cp src/config/config.env.example src/config/config.env
# Edit config.env with your database and Azure AD credentials
```

## Configuration

Create `src/config/config.env` with the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5001` |
| `HOST` | Server host | `http://localhost` |
| `BASE_URL` | API base path | `/api/v2` |
| `DB_USERNAME` | Database username | `sa` |
| `DB_PASSWORD` | Database password | `YourPassword123` |
| `STORMWATER_DB_HOST` | Stormwater database host | `localhost` |
| `STORMWATER_DB_DATABASE` | Stormwater database name | `Stormwater` |
| `CIP_DB_HOST` | CIP database host | `localhost` |
| `CIP_DB_DATABASE` | CIP database name | `CIP` |
| `VESTING_DB_HOST` | Vesting database host | `localhost` |
| `VESTING_DB_DATABASE` | Vesting database name | `Vesting` |
| `CALMING_DB_HOST` | Traffic calming database host | `localhost` |
| `CALMING_DB_DATABASE` | Traffic calming database name | `TrafficCalming` |
| `INFOR_DB_HOST` | Infor integration database host | `localhost` |
| `INFOR_DB_DATABASE` | Infor database name | `Infor` |
| `ENTRA_URL` | Azure AD token validation endpoint | `https://login.microsoftonline.com/...` |
| `API_DOCUMENTATION_URL` | Postman docs URL | `https://documenter.getpostman.com/...` |

### Example .env File

```env
NODE_ENV=development
PORT=5001
HOST=http://localhost
BASE_URL=/api/v2

DB_USERNAME=your_username
DB_PASSWORD=your_password

STORMWATER_DB_HOST=localhost
STORMWATER_DB_DATABASE=Stormwater
CIP_DB_HOST=localhost
CIP_DB_DATABASE=CIP
VESTING_DB_HOST=localhost
VESTING_DB_DATABASE=Vesting
CALMING_DB_HOST=localhost
CALMING_DB_DATABASE=TrafficCalming
INFOR_DB_HOST=localhost
INFOR_DB_DATABASE=Infor

ENTRA_URL=https://your-tenant.microsoftonline.com/validate
API_DOCUMENTATION_URL=https://documenter.getpostman.com/view/6104227/2sAYdeLBHg
```

## Usage

### Development Mode
```bash
npm run dev
# Server runs on http://localhost:5001 with hot reload
```

### Production Mode
```bash
# Build TypeScript and resolve path aliases
npm run build

# Start production server
npm start
```

### Deployment
```bash
# Deploy to production server via rsync and restart PM2
npm run deploy
```

## Project Structure

```
src/
├── app.ts                 # Express application entry point
├── config/
│   └── config.ts          # Multi-database configuration
├── controllers/           # Business logic by domain
│   ├── stormwater/
│   ├── cip/
│   ├── vesting/
│   └── traffic-calming/
├── middleware/            # Express middleware
│   ├── auth/             # Entra ID authentication
│   ├── async/            # Async handler wrapper
│   ├── errorHandler/     # Global error handler
│   ├── inputSanitation/  # Input sanitization
│   ├── csp/              # Content Security Policy
│   └── rateLimiter/      # API rate limiting
├── models/               # Sequelize models by database
│   ├── stormwater/
│   ├── cip/
│   ├── vesting/
│   ├── traffic-calming/
│   └── infor/
├── routes/               # Express routes by domain
│   ├── stormwater/
│   ├── cip/
│   ├── vesting/
│   ├── traffic-calming/
│   └── public/
└── utils/                # Utility functions
    ├── editorTracking/   # User tracking
    ├── errorResponse/    # Error response helper
    ├── handleDateOnly/   # DATEONLY field formatting
    ├── processImage/     # Image processing
    └── automatedEmails/  # Email workflows
```

## API Routes

Full API documentation: [Postman Documentation](https://documenter.getpostman.com/view/6104227/2sAYdeLBHg)

### Stormwater Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v2/stormwater/site` | List/create construction sites |
| GET/PUT/DELETE | `/api/v2/stormwater/site/:uuid` | Get/update/delete site |
| GET/POST | `/api/v2/stormwater/inspector` | List/create inspectors |
| GET/POST | `/api/v2/stormwater/complaint` | List/create complaints |
| GET/POST | `/api/v2/stormwater/violation` | List/create violations |
| GET/POST | `/api/v2/stormwater/log` | List/create inspection logs |
| GET/POST | `/api/v2/stormwater/contact` | List/create contacts |
| GET/POST | `/api/v2/stormwater/illicitdischarge` | List/create illicit discharges |

### CIP Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v2/cip/project` | List/create CIP projects |
| GET/POST | `/api/v2/cip/milestone` | List/create project milestones |
| GET/POST | `/api/v2/cip/phase` | List/create project phases |
| GET/POST | `/api/v2/cip/spending` | List/create spending records |
| GET/POST | `/api/v2/cip/update` | List/create project updates |

### Vesting Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v2/vesting/project` | List/create vesting projects |
| GET/POST | `/api/v2/vesting/period` | List/create vesting periods |
| GET/POST | `/api/v2/vesting/milestone` | List/create milestones |
| GET/POST | `/api/v2/vesting/extension` | List/create period extensions |
| GET/POST | `/api/v2/vesting/approval` | List/create approvals |
| GET/POST | `/api/v2/vesting/resolution` | List/create resolutions |
| GET/POST | `/api/v2/vesting/notification` | List/create notifications |

### Traffic Calming Module
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v2/traffic-calming/petition` | List/create traffic calming petitions |
| GET/POST | `/api/v2/traffic-calming/respondent` | List/create petition respondents |
| GET/POST | `/api/v2/traffic-calming/response` | List/create petition responses |
| GET/POST | `/api/v2/traffic-calming/attachment` | List/create petition attachments |

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v2/public/*` | Unauthenticated public endpoints |

## Development

### TypeScript Compilation
```bash
# Compile TypeScript and resolve path aliases
npm run build
```

**Important**: Always use `npm run build` instead of `tsc` directly. The build command runs both TypeScript compilation and `tsc-alias` to properly resolve path aliases (`@config`, `@models`, etc.) in the compiled JavaScript output.

### Code Organization
- Use path aliases for imports: `@models/stormwater`, `@controllers/cip`, etc.
- Wrap async route handlers with `asyncHandler` middleware
- Use `ErrorResponse` class for error handling
- Apply `editorTracking` utility for create/update operations
- Apply `entra` middleware to protected routes

### Adding New Features
1. Create Sequelize model in `src/models/{domain}/{model}.ts`
2. Add model types to `src/models/{domain}/types.ts`
3. Register model in `src/models/{domain}/index.ts`
4. Create controller in `src/controllers/{domain}/{resource}.ts`
5. Create route file in `src/routes/{domain}/{resource}.ts`
6. Register route in `src/routes/{domain}/index.ts`

## Deployment

### Production Build
```bash
# Compile TypeScript and resolve aliases
npm run build

# Output will be in dist/ directory
```

### Automated Deployment
```bash
# Deploy to production server (cofasv30)
npm run deploy
```

This command:
1. Syncs `dist/` directory to remote server
2. Syncs `package.json` and `package-lock.json`
3. Restarts the PM2 service `eng-api-ts`

### Manual Deployment
```bash
# SSH to production server
ssh andrew@cofasv30

# Navigate to project directory
cd ~/builds/eng-api-ts

# Install production dependencies
npm ci --production

# Start with PM2
pm2 start dist/app.js --name eng-api-ts
```

## License

ISC

## Author

Andrew Southern

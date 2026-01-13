# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript Express API for Engineering department applications at City of Franklin. Handles database CRUD operations for multiple domain modules (stormwater, CIP, vesting, traffic calming). Uses Sequelize ORM with SQL Server databases.

API Documentation: https://documenter.getpostman.com/view/6104227/2sAYdeLBHg

## Commands

### Development
```bash
npm run dev          # Start development server with nodemon and tsconfig-paths
npm run build        # Compile TypeScript and resolve path aliases with tsc-alias
npm start            # Start production server (uses compiled dist/app.js on port 5001)
```

### Deployment
```bash
npm run deploy       # Rsync to production server (cofasv30) and restart PM2 service
```

## Architecture

### Multi-Database Setup
This app connects to **5 separate SQL Server databases**, each configured in `src/config/config.ts`:
- **stormwater**: Construction site tracking, inspections, violations
- **cip**: Capital Improvement Projects
- **vesting**: Development vesting periods and milestones
- **traffic-calming**: Traffic calming petitions
- **infor**: Integration with Infor ERP system

Each database has its own Sequelize instance initialized in its respective `src/models/{domain}/index.ts` file.

### Path Aliases
TypeScript paths are configured in `tsconfig.json` and require `tsc-alias` after compilation:
- `@config` → `src/config/*`
- `@controllers/*` → `src/controllers/*`
- `@middleware/*` → `src/middleware/*`
- `@models/*` → `src/models/*`
- `@routes/*` → `src/routes/*`
- `@utils/*` → `src/utils/*`

**Important**: Always run `npm run build` (not just `tsc`) to properly resolve aliases in compiled output.

### Route Structure
Routes are organized by domain module. Each domain follows this pattern:

1. **Main route file** (`src/routes/{domain}/index.ts`): Exports a function that mounts sub-routes on the Express app with a base URL pattern
2. **Sub-route files** (`src/routes/{domain}/{resource}.ts`): Define specific resource routes using Express Router
3. **Controllers** (`src/controllers/{domain}/{resource}.ts`): Implement business logic with standard CRUD operations

Example flow:
```
src/app.ts
  → imports stormwaterRoutes from src/routes/stormwater/index.ts
  → which mounts /site router at /api/v2/stormwater/site
  → which uses controllers from src/controllers/stormwater/site.ts
```

### Authentication
- **Entra ID (Azure AD)** authentication via `@middleware/auth/entra` middleware
- In development mode, uses mock user with email `test.o365-3@franklintn.gov`
- In production, validates JWT token by calling `process.env.ENTRA_URL`
- User info available in `req.entra.preferred_username`

### Editor Tracking Pattern
All models include `createdBy` and `updatedBy` fields. Use the `editorTracking` utility when creating/updating records:
```typescript
import editorTracking from '@utils/editorTracking'

await Model.create({
  ...data,
  ...editorTracking(req)  // Adds createdBy/updatedBy from req.entra.preferred_username
})
```

### Model Associations
Models define associations via an `associate` static method that's called during model initialization. See `src/models/{domain}/index.ts` for the association setup pattern.

### Security Middleware Stack
Applied in this order in `src/app.ts`:
1. `helmet` - Security headers
2. `hpp` - HTTP Parameter Pollution protection
3. `csp` - Content Security Policy
4. `inputSanitation` - Input sanitization
5. `cors` - CORS with whitelisted Franklin TN domains

### Error Handling
- Use `asyncHandler` middleware wrapper for all async route handlers
- Throw errors using `ErrorResponse` class from `@utils/errorResponse`
- Global error handler in `src/middleware/errorHandler` catches all errors

## Environment Configuration

Create `src/config/config.env` with required variables:
- `NODE_ENV` - development or production
- `PORT` - Server port
- `HOST` - Server host
- `BASE_URL` - API base path (e.g., `/api/v2`)
- `DB_USERNAME`, `DB_PASSWORD` - Shared database credentials
- Database hosts/names for each domain:
  - `STORMWATER_DB_HOST`, `STORMWATER_DB_DATABASE`
  - `CIP_DB_HOST`, `CIP_DB_DATABASE`
  - `VESTING_DB_HOST`, `VESTING_DB_DATABASE`
  - `CALMING_DB_HOST`, `CALMING_DB_DATABASE`
  - `INFOR_DB_HOST`, `INFOR_DB_DATABASE`
- `ENTRA_URL` - Azure AD token validation endpoint
- `API_DOCUMENTATION_URL` - Postman documentation URL

## Common Patterns

### Adding a New Route
1. Create controller in `src/controllers/{domain}/{resource}.ts`
2. Create route file in `src/routes/{domain}/{resource}.ts` that imports controller
3. Import and mount route in `src/routes/{domain}/index.ts`
4. Apply `entra` middleware for protected routes

### Working with Models
- Models are initialized per-database in `src/models/{domain}/index.ts`
- Type definitions in `src/models/{domain}/types.ts`
- Import models from domain index: `import { Model } from '@models/stormwater'`
- Use Sequelize v6 syntax (not v7)

## Documentation Standards

### Creating README Files
When creating or updating README.md files, follow the template at `/opt/claude-standards/README_TEMPLATE.md`. The template provides a standardized structure with sections for Overview, Features, Prerequisites, Installation, Configuration, Usage, Project Structure, API Routes, Development, and Deployment. Keep descriptions concise and focus on practical information developers need immediately.

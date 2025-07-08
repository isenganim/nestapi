# Backend Package - NestJS API

A comprehensive NestJS backend application with JWT authentication, Prisma ORM, and comprehensive database seeding capabilities.

## Features

- **NestJS Framework** - Modern, scalable Node.js framework
- **JWT Authentication** - Secure token-based authentication
- **Prisma ORM** - Type-safe database access with custom client generation
- **Database Seeding** - Comprehensive seeding system for development data
- **Swagger Documentation** - Auto-generated API documentation
- **TypeScript** - Full TypeScript support with strict typing
- **Request Typing** - Custom Express request augmentation for authenticated users

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Set up environment variables
cp .env.example .env
# Edit .env with your database connection and JWT secrets
```

### Database Setup

```bash
# Run database migrations
npm run prisma:migrate

# Seed the database with sample data
npm run seed

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Or use the alternative command
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1` with Swagger documentation at `http://localhost:3000/api/v1/docs`.

## API Documentation

- **Interactive Swagger UI**: `http://localhost:3000/api/v1/docs` - Test endpoints directly in the browser
- **OpenAPI JSON**: `http://localhost:3000/api/v1-json` - Machine-readable API specification
- **Comprehensive Guide**: [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) - Detailed API documentation with examples

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/             # Authentication DTOs
│   ├── guards/          # JWT guards
│   └── strategies/      # Passport strategies
├── config/              # Configuration module
│   ├── config.module.ts
│   ├── config.service.ts
│   └── config.validation.ts
├── database/            # Database seeding
│   ├── seeder.service.ts
│   ├── seeder.module.ts
│   ├── seed.ts
│   └── README.md
├── notes/               # Notes module
│   ├── notes.controller.ts
│   ├── notes.service.ts
│   ├── notes.module.ts
│   └── dto/
├── prisma/              # Prisma configuration
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── types/               # TypeScript declarations
│   └── express.d.ts
├── generated/           # Generated Prisma client
│   └── client/
├── app.module.ts
└── main.ts
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile

### Notes
- `GET /notes` - List notes with pagination and filtering
- `POST /notes` - Create new note
- `GET /notes/:id` - Get specific note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note

### Documentation
- `GET /api` - Swagger API documentation
- `GET /api-json` - OpenAPI JSON specification

## Database Seeding

The application includes a comprehensive database seeding system that creates realistic test data:

### Seeded Data
- **10 Users** - Sample users with hashed passwords
- **15 Tags** - Predefined tags for categorization
- **50 Notes** - Varied content including code snippets, documentation, and personal notes
- **Relationships** - Proper linking between users, notes, and tags
- **User Preferences** - Default settings for each user
- **Search History** - Sample search activity

### Running the Seeder

```bash
# Clear database and seed with fresh data
npm run seed
```

See [`src/database/README.md`](src/database/README.md) for detailed seeding documentation.

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"

# App
PORT=3000
NODE_ENV="development"
```

### Custom Prisma Client

The application uses a custom Prisma client generated to `src/generated/client` for better organization. The build process automatically copies this to the `dist` folder.

## Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run start:debug` - Start with debugging enabled

### Build & Production
- `npm run build` - Build the application
- `npm run start:prod` - Start production server

### Database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run seed` - Seed database with sample data

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## Authentication & Security

### JWT Authentication
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Passwords are hashed using argon2
- Protected routes require valid JWT tokens

### Request Typing
The application includes custom TypeScript declarations for Express requests:

```typescript
// Authenticated requests include user information
interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

// Use in controllers
@Get('profile')
getProfile(@Req() req: AuthenticatedRequest) {
  return req.user; // Fully typed user object
}
```

## Development Guidelines

### Adding New Modules
1. Create module directory under `src/`
2. Implement service, controller, and module files
3. Add DTOs for request/response validation
4. Import module in `app.module.ts`
5. Add relevant tests

### Database Changes
1. Update Prisma schema
2. Generate new migration: `npm run prisma:migrate`
3. Update seeder if needed
4. Regenerate client: `npm run prisma:generate`

### Custom Configuration
The application uses a custom configuration service that validates environment variables and provides typed getters:

```typescript
// In services
constructor(private config: ConfigService) {}

// Type-safe configuration access
const jwtSecret = this.config.jwtSecret;
const dbUrl = this.config.databaseUrl;
```

## Testing

The application includes comprehensive testing setup:

- **Unit Tests** - Jest-based unit testing
- **E2E Tests** - End-to-end API testing
- **Coverage Reports** - Code coverage analysis

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

## Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Environment Setup
1. Set production environment variables
2. Run database migrations
3. Ensure generated client is available in dist folder
4. Start the application

## Troubleshooting

### Common Issues

1. **Missing Prisma Client**
   ```bash
   npm run prisma:generate
   ```

2. **Database Connection Issues**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify database exists

3. **Build Issues**
   - Clear dist folder and rebuild
   - Ensure all dependencies are installed
   - Check TypeScript compilation errors

4. **Seeding Failures**
   - Check database connection
   - Ensure proper permissions
   - Verify schema is up to date

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all linting passes
5. Test seeding with your changes

## License

This project is private and proprietary.
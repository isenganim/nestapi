# Database Seeder

This directory contains the database seeding functionality for the NestJS backend application.

## Overview

The seeder provides a comprehensive way to populate the database with sample data for development and testing purposes. It creates realistic test data including users, tags, notes, and their relationships.

## Files

- **`seeder.service.ts`** - Main seeding service with all seeding logic
- **`seeder.module.ts`** - NestJS module that provides the SeederService
- **`seed.ts`** - CLI script to run the seeder
- **`README.md`** - This documentation file

## Features

### Data Seeding
- **Users**: Creates 10 sample users with realistic names and emails
- **Tags**: Creates 15 predefined tags for organizing notes
- **Notes**: Creates 50 sample notes with various content types
- **Relationships**: Links notes to tags and users appropriately
- **Links**: Creates bookmark-style links between notes
- **Preferences**: Sets up user preferences for each user
- **Search History**: Populates search history for users

### Safety Features
- **Database Clearing**: Safely clears all existing data before seeding
- **Referential Integrity**: Maintains proper foreign key relationships
- **Unique Constraints**: Ensures slug uniqueness and email uniqueness
- **Transaction Safety**: Uses proper database transactions

## Usage

### Running the Seeder

```bash
# From the backend package directory
npm run seed
```

### Manual Usage

You can also use the seeder programmatically:

```typescript
import { SeederService } from './database/seeder.service';

// In your NestJS application context
const seederService = app.get(SeederService);
const result = await seederService.seedAll();
console.log(`Seeded ${result.users} users, ${result.tags} tags, ${result.notes} notes`);
```

## Seeded Data Structure

### Users
- 10 users with realistic names and email addresses
- Passwords are hashed using argon2
- Each user has a unique email and profile information

### Tags
- 15 predefined tags covering various categories:
  - Personal, Work, Ideas, Research, Tutorial
  - JavaScript, TypeScript, React, Node.js, Database
  - Health, Travel, Finance, Shopping, Learning

### Notes
- 50 notes with varied content including:
  - Meeting notes and project documentation
  - Code snippets and technical tutorials
  - Personal thoughts and ideas
  - Research findings and bookmarks
- Each note has a unique slug and proper metadata

### Relationships
- Notes are randomly assigned to users
- Tags are randomly associated with notes (1-4 tags per note)
- Links connect related notes
- User preferences are set with realistic defaults

## Development

### Adding New Seed Data

To add new types of data to the seeder:

1. Add the seeding method to `SeederService`
2. Update the `seedAll()` method to include your new seeder
3. Ensure proper order of operations (dependencies first)

### Customizing Seed Data

You can modify the sample data arrays in `seeder.service.ts`:

```typescript
// Example: Adding new tags
const tagNames = [
  'Personal', 'Work', 'Ideas', 'Research', 'Tutorial',
  'YourNewTag', 'AnotherTag'
];
```

## Database Schema

The seeder works with the following Prisma schema tables:
- `User` - Application users
- `Tag` - Note categorization tags
- `Note` - Main content entities
- `NoteTag` - Many-to-many relationship between notes and tags
- `Link` - Connections between notes
- `UserPreference` - User-specific settings
- `SearchHistory` - User search activity

## Error Handling

The seeder includes comprehensive error handling:
- Database connection errors
- Constraint violation errors
- Transaction rollback on failures
- Detailed logging of seeding progress

## Performance

The seeder is optimized for development use:
- Batch operations where possible
- Efficient database queries
- Proper indexing utilization
- Memory-conscious data generation

## Security

- All passwords are properly hashed using argon2
- No sensitive data is included in seed files
- Database operations use parameterized queries
- Proper cleanup of sensitive operations
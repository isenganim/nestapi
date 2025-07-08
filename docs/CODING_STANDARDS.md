# Coding Standards & Best Practices

## General Principles
- Follow SOLID principles
- Write self-documenting code
- Keep functions small and focused
- Follow the principle of least surprise
- Prefer composition over inheritance

## Language-Specific Guidelines

### TypeScript/Node.js
- Use TypeScript strict mode
- Follow Airbnb JavaScript/TypeScript Style Guide
- Use async/await instead of callbacks
- Use ES modules (import/export)
- Prefer interfaces over types
- Use absolute imports

### Go
- Follow Effective Go guidelines
- Use gofmt and goimports
- Keep functions under 50 lines
- Return errors, don't panic
- Use interfaces for dependencies
- Follow standard project layout

## Code Organization

### Directory Structure
```
src/
├── api/           # API routes and controllers
├── config/        # Configuration files
├── db/            # Database migrations and models
├── middleware/    # Express/Go middleware
├── services/      # Business logic
├── utils/         # Helper functions
└── types/         # TypeScript types/Go structs
```

### Naming Conventions
- Variables/Functions: `camelCase`
- Classes/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case`
- Environment variables: `UPPER_SNAKE_CASE`

## Code Quality

### Linting & Formatting
- ESLint for TypeScript/JavaScript
- GolangCI-Lint for Go
- Prettier for code formatting
- EditorConfig for consistent editor settings
- Pre-commit hooks with Husky

### Testing
- Write tests before or alongside features (TDD)
- Follow AAA pattern (Arrange-Act-Assert)
- Test edge cases and error conditions
- Use meaningful test descriptions
- Aim for 80%+ code coverage

## Documentation

### Code Comments
- Use JSDoc/GoDoc for public APIs
- Explain why, not what
- Keep comments up-to-date
- Remove commented-out code

### API Documentation
- Use OpenAPI/Swagger
- Document all endpoints
- Include examples
- Document error responses

## Git Workflow

### Branch Naming
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical production fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates

### Commit Messages
Follow Conventional Commits:
```
type(scope): description

[optional body]

[optional footer]
```

### Pull Requests
- Keep PRs small and focused
- Include a clear description
- Link related issues
- Request reviews from team members
- All tests must pass before merging

## Performance Considerations
- Optimize database queries
- Use pagination for large datasets
- Implement caching where appropriate
- Monitor and optimize memory usage
- Use connection pooling

## Error Handling
- Use custom error types
- Provide meaningful error messages
- Log errors with context
- Handle errors at the appropriate level
- Don't expose sensitive information in errors

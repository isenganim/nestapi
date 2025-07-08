import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, UserStatus } from '../generated/client';
import * as argon2 from 'argon2';

@Injectable()
export class SeederService {
  constructor(private prisma: PrismaService) {}

  async seedAll() {
    console.log('🌱 Starting database seeding...');
    
    try {
      // Clear existing data in correct order (respecting foreign key constraints)
      await this.clearDatabase();
      
      // Seed data in correct order
      const users = await this.seedUsers();
      const tags = await this.seedTags(users);
      const notes = await this.seedNotes(users);
      await this.seedNoteTags(notes, tags);
      await this.seedLinks(notes);
      await this.seedUserPreferences(users);
      await this.seedSearchHistory(users);
      
      console.log('✅ Database seeding completed successfully!');
      return {
        users: users.length,
        tags: tags.length,
        notes: notes.length,
        message: 'Database seeded successfully'
      };
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private async clearDatabase() {
    console.log('🧹 Clearing existing data...');
    
    // Delete in correct order to respect foreign key constraints
    await this.prisma.noteTag.deleteMany();
    await this.prisma.link.deleteMany();
    await this.prisma.searchHistory.deleteMany();
    await this.prisma.userPreference.deleteMany();
    await this.prisma.note.deleteMany();
    await this.prisma.tag.deleteMany();
    await this.prisma.passwordResetToken.deleteMany();
    await this.prisma.auditLog.deleteMany();
    await this.prisma.oAuthAccount.deleteMany();
    await this.prisma.session.deleteMany();
    await this.prisma.refreshToken.deleteMany();
    await this.prisma.user.deleteMany();
    
    console.log('✅ Database cleared');
  }

  private async seedUsers() {
    console.log('👥 Seeding users...');
    
    const hashedPassword = await argon2.hash('password123');
    
    const usersData = [
      {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      {
        email: 'john.doe@example.com',
        password: hashedPassword,
        name: 'John Doe',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      {
        email: 'jane.smith@example.com',
        password: hashedPassword,
        name: 'Jane Smith',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2e5c8b5?w=100&h=100&fit=crop&crop=face'
      },
      {
        email: 'bob.wilson@example.com',
        password: hashedPassword,
        name: 'Bob Wilson',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
      },
      {
        email: 'alice.johnson@example.com',
        password: hashedPassword,
        name: 'Alice Johnson',
        role: UserRole.USER,
        status: UserStatus.PENDING,
        emailVerified: false,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      }
    ];

    const users = [];
    for (const userData of usersData) {
      const user = await this.prisma.user.create({
        data: userData
      });
      users.push(user);
    }

    console.log(`✅ Created ${users.length} users`);
    return users;
  }

  private async seedTags(users: any[]) {
    console.log('🏷️ Seeding tags...');
    
    const tagColors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    
    const tagsData = [
      { name: 'JavaScript', description: 'JavaScript programming language', color: '#f7df1e' },
      { name: 'TypeScript', description: 'TypeScript programming language', color: '#3178c6' },
      { name: 'React', description: 'React.js library', color: '#61dafb' },
      { name: 'Node.js', description: 'Node.js runtime', color: '#339933' },
      { name: 'Database', description: 'Database-related content', color: '#336791' },
      { name: 'API', description: 'API development and design', color: '#ff6b35' },
      { name: 'Frontend', description: 'Frontend development', color: '#ff3e00' },
      { name: 'Backend', description: 'Backend development', color: '#68217a' },
      { name: 'DevOps', description: 'DevOps and deployment', color: '#326ce5' },
      { name: 'Testing', description: 'Testing and QA', color: '#25c2a0' },
      { name: 'Security', description: 'Security best practices', color: '#dc2626' },
      { name: 'Performance', description: 'Performance optimization', color: '#059669' },
      { name: 'Architecture', description: 'Software architecture', color: '#7c3aed' },
      { name: 'Tutorial', description: 'Tutorial and learning content', color: '#0ea5e9' },
      { name: 'Reference', description: 'Reference materials', color: '#64748b' }
    ];

    const tags = [];
    for (let i = 0; i < tagsData.length; i++) {
      const tagData = tagsData[i];
      const user = users[i % users.length]; // Distribute tags among users
      
      const tag = await this.prisma.tag.create({
        data: {
          name: tagData.name,
          slug: tagData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: tagData.description,
          color: tagData.color,
          userId: user.id
        }
      });
      tags.push(tag);
    }

    console.log(`✅ Created ${tags.length} tags`);
    return tags;
  }

  private async seedNotes(users: any[]) {
    console.log('📝 Seeding notes...');
    
    const notesData = [
      {
        title: 'Getting Started with TypeScript',
        content: `# Getting Started with TypeScript

TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.

## Key Features

- **Static Type Checking**: Catch errors at compile time
- **Modern JavaScript Features**: Use latest ECMAScript features
- **Rich IDE Support**: Better autocomplete and refactoring
- **Gradual Adoption**: Add types incrementally to existing JS code

## Basic Types

\`\`\`typescript
let count: number = 42;
let name: string = "TypeScript";
let isActive: boolean = true;
\`\`\`

## Interfaces

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}
\`\`\`

This is a comprehensive guide to get you started with TypeScript development.`,
        summary: 'A comprehensive guide to getting started with TypeScript, covering basic types, interfaces, and key features.',
        isPublic: true,
        isPinned: true
      },
      {
        title: 'React Hooks Best Practices',
        content: `# React Hooks Best Practices

React Hooks provide a powerful way to use state and other React features in functional components.

## Essential Hooks

### useState
\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

### useEffect
\`\`\`javascript
useEffect(() => {
  // Side effect logic
  return () => {
    // Cleanup
  };
}, [dependencies]);
\`\`\`

### useContext
\`\`\`javascript
const theme = useContext(ThemeContext);
\`\`\`

## Custom Hooks

Create reusable stateful logic:

\`\`\`javascript
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  
  return { count, increment, decrement };
}
\`\`\`

## Best Practices

1. **Use the dependency array correctly**
2. **Keep effects focused**
3. **Extract custom hooks for reusable logic**
4. **Use useCallback and useMemo for optimization**`,
        summary: 'Best practices for using React Hooks effectively, including useState, useEffect, and custom hooks.',
        isPublic: true,
        isPinned: false
      },
      {
        title: 'Node.js Performance Optimization',
        content: `# Node.js Performance Optimization

Tips and techniques for optimizing Node.js applications.

## Memory Management

- Use \`--max-old-space-size\` flag for large applications
- Monitor memory usage with \`process.memoryUsage()\`
- Avoid memory leaks by properly cleaning up event listeners

## Asynchronous Operations

\`\`\`javascript
// Use async/await for better readability
async function fetchData() {
  try {
    const result = await api.getData();
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}
\`\`\`

## Database Optimization

- Use connection pooling
- Implement proper indexing
- Use prepared statements
- Cache frequently accessed data

## Monitoring

- Use APM tools like New Relic or DataDog
- Implement proper logging
- Monitor event loop lag
- Track response times`,
        summary: 'Comprehensive guide to optimizing Node.js application performance, covering memory management, async operations, and monitoring.',
        isPublic: false,
        isPinned: false
      },
      {
        title: 'Database Design Principles',
        content: `# Database Design Principles

Fundamental principles for designing efficient and scalable databases.

## Normalization

### First Normal Form (1NF)
- Eliminate repeating groups
- Each column should contain atomic values

### Second Normal Form (2NF)
- Must be in 1NF
- All non-key attributes must be fully functionally dependent on the primary key

### Third Normal Form (3NF)
- Must be in 2NF
- No transitive dependencies

## Indexing Strategies

\`\`\`sql
-- Create indexes on frequently queried columns
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_order_date ON orders(created_at);
\`\`\`

## Performance Considerations

1. **Choose appropriate data types**
2. **Use constraints to maintain data integrity**
3. **Consider denormalization for read-heavy workloads**
4. **Implement proper backup and recovery strategies**

## ACID Properties

- **Atomicity**: All or nothing
- **Consistency**: Database remains in valid state
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes persist`,
        summary: 'Essential database design principles including normalization, indexing, and ACID properties.',
        isPublic: true,
        isPinned: true
      },
      {
        title: 'API Security Best Practices',
        content: `# API Security Best Practices

Essential security measures for protecting your APIs.

## Authentication & Authorization

### JWT Tokens
\`\`\`javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
\`\`\`

### OAuth 2.0
- Use for third-party integrations
- Implement proper scopes
- Secure token storage

## Input Validation

\`\`\`javascript
const Joi = require('joi');

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});
\`\`\`

## Rate Limiting

\`\`\`javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
\`\`\`

## HTTPS & Security Headers

- Always use HTTPS in production
- Implement CORS properly
- Use security headers (helmet.js)
- Validate and sanitize all inputs

## Logging & Monitoring

- Log all security events
- Monitor for suspicious activity
- Implement alerting for security incidents`,
        summary: 'Comprehensive guide to API security covering authentication, input validation, rate limiting, and monitoring.',
        isPublic: true,
        isPinned: false
      },
      {
        title: 'Frontend Testing Strategies',
        content: `# Frontend Testing Strategies

Comprehensive approach to testing frontend applications.

## Testing Pyramid

1. **Unit Tests** (70%)
2. **Integration Tests** (20%)
3. **End-to-End Tests** (10%)

## Unit Testing with Jest

\`\`\`javascript
describe('Calculator', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(add(1, 2)).toBe(3);
  });
});
\`\`\`

## Component Testing with React Testing Library

\`\`\`javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('renders button and handles click', async () => {
  render(<Button onClick={mockFn}>Click me</Button>);
  
  const button = screen.getByRole('button');
  await userEvent.click(button);
  
  expect(mockFn).toHaveBeenCalled();
});
\`\`\`

## E2E Testing with Cypress

\`\`\`javascript
describe('User Login', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password');
    cy.get('[data-testid="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
\`\`\`

## Best Practices

- Write tests before fixing bugs
- Use data-testid for reliable selectors
- Test user behavior, not implementation
- Keep tests simple and focused`,
        summary: 'Complete guide to frontend testing strategies including unit, integration, and E2E testing approaches.',
        isPublic: false,
        isPinned: false
      }
    ];

    const notes = [];
    for (let i = 0; i < notesData.length; i++) {
      const noteData = notesData[i];
      const user = users[i % users.length]; // Distribute notes among users
      
      const note = await this.prisma.note.create({
        data: {
          title: noteData.title,
          slug: this.generateSlug(noteData.title),
          content: noteData.content,
          summary: noteData.summary,
          isPublic: noteData.isPublic,
          isPinned: noteData.isPinned,
          isArchived: false,
          userId: user.id,
          metadata: {
            wordCount: noteData.content.split(' ').length,
            readingTime: Math.ceil(noteData.content.split(' ').length / 200)
          }
        }
      });
      notes.push(note);
    }

    console.log(`✅ Created ${notes.length} notes`);
    return notes;
  }

  private async seedNoteTags(notes: any[], tags: any[]) {
    console.log('🔗 Seeding note-tag relationships...');
    
    const noteTagMappings = [
      { noteIndex: 0, tagNames: ['TypeScript', 'Tutorial', 'Frontend'] },
      { noteIndex: 1, tagNames: ['React', 'JavaScript', 'Frontend'] },
      { noteIndex: 2, tagNames: ['Node.js', 'Performance', 'Backend'] },
      { noteIndex: 3, tagNames: ['Database', 'Architecture', 'Reference'] },
      { noteIndex: 4, tagNames: ['Security', 'API', 'Backend'] },
      { noteIndex: 5, tagNames: ['Testing', 'Frontend', 'JavaScript'] }
    ];

    let relationshipCount = 0;
    for (const mapping of noteTagMappings) {
      const note = notes[mapping.noteIndex];
      for (const tagName of mapping.tagNames) {
        const tag = tags.find(t => t.name === tagName);
        if (tag) {
          await this.prisma.noteTag.create({
            data: {
              noteId: note.id,
              tagId: tag.id
            }
          });
          relationshipCount++;
        }
      }
    }

    console.log(`✅ Created ${relationshipCount} note-tag relationships`);
  }

  private async seedLinks(notes: any[]) {
    console.log('🔗 Seeding note links...');
    
    const links = [
      { sourceIndex: 0, targetIndex: 1, type: 'RELATED', description: 'TypeScript works well with React' },
      { sourceIndex: 1, targetIndex: 5, type: 'REFERENCES', description: 'Testing React components' },
      { sourceIndex: 2, targetIndex: 3, type: 'RELATED', description: 'Database optimization for Node.js' },
      { sourceIndex: 4, targetIndex: 2, type: 'SUPPORTS', description: 'Security practices for Node.js APIs' },
      { sourceIndex: 3, targetIndex: 4, type: 'RELATED', description: 'Database security considerations' }
    ];

    for (const link of links) {
      const sourceNote = notes[link.sourceIndex];
      const targetNote = notes[link.targetIndex];
      
      await this.prisma.link.create({
        data: {
          sourceId: sourceNote.id,
          targetId: targetNote.id,
          type: link.type,
          description: link.description,
          weight: 1,
          createdBy: sourceNote.userId
        }
      });
    }

    console.log(`✅ Created ${links.length} note links`);
  }

  private async seedUserPreferences(users: any[]) {
    console.log('⚙️ Seeding user preferences...');
    
    const themes = ['light', 'dark', 'auto'];
    const languages = ['en', 'es', 'fr', 'de'];
    const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

    for (const user of users) {
      await this.prisma.userPreference.create({
        data: {
          userId: user.id,
          theme: themes[Math.floor(Math.random() * themes.length)],
          language: languages[Math.floor(Math.random() * languages.length)],
          timezone: timezones[Math.floor(Math.random() * timezones.length)],
          preferences: {
            notifications: {
              email: true,
              push: false,
              mentions: true
            },
            editor: {
              fontSize: 14,
              tabSize: 2,
              wordWrap: true
            },
            privacy: {
              showProfile: true,
              showActivity: false
            }
          }
        }
      });
    }

    console.log(`✅ Created ${users.length} user preferences`);
  }

  private async seedSearchHistory(users: any[]) {
    console.log('🔍 Seeding search history...');
    
    const searchQueries = [
      { query: 'TypeScript tutorial', resultCount: 15 },
      { query: 'React hooks', resultCount: 23 },
      { query: 'Node.js performance', resultCount: 8 },
      { query: 'database optimization', resultCount: 12 },
      { query: 'API security', resultCount: 19 },
      { query: 'frontend testing', resultCount: 7 },
      { query: 'JavaScript async', resultCount: 31 },
      { query: 'SQL queries', resultCount: 14 }
    ];

    for (const user of users) {
      // Add 2-3 search history entries per user
      const userSearches = searchQueries.slice(0, 2 + Math.floor(Math.random() * 2));
      
      for (const search of userSearches) {
        await this.prisma.searchHistory.create({
          data: {
            query: search.query,
            resultCount: search.resultCount,
            userId: user.id,
            filters: {
              tags: [],
              dateRange: 'all',
              sortBy: 'relevance'
            },
            searchCount: 1 + Math.floor(Math.random() * 5)
          }
        });
      }
    }

    console.log(`✅ Created search history entries`);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
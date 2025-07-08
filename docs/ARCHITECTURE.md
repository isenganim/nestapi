# Architecture Overview

This Turborepo monorepo hosts both frontend and backend for the PKM SaaS application.

## Monorepo Structure
- packages/
  - frontend/   — Next.js PWA with React, TypeScript, Tailwind CSS
  - backend/    — NestJS API with TypeScript, JWT auth, Prisma ORM
  - shared/     — Shared utility libraries (if any)

## High-Level Components
- Frontend  
  • Next.js (React, SSR/SSG)  
  • PWA support for offline  
  • Tailwind CSS design system  

- Backend  
  • NestJS REST API (`/api/v1` routes)  
  • JWT Authentication (access & refresh tokens)  
  • Prisma ORM (PostgreSQL)  
  • Pino logging via nestjs-pino  

- Data Stores  
  • PostgreSQL (primary database)  
  • Redis (caching, sessions)  
  • S3 or cloud storage for file uploads  

## CI/CD & Infrastructure
- Monorepo build/test via Turborepo  
- GitHub Actions for lint, test, build, deploy  
- Docker & Docker Compose for local development  
- Kubernetes & Helm for production deployments  
- Terraform for infrastructure provisioning  

## Security & Observability
- Role-based access control via NestJS guards  
- End-to-end TLS (HTTPS)  
- Argon2-hashed passwords  
- Centralized logging (ELK/Grafana/Sentry)  
- Monitoring: Prometheus metrics, Grafana dashboards  

## Scaling & Reliability
- Horizontal scaling of stateless NestJS services  
- Connection pooling and read-replicas for PostgreSQL  
- Redis clustering for cache resilience  
- Kubernetes HPA for CPU/memory autoscaling

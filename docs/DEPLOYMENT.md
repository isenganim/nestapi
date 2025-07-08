# Deployment Guide

## Prerequisites

### Infrastructure
- AWS/GCP/Azure account
- Domain name with DNS access
- SSL certificate (Let's Encrypt recommended)

### Tools
- Docker & Docker Compose
- kubectl (for Kubernetes)
- Terraform (for infrastructure as code)
- Helm (for Kubernetes package management)

## Environment Setup

### Configuration
Environment variables are managed in `.env` files per environment:
- `.env.development`
- `.env.staging`
- `.env.production`

Example `.env` file:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key
S3_BUCKET=your-bucket-name
```

## Local Development

### Running with Docker Compose
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Running Tests
```bash
# Unit tests
docker-compose run --rm app npm test

# E2E tests
docker-compose -f docker-compose.test.yml up --build --exit-code-from e2e
```

## Production Deployment

### Infrastructure as Code
Infrastructure is managed with Terraform:
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

### Kubernetes Deployment
1. Set up Kubernetes cluster
2. Install required CRDs and operators
3. Deploy using Helm:
   ```bash
   helm upgrade --install pkmsaas ./charts/pkmsaas \
     --namespace pkmsaas \
     --values ./charts/pkmsaas/values.production.yaml
   ```

### Database Migrations
```bash
kubectl exec -it deployment/pkmsaas-api -- npm run migrate:up
```

## CI/CD Pipeline

### GitHub Actions Workflow
Workflow files are in `.github/workflows/`:
- `ci.yml`: Runs on PRs (lint, test, build)
- `cd.yml`: Deploys to environments

### Deployment Environments
1. **Development**
   - Auto-deploys on push to `develop`
   - Access: `dev.pkmsaas.com`

2. **Staging**
   - Manual deployment from GitHub Actions
   - Access: `staging.pkmsaas.com`
   - Mirrors production configuration

3. **Production**
   - Manual deployment from GitHub Actions
   - Access: `app.pkmsaas.com`
   - Requires approval

## Monitoring & Logging

### Application Monitoring
- Prometheus for metrics
- Grafana for dashboards
- Sentry for error tracking

### Log Management
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Log rotation and retention policies

## Backup & Recovery

### Database Backups
- Daily automated backups
- Point-in-time recovery
- Off-site storage

### Disaster Recovery
1. Regular backup testing
2. Multi-region failover
3. Incident response playbook

## Scaling

### Horizontal Pod Autoscaling
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: pkmsaas-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: pkmsaas-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling
- Read replicas for read-heavy workloads
- Connection pooling with PgBouncer
- Vertical scaling as needed

## Maintenance

### Scheduled Maintenance
- Weekly maintenance window
- Database optimization
- Security patches

### Version Upgrades
1. Test in staging
2. Create backup
3. Deploy new version
4. Monitor for issues
5. Rollback if needed

## Troubleshooting

### Common Issues
1. **Database connection issues**
   - Check database pods
   - Verify credentials
   - Check network policies

2. **High CPU/Memory**
- Check application logs
- Scale up resources if needed
- Optimize queries

### Getting Help
- Check logs: `kubectl logs -f deployment/pkmsaas-api`
- Get shell access: `kubectl exec -it deployment/pkmsaas-api -- /bin/sh`
- View events: `kubectl get events --sort-by='.metadata.creationTimestamp'`

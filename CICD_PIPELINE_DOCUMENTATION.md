# CI/CD Pipeline Documentation

## Overview

EasyCart now includes a comprehensive CI/CD pipeline that automates testing, security scanning, building, and deployment with proper environment management and rollback capabilities.

## Pipeline Stages

### 1. Testing Stage

#### Backend Tests
- **Unit Tests**: Validates core backend functionality
- **Integration Tests**: Tests API endpoints and database operations
- **Coverage**: Test coverage reports uploaded as artifacts

#### Frontend Tests
- **Component Tests**: React component testing
- **Integration Tests**: User flow testing
- **Coverage**: Code coverage metrics tracked

### 2. Security Scanning Stage

#### Dependency Scanning
- **npm audit**: Identifies known vulnerabilities in npm packages
- **OWASP Dependency Check**: Comprehensive dependency vulnerability scanning
- **CodeQL**: Static code analysis (runs weekly and on PRs)

#### Results
- Security reports uploaded as artifacts
- Warnings logged but don't block deployment
- Critical issues should be addressed before production

### 3. Build Stage

#### Backend Build
- Validates Node.js syntax
- Installs production dependencies
- Verifies server configuration

#### Frontend Build
- Builds optimized production bundle
- Applies environment variables
- Generates static assets

#### Admin Dashboard Build
- Builds admin interface
- Optimizes assets
- Prepares for static hosting

### 4. Deployment Stage

#### Automatic Deployment
- Triggers only on `main` branch pushes
- Render.com handles actual deployment
- Services deployed:
  - Backend API: `https://easycart-backend.onrender.com`
  - Frontend: `https://easycart-frontend.onrender.com`
  - Admin: `https://easycart-admin.onrender.com`

#### Deployment Notifications
- Pipeline logs deployment URLs
- Estimated deployment time: 5-10 minutes

### 5. Health Check Stage

#### Post-Deployment Verification
- Waits 5 minutes for services to deploy
- Checks backend health endpoint
- Verifies frontend accessibility
- Tests admin dashboard
- Runs smoke test on products API

## Environment Variables

### Backend Variables (Set in Render Dashboard)
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<generated-secret>
NODE_ENV=production
FRONTEND_URL=https://easycart-frontend.onrender.com
```

### Frontend Variables
```
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
```

### Admin Variables
```
REACT_APP_API_URL=https://easycart-backend.onrender.com/api
```

## Rollback Procedures

### Automatic Rollback
The pipeline doesn't currently support automatic rollback, but monitors health checks.

### Manual Rollback (Recommended)

#### Option 1: Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select the service to rollback
3. Navigate to "Deployments" tab
4. Find the last stable deployment
5. Click "Redeploy"

#### Option 2: Git Revert
```bash
# Revert the problematic commit
git revert HEAD

# Push to trigger new deployment
git push origin main
```

#### Option 3: Manual Trigger
```bash
# If you have deploy hook configured
curl -X POST "$RENDER_DEPLOY_HOOK_URL"
```

## Monitoring Deployment

### View Logs
1. Go to Render Dashboard
2. Select service
3. Click "Logs" tab
4. Monitor deployment progress

### Check Status
```bash
# Backend health
curl https://easycart-backend.onrender.com/api/health

# Frontend status
curl https://easycart-frontend.onrender.com

# Test products API
curl https://easycart-backend.onrender.com/api/products
```

## Pipeline Configuration

### Workflow File
`.github/workflows/comprehensive-cicd.yml`

### Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` branch

### Manual Trigger
Rollback workflow can be triggered manually via GitHub Actions UI.

## Best Practices

### Before Deployment
1. Run tests locally: `npm test`
2. Build locally to verify: `npm run build`
3. Review changes carefully
4. Test in development environment first

### During Deployment
1. Monitor pipeline execution in GitHub Actions
2. Watch Render dashboard for deployment status
3. Check logs for any errors

### After Deployment
1. Verify all services are healthy
2. Test critical user flows
3. Monitor error logs
4. Check performance metrics

## Troubleshooting

### Pipeline Fails at Test Stage
- Check test logs in GitHub Actions
- Run tests locally to reproduce
- Fix failing tests before pushing

### Pipeline Fails at Build Stage
- Check build logs
- Verify environment variables
- Check for syntax errors

### Deployment Fails
- Check Render service logs
- Verify environment variables are set
- Check MongoDB connection
- Verify build command succeeded

### Health Checks Fail
- Wait longer (services might be cold starting)
- Check Render logs for errors
- Verify service is actually running
- Test endpoints manually

## Optimization Tips

### Speed Up Pipeline
- Use caching for dependencies (already enabled)
- Run tests in parallel (already implemented)
- Skip unnecessary checks on documentation changes

### Reduce Deployment Time
- Optimize build size
- Use build caching
- Consider paid Render plan (no cold starts)

## Security Considerations

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Review security scan results
- Keep dependencies updated
- Monitor for security advisories

## Support

For issues with:
- **Pipeline**: Check GitHub Actions logs
- **Deployment**: Check Render dashboard
- **Services**: Check application logs in Render

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Documentation](https://render.com/docs)
- [OWASP Security Guide](https://owasp.org/)

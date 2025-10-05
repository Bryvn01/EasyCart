# 🔧 Scripts Directory

This directory contains utility scripts for verifying and monitoring the EasyCart application.

---

## Available Scripts

### 📊 verify-production.sh

**Purpose:** Comprehensive production verification script that tests all critical features and endpoints.

**Usage:**
```bash
# Basic usage
./scripts/verify-production.sh

# With custom URLs
BACKEND_URL=https://your-backend.onrender.com \
FRONTEND_URL=https://your-frontend.onrender.com \
./scripts/verify-production.sh
```

**What it checks:**
- ✅ Backend API health
- ✅ Products API with pagination
- ✅ Search functionality
- ✅ Category filtering
- ✅ Price range filtering
- ✅ Sort functionality
- ✅ Frontend accessibility
- ✅ CORS configuration
- ✅ Error handling (404)
- ✅ Performance metrics
- ✅ Image URL validation

**Exit codes:**
- `0` - All tests passed
- `1` - Some tests failed (check output for details)

**Example output:**
```
========================================
EasyCart Production Verification
========================================

Backend URL: https://easycart-backend.onrender.com
Frontend URL: https://easycart-1-752r.onrender.com

========================================
1. Backend API Health Checks
========================================

✓ Backend health endpoint (Status: 200)
✓ Products list endpoint (Status: 200)
✓ Pagination working (Total products: 37)

...

========================================
Verification Summary
========================================

Tests Passed: 15
Tests Failed: 0
Warnings: 1

✓ All critical tests passed!
The system is ready for production use.
```

---

## Creating New Scripts

When adding new scripts to this directory:

1. **Make executable:**
   ```bash
   chmod +x scripts/your-script.sh
   ```

2. **Add shebang:**
   ```bash
   #!/bin/bash
   ```

3. **Add description comment:**
   ```bash
   ###############################################
   # Script Name: your-script.sh
   # Description: Brief description of what it does
   # Usage: ./scripts/your-script.sh [args]
   ###############################################
   ```

4. **Document in this README:**
   Update this file with:
   - Script name and purpose
   - Usage examples
   - What it checks/does
   - Exit codes
   - Example output

---

## Planned Scripts

### health-check.sh (Coming soon)
Continuous health monitoring script that runs in a loop.

**Planned usage:**
```bash
./scripts/health-check.sh &  # Run in background
```

### benchmark.sh (Coming soon)
Performance benchmarking script using Apache Bench or similar.

**Planned usage:**
```bash
./scripts/benchmark.sh --requests 100 --concurrent 10
```

### seed-test-data.sh (Coming soon)
Script to seed test data in staging environment.

**Planned usage:**
```bash
./scripts/seed-test-data.sh staging
```

---

## Integration with CI/CD

These scripts can be integrated into GitHub Actions workflows:

**Example workflow step:**
```yaml
- name: Verify Production
  run: |
    chmod +x scripts/verify-production.sh
    ./scripts/verify-production.sh
```

See `.github/workflows/post-deployment-verification.yml` for full example.

---

## Requirements

All scripts require:
- **bash** (version 4.0+)
- **curl** (for HTTP requests)
- **jq** (for JSON parsing)

### Installing jq

**Ubuntu/Debian:**
```bash
sudo apt-get install jq
```

**macOS:**
```bash
brew install jq
```

**Windows (WSL):**
```bash
sudo apt-get install jq
```

---

## Best Practices

When writing scripts:

1. **Use `set -e`** to exit on first error
2. **Add color output** for better readability
3. **Provide clear success/failure messages**
4. **Include usage instructions** in script comments
5. **Handle errors gracefully**
6. **Document exit codes**
7. **Make scripts idempotent** when possible
8. **Use environment variables** for configuration

---

## Troubleshooting

### Script won't execute
```bash
# Make sure it's executable
chmod +x scripts/verify-production.sh

# Check if bash is available
which bash
```

### jq not found
```bash
# Install jq
sudo apt-get install jq  # Linux
brew install jq          # macOS
```

### Connection timeout
```bash
# Check if backend is accessible
curl https://easycart-backend.onrender.com/api/health

# If on free tier, backend may be sleeping
# Wait 30 seconds and retry
```

### CORS errors
```bash
# These scripts test CORS but may not show full errors
# Use browser DevTools for detailed CORS debugging
```

---

## Contributing

When contributing new scripts:

1. Follow the naming convention: `lowercase-with-dashes.sh`
2. Add comprehensive comments
3. Test on multiple environments
4. Update this README
5. Add to CI/CD if applicable

---

## Support

For issues with scripts:

- **Documentation:** See [POST_MERGE_VERIFICATION.md](../POST_MERGE_VERIFICATION.md)
- **GitHub Issues:** https://github.com/Bryvn01/EasyCart/issues
- **Slack:** #engineering

---

**Last Updated:** [Current Date]  
**Maintained by:** EasyCart Engineering Team

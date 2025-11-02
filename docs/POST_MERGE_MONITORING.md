# Post-Merge Monitoring Guide

## 🎯 Overview

This guide outlines the monitoring and verification procedures to follow after merging a pull request. Proper post-merge monitoring ensures issues are caught early and resolved quickly.

## ⏰ Monitoring Timeline

### Immediate Actions (0-1 hour)

#### For All Merges
1. **Verify Deployment Success**
   ```bash
   # Check deployment status
   curl https://your-api.com/api/health/
   
   # Expected response: 200 OK with healthy status
   ```

2. **Monitor Deployment Logs**
   - Check Render/deployment platform for errors
   - Look for startup errors
   - Verify all services started successfully

3. **Check Error Tracking**
   - Open Sentry/error tracking service
   - Look for new error spikes
   - Verify no critical errors introduced

4. **Quick Smoke Test**
   - Test main user flows
   - Verify homepage loads
   - Check critical features work

#### For Critical PRs
Additional immediate checks:
- [ ] Test the specific fixed functionality
- [ ] Verify in production environment
- [ ] Check database integrity
- [ ] Monitor server resources (CPU, memory)
- [ ] Alert team of successful deployment

### Short-Term Actions (1-24 hours)

1. **Performance Monitoring**
   ```bash
   # Check response times
   curl -w "@curl-format.txt" -o /dev/null -s https://your-api.com/api/products/
   
   # Monitor key metrics
   - API response times
   - Page load times
   - Time to interactive
   - First contentful paint
   ```

2. **Error Rate Analysis**
   - Compare error rates before/after deploy
   - Investigate any new error patterns
   - Check for regression in existing features

3. **User Behavior Analytics**
   - Monitor user engagement metrics
   - Check conversion rates
   - Track bounce rates
   - Verify analytics events firing

4. **Database Performance**
   - Check query performance
   - Monitor connection pool usage
   - Verify no slow queries introduced
   - Check database size/growth

5. **Resource Utilization**
   - CPU usage
   - Memory consumption
   - Disk I/O
   - Network bandwidth

### Medium-Term Actions (1-7 days)

1. **User Feedback Collection**
   - Monitor support tickets
   - Check social media mentions
   - Review user feedback forms
   - Analyze session recordings (if available)

2. **A/B Test Analysis** (if applicable)
   - Compare metrics between variants
   - Statistical significance check
   - User behavior differences

3. **Performance Trends**
   - Week-over-week comparison
   - Identify any degradation patterns
   - Verify improvements sustained

## 🚨 Rollback Criteria

Immediately rollback if any of the following occur:

### Critical Issues (Rollback Immediately)
- [ ] Core functionality broken (checkout, login, product display)
- [ ] Security vulnerability introduced
- [ ] Database corruption or data loss
- [ ] Error rate spike >5%
- [ ] Site completely down or inaccessible
- [ ] Payment processing failures

### High-Severity Issues (Rollback within 1 hour)
- [ ] Performance degradation >20%
- [ ] Major feature broken for all users
- [ ] API returning 500 errors consistently
- [ ] Memory leaks causing service crashes
- [ ] Third-party service integration failures

### Medium-Severity Issues (Consider Rollback or Hotfix)
- [ ] Feature broken for subset of users
- [ ] Performance degradation 10-20%
- [ ] Minor data inconsistencies
- [ ] Non-critical API failures
- [ ] UI rendering issues

## 🔄 Rollback Procedure

### Quick Rollback
```bash
# 1. Revert the merge commit
git revert -m 1 <merge-commit-sha>
git push origin main

# 2. Or revert to previous commit
git reset --hard <previous-commit-sha>
git push --force origin main

# 3. Trigger redeployment
# (Depends on your deployment setup)
```

### Deployment Platform Rollback
Most platforms (Render, Vercel, Heroku) offer one-click rollback:
1. Go to deployment dashboard
2. Find previous successful deployment
3. Click "Rollback" or "Redeploy"
4. Verify rollback successful

### Post-Rollback Actions
1. **Notify Team**
   - Post in team chat
   - Update PR with rollback reason
   - Create hotfix issue if needed

2. **Document the Issue**
   ```markdown
   ## Rollback Report
   
   **PR Rolled Back:** #123
   **Rollback Time:** 2024-11-02 14:30 UTC
   **Reason:** Critical checkout failure
   **Impact:** 15 minutes of downtime
   **Root Cause:** [Brief explanation]
   **Next Steps:** [Plan to fix and redeploy]
   ```

3. **Investigate Root Cause**
   - Review logs and errors
   - Reproduce issue locally
   - Identify what was missed in review
   - Plan proper fix

## 📊 Monitoring Checklist by PR Type

### Bug Fix PRs
- [ ] Verify bug is actually fixed in production
- [ ] Check no regression in related features
- [ ] Monitor error rates for related functionality
- [ ] Confirm fix works across all browsers/devices

### Performance PRs
- [ ] Verify performance improvements realized
  - Before/after metrics documented
  - User-facing metrics improved
  - No trade-offs in other areas
- [ ] Monitor bundle size
- [ ] Check API response times
- [ ] Verify caching working as expected

### Feature PRs
- [ ] Verify feature accessible in production
- [ ] Test feature across browsers
- [ ] Check analytics tracking working
- [ ] Monitor feature adoption rate
- [ ] Verify no impact on existing features

### Security PRs
- [ ] Verify security issue resolved
- [ ] No new vulnerabilities introduced
- [ ] Audit logs showing proper access control
- [ ] Security scans pass
- [ ] Penetration test if critical

### Accessibility PRs
- [ ] Test with screen readers
- [ ] Verify keyboard navigation
- [ ] Check color contrast
- [ ] Test with accessibility tools
- [ ] Verify ARIA labels present

## 🔍 Monitoring Tools

### Essential Tools

1. **Error Tracking**
   - Sentry
   - Rollbar
   - Bugsnag

2. **Performance Monitoring**
   - Lighthouse CI
   - New Relic
   - DataDog
   - Google Analytics

3. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

4. **Log Aggregation**
   - Papertrail
   - Loggly
   - CloudWatch Logs

5. **Real User Monitoring (RUM)**
   - Google Analytics
   - Mixpanel
   - Amplitude

### Monitoring Commands

```bash
# Check API health
curl https://api.easycart.com/health/

# Check frontend
curl -I https://easycart.com/

# Monitor logs (if using SSH)
tail -f /var/log/application.log

# Check deployment status
render ps  # For Render
heroku ps  # For Heroku

# Database query performance
python manage.py dbshell
\timing on
SELECT * FROM products_product LIMIT 10;
```

## 📈 Key Metrics to Monitor

### Application Health
- **Uptime**: Target 99.9%
- **Error Rate**: <1%
- **API Response Time**: <200ms (p95)
- **Page Load Time**: <3s

### User Experience
- **Time to Interactive**: <5s
- **First Contentful Paint**: <1.5s
- **Bounce Rate**: Monitor for increases
- **Conversion Rate**: Monitor for decreases

### Infrastructure
- **CPU Usage**: <70% sustained
- **Memory Usage**: <80%
- **Database Connections**: Within pool limits
- **Disk Space**: >20% free

### Business Metrics
- **Order Completion Rate**
- **Add to Cart Rate**
- **Search Success Rate**
- **User Registration Rate**

## 📝 Monitoring Report Template

```markdown
## Post-Merge Monitoring Report

**PR:** #123 - [PR Title]
**Merged:** 2024-11-02 10:00 UTC
**Deployed:** 2024-11-02 10:15 UTC
**Monitored By:** [Your Name]

### Deployment Status
- [ ] Deployment successful
- [ ] All services started
- [ ] Health checks passing

### Immediate Checks (1 hour)
- [ ] No critical errors
- [ ] Core functionality working
- [ ] Performance within acceptable range

### Short-Term Checks (24 hours)
- [ ] Error rate: [X%] (baseline: [Y%])
- [ ] Response time: [Xms] (baseline: [Yms])
- [ ] User feedback: [positive/negative/mixed]

### Issues Detected
[List any issues found, or "None"]

### Actions Taken
[List any actions, or "None required"]

### Recommendations
[Any recommendations for future deployments]
```

## 🎯 Success Criteria

A merge is considered successful if after 24 hours:
- [ ] No rollback required
- [ ] Error rate within normal range
- [ ] Performance metrics maintained or improved
- [ ] No critical user complaints
- [ ] Core functionality working as expected
- [ ] All monitoring checks passed

## 📞 Escalation Process

### Low Severity
- Document in issue tracker
- Fix in next sprint

### Medium Severity
- Create hotfix ticket
- Assign to relevant developer
- Fix within 1-2 days

### High Severity
- Alert team immediately
- Create hotfix PR
- Fast-track review and merge
- Monitor closely after deploy

### Critical Severity
- **Immediately:**
  1. Alert all team members
  2. Assess rollback necessity
  3. Execute rollback if needed
  4. Communicate to stakeholders

- **Within 1 hour:**
  1. Incident report created
  2. Root cause investigation started
  3. Hotfix plan documented

- **Within 24 hours:**
  1. Hotfix deployed or timeline established
  2. Post-mortem scheduled
  3. Affected users notified

## 📚 Related Documentation

- [PR Management Guidelines](PR_MANAGEMENT_GUIDELINES.md)
- [Deployment Guide](../DEPLOYMENT.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Security Policy](../SECURITY.md)

---

**Last Updated:** 2024-11
**Version:** 1.0

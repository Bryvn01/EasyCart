# ⚡ Performance Issue Template

Use this template to report performance degradation after the Products page API integration.

---

## Performance Issue

**Title:** [Brief description of the performance problem]

**Severity:** [ ] Critical (app unusable) | [ ] High (significant lag) | [ ] Medium (noticeable delay) | [ ] Low (minor issue)

---

## Affected Component

- [ ] Products page loading
- [ ] API response time
- [ ] Search/filter operations
- [ ] Pagination
- [ ] Image loading
- [ ] Other: [specify]

---

## Metrics

**Current Performance:**
- Load time: [X] seconds
- API response time: [X] ms
- Time to Interactive: [X] seconds
- First Contentful Paint: [X] seconds

**Expected Performance:**
- Load time: < 2 seconds
- API response time: < 1000ms
- Time to Interactive: < 3 seconds

**Performance Delta:**
- Before merge: [X] seconds
- After merge: [X] seconds
- Degradation: [X%]

---

## Environment

- **Network:** [ ] WiFi | [ ] 4G | [ ] 5G | [ ] 3G
- **Device:** [e.g., iPhone 14, Samsung Galaxy S23, Desktop PC]
- **Browser:** [e.g., Chrome 120, Safari 17]
- **Location:** [Geographic location if relevant]

---

## Steps to Reproduce

1. Navigate to [URL]
2. Perform [action]
3. Observe [slow behavior]

---

## Performance Measurements

### Browser DevTools Timeline
[Attach screenshot of Performance tab timeline]

### Lighthouse Score
```
Performance: [score]
First Contentful Paint: [time]
Largest Contentful Paint: [time]
Time to Interactive: [time]
Total Blocking Time: [time]
```

### Network Waterfall
[Attach screenshot showing slow requests]

---

## Potential Causes

- [ ] Slow database query
- [ ] Large API response payload
- [ ] Missing caching
- [ ] Unoptimized images
- [ ] Too many API calls
- [ ] Render blocking resources
- [ ] Other: [specify]

---

## Suggested Solutions

[Your ideas for improving performance]

---

## Impact Assessment

**Affected Users:** [What % of users experience this?]

**Business Impact:**
- [ ] Users abandoning the page
- [ ] Reduced conversions
- [ ] Negative feedback
- [ ] SEO impact

---

**Reported by:** @[username]
**Date:** [YYYY-MM-DD]

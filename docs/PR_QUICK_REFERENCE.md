# PR Management Quick Reference

## 🎯 Priority Levels & Timelines

| Priority | Types | Review Timeline | Examples |
|----------|-------|-----------------|----------|
| 🔴 Critical | User-facing failures | Same day | Content not loading, checkout broken, login fails |
| 🟠 High | Performance & Security | 1-2 days | Slow page loads, security vulnerabilities, API issues |
| 🟡 Medium | Accessibility & Features | 3-5 days | ARIA labels, keyboard nav, feature enhancements |
| 🟢 Low | Documentation & Refactor | 1-2 weeks | Docs updates, code cleanup, minor improvements |

## ✅ Pre-Merge Checklist

### For All PRs
- [ ] All CI checks pass
- [ ] Code review approved by at least 1 reviewer
- [ ] No merge conflicts
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] PR template fully completed

### For Critical PRs
- [ ] Tested on Chrome, Safari, Firefox
- [ ] Tested on mobile and desktop
- [ ] Regression tests added
- [ ] Monitoring plan in place

### For Security PRs
- [ ] Security review by 2+ reviewers
- [ ] No hardcoded secrets
- [ ] Dependencies scanned for vulnerabilities
- [ ] Security tests added

### For Performance PRs
- [ ] Before/after metrics documented
- [ ] Bundle size impact < 10% or justified
- [ ] Load time improvements measured
- [ ] No performance regression

## 🏷️ Common Labels

### Type
- `bug` - Bug fixes
- `enhancement` - New features
- `performance` - Performance improvements
- `security` - Security fixes
- `accessibility` - A11y improvements
- `documentation` - Docs updates

### Priority
- `critical` - Immediate attention
- `priority: high` - Review within 1-2 days
- `priority: medium` - Review within 3-5 days
- `priority: low` - Review within 1-2 weeks

### Area
- `frontend` - React/UI changes
- `backend` - Django/API changes
- `database` - DB schema/migrations
- `infrastructure` - CI/CD, deployment
- `testing` - Test additions/updates

### Status
- `needs-review` - Awaiting review
- `changes-requested` - Needs updates
- `ready-to-merge` - Approved, waiting for merge
- `blocked` - Blocked by dependencies

## 🚫 Common Rejection Reasons

1. **Incomplete PR Template** - Fill out all required sections
2. **No Tests** - Add tests for new functionality
3. **Failed CI** - Fix linting, tests, or build errors
4. **Security Issues** - Address security vulnerabilities
5. **Breaking Changes** - Document and justify breaking changes
6. **Poor Documentation** - Add clear comments and docs

## 🔍 Review Focus Areas

### Code Quality
- Follows style guide
- DRY principles
- Proper error handling
- Meaningful names
- No console warnings

### Testing
- Unit tests for logic
- Integration tests for APIs
- Edge cases covered
- Test coverage maintained

### Security
- No secrets in code
- Input validation
- SQL injection prevention
- XSS protection
- Secure dependencies

### Performance
- Bundle size impact
- API efficiency
- Database query optimization
- Caching strategies
- Lazy loading

## 📝 Feedback Examples

### Good Feedback ✅
```markdown
**Issue:** This function could cause a memory leak if the component unmounts.

**Why it matters:** Users might experience browser slowdown over time.

**Suggestion:** Use a cleanup function in useEffect:
```javascript
useEffect(() => {
  const interval = setInterval(...);
  return () => clearInterval(interval);
}, []);
```

### Bad Feedback ❌
- "This could be better" (too vague)
- "I don't like this approach" (subjective without reasoning)
- "Please fix" (not specific)

## 🚀 Merge Strategies

- **Squash and Merge** - Use for feature branches (default)
- **Rebase and Merge** - Use for bug fixes
- **Merge Commit** - Use for major features with meaningful history

## 📊 Post-Merge Monitoring

### Immediate (1 hour)
- [ ] Check deployment logs
- [ ] Verify feature works in production
- [ ] Monitor error rates

### Short-term (24 hours)
- [ ] Review user feedback
- [ ] Check analytics
- [ ] Monitor performance metrics

### Rollback If:
- Critical functionality broken
- Error rate > 5%
- Performance degraded > 20%
- Security vulnerability introduced

## 🔗 Quick Links

- [Full PR Management Guidelines](PR_MANAGEMENT_GUIDELINES.md)
- [PR Template](.github/PULL_REQUEST_TEMPLATE.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Security Policy](../SECURITY.md)
- [Code Style Guide](code-style.md)

## 💡 Tips for Authors

1. **Keep PRs Small** - Easier to review, faster to merge
2. **Write Clear Descriptions** - Explain what and why
3. **Add Tests** - Show your code works
4. **Update Docs** - Help future contributors
5. **Respond Quickly** - Address feedback promptly
6. **Be Patient** - Quality reviews take time

## 💡 Tips for Reviewers

1. **Be Specific** - Point to exact lines and issues
2. **Be Kind** - Assume positive intent
3. **Be Timely** - Review within priority timeline
4. **Be Thorough** - Check code, tests, docs, security
5. **Be Helpful** - Suggest solutions, not just problems
6. **Be Consistent** - Apply standards fairly

## 🆘 Need Help?

- Questions? Open a discussion
- Security concerns? See SECURITY.md
- Blocked? Tag maintainers in PR
- Urgent? Contact core team directly

---

**Last Updated:** 2024-11
**Version:** 1.0

# CI/CD Build-Test-Lint Best Practices Checklist

## Pre-commit (Local)
- [ ] Run `npm run lint` or `yarn lint` and fix all issues
- [ ] Run `npm run format` or `yarn format` to auto-format code
- [ ] Run all tests locally (`npm test` or `yarn test`)
- [ ] Run `npm run build` or `yarn build` to ensure build passes
- [ ] Check for empty or placeholder test files and remove/fix them
- [ ] Review and update dependencies carefully, checking for breaking changes

## CI/CD Pipeline
- [ ] Ensure all required environment variables are set in CI
- [ ] Configure jobs to fail fast (stop on first error)
- [ ] Use caching for dependencies to speed up builds
- [ ] Separate lint, test, and build steps for clear feedback
- [ ] Review CI logs regularly for flaky or slow tests
- [ ] Document common errors and fixes in the repository

## Ongoing Maintenance
- [ ] Regularly update dependencies and CI workflows
- [ ] Refactor and remove unused code/tests
- [ ] Keep documentation up to date

---

_Use this checklist before every push and PR to reduce CI/CD failures and keep your project healthy._

# Security and Dependency Audit Notes

## Known Vulnerabilities in Frontend Dependencies

This project uses `react-scripts` (Create React App) and related dependencies. As of October 2025, there are known vulnerabilities in deep dependencies (e.g., `nth-check`, `svgo`, `webpack-dev-server`, `postcss`) that cannot be resolved without breaking the build (the only available fix is to downgrade `react-scripts` to `0.0.0`, which is not viable).

- See advisories:
  - https://github.com/advisories/GHSA-rp65-9cf3-cjxr (nth-check)
  - https://github.com/advisories/GHSA-7fh5-64p2-3v2j (postcss)
  - https://github.com/advisories/GHSA-9jgg-88mc-972h (webpack-dev-server)
  - https://github.com/advisories/GHSA-4v9v-hfq4-rm2v (webpack-dev-server)

**We are monitoring for upstream fixes via Dependabot.**

- All other dependencies are kept up to date.
- No production code is affected by these vulnerabilities; they are only present in development tooling.
- We do NOT use `npm audit fix --force` as it would break the project.

If/when upstream fixes are released, we will update immediately.

#!/bin/bash
# Dependabot PR Merge Script - Systematically merge dependency updates

set -e

echo "🤖 Dependabot PR Merge Tool"
echo "============================"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Install from: https://cli.github.com/"
    exit 1
fi

# Authenticate
gh auth status || gh auth login

echo ""
echo "📊 Dependabot PR Statistics:"
TOTAL=$(gh pr list --author "app/dependabot" --state open --json number --jq 'length')
echo "Total Open PRs: $TOTAL"

if [ "$TOTAL" -eq 0 ]; then
    echo "✅ No Dependabot PRs to merge!"
    exit 0
fi

echo ""
echo "🔴 Phase 1: Critical Security Updates"
echo "--------------------------------------"
gh pr list --author "app/dependabot" --search "security" --state open \
  --json number,title,statusCheckRollup \
  --jq '.[] | "\(.number): \(.title) - Status: \(.statusCheckRollup[0].conclusion // "pending")"'

echo ""
read -p "Merge critical security PRs? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    gh pr list --author "app/dependabot" --search "security" --state open \
      --json number,statusCheckRollup \
      --jq '.[] | select(.statusCheckRollup[0].conclusion == "SUCCESS") | .number' \
      | xargs -I {} gh pr merge {} --auto --squash
    echo "✅ Merged critical security PRs"
fi

echo ""
echo "🟠 Phase 2: Core Framework Updates (Django, React)"
echo "---------------------------------------------------"
gh pr list --author "app/dependabot" --search "Django OR react" --state open \
  --json number,title,statusCheckRollup \
  --jq '.[] | "\(.number): \(.title) - Status: \(.statusCheckRollup[0].conclusion // "pending")"'

echo ""
read -p "Merge core framework PRs? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    gh pr list --author "app/dependabot" --search "Django OR react" --state open \
      --json number,statusCheckRollup \
      --jq '.[] | select(.statusCheckRollup[0].conclusion == "SUCCESS") | .number' \
      | xargs -I {} gh pr merge {} --auto --squash
    echo "✅ Merged core framework PRs"
fi

echo ""
echo "🟡 Phase 3: Patch Updates (Safe)"
echo "---------------------------------"
gh pr list --author "app/dependabot" --state open \
  --json number,title,labels \
  --jq '.[] | select(.labels[].name == "dependencies") | "\(.number): \(.title)"' \
  | head -10

echo ""
read -p "Merge remaining patch updates? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    gh pr list --author "app/dependabot" --state open \
      --json number,statusCheckRollup \
      --jq '.[] | select(.statusCheckRollup[0].conclusion == "SUCCESS") | .number' \
      | head -10 \
      | xargs -I {} gh pr merge {} --auto --squash
    echo "✅ Merged patch updates"
fi

echo ""
echo "✅ Merge process complete!"
echo ""
echo "Remaining PRs:"
gh pr list --author "app/dependabot" --state open --json number --jq 'length' | xargs -I {} echo "Open: {}"

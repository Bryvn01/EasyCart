#!/bin/bash
# Issue Triage Script - Systematically categorize and prioritize issues

set -e

echo "🔍 EasyCart Issue Triage Tool"
echo "================================"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Install from: https://cli.github.com/"
    exit 1
fi

# Authenticate
gh auth status || gh auth login

echo ""
echo "📊 Current Issue Statistics:"
gh issue list --state open --json number,title,labels --jq 'length' | xargs -I {} echo "Total Open Issues: {}"

echo ""
echo "🏷️  Step 1: Adding Priority Labels"
echo "-----------------------------------"

# List issues without priority labels
echo "Issues needing priority labels:"
gh issue list --state open --json number,title,labels \
  --jq '.[] | select(.labels | map(.name) | any(startswith("priority:")) | not) | "\(.number): \(.title)"' \
  | head -10

echo ""
echo "🏷️  Step 2: Adding Type Labels"
echo "-------------------------------"

# List issues without type labels
echo "Issues needing type labels:"
gh issue list --state open --json number,title,labels \
  --jq '.[] | select(.labels | map(.name) | any(startswith("type:")) | not) | "\(.number): \(.title)"' \
  | head -10

echo ""
echo "🧹 Step 3: Identifying Stale Issues"
echo "------------------------------------"

# List issues older than 90 days with no activity
echo "Stale issues (>90 days, no activity):"
gh issue list --state open --json number,title,updatedAt \
  --jq '.[] | select(.updatedAt | fromdateiso8601 < (now - 7776000)) | "\(.number): \(.title) (Last updated: \(.updatedAt))"' \
  | head -10

echo ""
echo "🔄 Step 4: Identifying Duplicates"
echo "----------------------------------"
echo "Review issues manually for duplicates"

echo ""
echo "✅ Triage Complete!"
echo ""
echo "Next steps:"
echo "1. Review issues listed above"
echo "2. Add labels: gh issue edit <number> --add-label 'priority: high'"
echo "3. Close stale: gh issue close <number> --reason 'not planned'"
echo "4. Link duplicates: gh issue comment <number> --body 'Duplicate of #<original>'"

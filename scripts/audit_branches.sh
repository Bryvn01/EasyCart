#!/bin/bash
# Branch Audit Script - Analyzes repository branch health

echo "🔍 EasyCart Branch Audit Report"
echo "================================"
echo ""

# Total branches
TOTAL=$(git branch -r | wc -l)
echo "📊 Total remote branches: $TOTAL"
echo ""

# Merged branches
echo "✅ Merged branches (safe to delete):"
git branch -r --merged origin/main | grep -v "main\|develop\|HEAD" | wc -l
echo ""

# Unmerged branches
echo "⚠️  Unmerged branches (needs review):"
git branch -r --no-merged origin/main | grep -v "main\|develop\|HEAD" | wc -l
echo ""

# Copilot branches
echo "🤖 Copilot fix branches:"
git branch -r | grep "copilot/fix" | wc -l
echo ""

# Dependabot branches
echo "📦 Dependabot branches:"
git branch -r | grep "dependabot" | wc -l
echo ""

# Stale branches (>60 days)
echo "🕰️  Stale branches (>60 days no commits):"
git for-each-ref --sort=-committerdate refs/remotes/ \
  --format='%(committerdate:short) %(refname:short)' | \
  awk -v date="$(date -d '60 days ago' +%Y-%m-%d 2>/dev/null || date -v-60d +%Y-%m-%d)" \
  '$1 < date {print}' | wc -l
echo ""

# Generate detailed reports
echo "📝 Generating detailed reports..."

# Merged branches list
git branch -r --merged origin/main | \
  grep -v "main\|develop\|HEAD" | \
  sed 's/origin\///' > reports/merged_branches.txt

# Stale branches list
git for-each-ref --sort=-committerdate refs/remotes/ \
  --format='%(committerdate:short) %(refname:short)' | \
  awk -v date="$(date -d '60 days ago' +%Y-%m-%d 2>/dev/null || date -v-60d +%Y-%m-%d)" \
  '$1 < date {print}' > reports/stale_branches.txt

# Copilot branches
git branch -r | grep "copilot/fix" | sed 's/origin\///' > reports/copilot_branches.txt

# Dependabot branches
git branch -r | grep "dependabot" | sed 's/origin\///' > reports/dependabot_branches.txt

echo "✅ Reports saved to reports/ directory"
echo ""
echo "📋 Next steps:"
echo "1. Review reports/merged_branches.txt"
echo "2. Run delete_merged_branches.sh (after review)"
echo "3. Review reports/stale_branches.txt"
echo "4. Close stale PRs manually"

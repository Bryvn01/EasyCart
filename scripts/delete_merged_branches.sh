#!/bin/bash
# Delete Merged Branches Script - DANGEROUS: Review before running!

set -e

echo "🗑️  Delete Merged Branches"
echo "=========================="
echo ""
echo "⚠️  WARNING: This will delete remote branches!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Create reports directory
mkdir -p reports

# Get merged branches
MERGED=$(git branch -r --merged origin/main | \
  grep -v "main\|develop\|HEAD" | \
  sed 's/origin\///' | \
  sed 's/^[[:space:]]*//')

COUNT=$(echo "$MERGED" | grep -c . || echo "0")

if [ "$COUNT" -eq 0 ]; then
  echo "✅ No merged branches to delete"
  exit 0
fi

echo "Found $COUNT merged branches:"
echo "$MERGED"
echo ""
echo "Save list to reports/deleted_branches_$(date +%Y%m%d).txt"
echo "$MERGED" > "reports/deleted_branches_$(date +%Y%m%d).txt"
echo ""

# Confirm deletion
echo "⚠️  Delete these $COUNT branches? (yes/no)"
read CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Cancelled"
  exit 1
fi

# Delete branches in batches
DELETED=0
FAILED=0

echo ""
echo "🗑️  Deleting branches..."

while IFS= read -r branch; do
  if [ -n "$branch" ]; then
    echo "Deleting: $branch"
    if git push origin --delete "$branch" 2>/dev/null; then
      ((DELETED++))
      echo "  ✅ Deleted"
    else
      ((FAILED++))
      echo "  ❌ Failed"
      echo "$branch" >> "reports/failed_deletions_$(date +%Y%m%d).txt"
    fi
  fi
done <<< "$MERGED"

echo ""
echo "📊 Summary:"
echo "  Deleted: $DELETED"
echo "  Failed: $FAILED"
echo ""

# Prune local references
echo "🧹 Pruning local references..."
git remote prune origin

echo "✅ Done!"

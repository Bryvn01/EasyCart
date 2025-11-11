#!/bin/bash
# Batch merge all passing Dependabot PRs
# Usage: ./merge-dependabot-prs.sh [--dry-run] [--auto-approve]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

DRY_RUN=false
AUTO_APPROVE=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            ;;
        --auto-approve)
            AUTO_APPROVE=true
            ;;
    esac
done

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🤖 Dependabot PR Batch Merge Script                      ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "\n${YELLOW}🔍 DRY RUN MODE - No PRs will be merged${NC}"
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed!${NC}"
    echo -e "${YELLOW}📥 Install it from: https://cli.github.com/${NC}"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub!${NC}"
    echo -e "${YELLOW}🔑 Run: gh auth login${NC}"
    exit 1
fi

echo -e "${CYAN}📋 Fetching Dependabot PRs...${NC}"

# Get all open Dependabot PRs
PR_DATA=$(gh pr list --state open --author "app/dependabot" --json number,title,url,statusCheckRollup,mergeable --limit 100)
PR_COUNT=$(echo "$PR_DATA" | jq '. | length')

if [ "$PR_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}ℹ️  No open Dependabot PRs found${NC}"
    exit 0
fi

echo -e "${GREEN}✅ Found $PR_COUNT Dependabot PRs${NC}"
echo -e "\n${CYAN}📊 Analyzing PR status...${NC}"

# Arrays to track PRs
READY_TO_MERGE=()
PENDING=()
NOT_READY=()

# Process each PR
while IFS= read -r pr_number; do
    PR_INFO=$(echo "$PR_DATA" | jq -r ".[] | select(.number==$pr_number)")
    PR_TITLE=$(echo "$PR_INFO" | jq -r '.title')
    PR_MERGEABLE=$(echo "$PR_INFO" | jq -r '.mergeable')

    # Check if PR is mergeable
    if [ "$PR_MERGEABLE" != "MERGEABLE" ]; then
        NOT_READY+=("$pr_number")
        echo -e "  ${RED}❌ #$pr_number: $PR_TITLE - Not mergeable${NC}"
        continue
    fi

    # Check status checks
    STATUS_CHECKS=$(echo "$PR_INFO" | jq -r '.statusCheckRollup')

    if [ "$STATUS_CHECKS" = "null" ] || [ "$STATUS_CHECKS" = "[]" ]; then
        PENDING+=("$pr_number")
        echo -e "  ${YELLOW}⏳ #$pr_number: $PR_TITLE - Checks still running${NC}"
        continue
    fi

    # Check if all checks passed
    FAILED_CHECKS=$(echo "$PR_INFO" | jq -r '[.statusCheckRollup[] | select(.conclusion != "SUCCESS" and .conclusion != "SKIPPED")] | length')

    if [ "$FAILED_CHECKS" -gt 0 ]; then
        NOT_READY+=("$pr_number")
        echo -e "  ${RED}❌ #$pr_number: $PR_TITLE - Failed checks${NC}"
    else
        READY_TO_MERGE+=("$pr_number")
        echo -e "  ${GREEN}✅ #$pr_number: $PR_TITLE${NC}"
    fi

done < <(echo "$PR_DATA" | jq -r '.[].number')

# Summary
echo -e "\n${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}📊 Summary:${NC}"
echo -e "  ${GREEN}✅ Ready to merge: ${#READY_TO_MERGE[@]}${NC}"
echo -e "  ${YELLOW}⏳ Pending checks: ${#PENDING[@]}${NC}"
echo -e "  ${RED}❌ Not ready: ${#NOT_READY[@]}${NC}"
echo -e "  ${CYAN}📋 Total PRs: $PR_COUNT${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

if [ ${#READY_TO_MERGE[@]} -eq 0 ]; then
    echo -e "\n${YELLOW}💡 No PRs are ready to merge yet.${NC}"
    if [ ${#PENDING[@]} -gt 0 ]; then
        echo -e "   ${YELLOW}⏳ ${#PENDING[@]} PR(s) still have checks running. Try again in a few minutes!${NC}"
    fi
    exit 0
fi

# Merge PRs
if [ "$DRY_RUN" = false ]; then
    echo -e "\n${CYAN}🚀 Starting merge process...${NC}"

    MERGE_COUNT=0
    FAIL_COUNT=0

    for pr_number in "${READY_TO_MERGE[@]}"; do
        PR_TITLE=$(echo "$PR_DATA" | jq -r ".[] | select(.number==$pr_number) | .title")
        echo -e "\n${CYAN}📦 Processing PR #$pr_number: $PR_TITLE${NC}"

        # Auto-approve if requested
        if [ "$AUTO_APPROVE" = true ]; then
            if gh pr review "$pr_number" --approve --body "✅ Automated approval: All checks passed" 2>/dev/null; then
                echo -e "  ${GREEN}✅ Approved PR #$pr_number${NC}"
            fi
        fi

        # Merge PR
        echo -e "  ${CYAN}🔄 Merging PR #$pr_number...${NC}"
        if gh pr merge "$pr_number" --squash --auto --delete-branch 2>/dev/null; then
            echo -e "  ${GREEN}✅ Successfully merged: $PR_TITLE${NC}"
            ((MERGE_COUNT++))
        else
            echo -e "  ${RED}❌ Failed to merge PR #$pr_number${NC}"
            ((FAIL_COUNT++))
        fi

        sleep 2  # Rate limiting
    done

    # Final summary
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║   🎉 Merge Complete!                                       ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo -e "\n${GREEN}✅ Successfully merged: $MERGE_COUNT PRs${NC}"

    if [ $FAIL_COUNT -gt 0 ]; then
        echo -e "${RED}❌ Failed to merge: $FAIL_COUNT PRs${NC}"
    fi

    if [ ${#PENDING[@]} -gt 0 ]; then
        echo -e "${YELLOW}⏳ Still pending: ${#PENDING[@]} PRs (run script again later)${NC}"
    fi
else
    echo -e "\n${YELLOW}🔍 DRY RUN - Would merge the following PRs:${NC}"
    for pr_number in "${READY_TO_MERGE[@]}"; do
        PR_INFO=$(echo "$PR_DATA" | jq -r ".[] | select(.number==$pr_number)")
        PR_TITLE=$(echo "$PR_INFO" | jq -r '.title')
        PR_URL=$(echo "$PR_INFO" | jq -r '.url')
        echo -e "  ${CYAN}• #$pr_number: $PR_TITLE${NC}"
        echo -e "    ${YELLOW}$PR_URL${NC}"
    done
    echo -e "\n${GREEN}💡 Run without --dry-run to actually merge these PRs${NC}"
fi

echo -e "\n${GREEN}✨ Done!${NC}"

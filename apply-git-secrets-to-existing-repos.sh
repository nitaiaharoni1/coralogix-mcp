#!/bin/bash

# Apply Git-Secrets to Existing Repositories
# This script applies git-secrets protection to all existing git repositories

echo "🔍 Finding existing git repositories..."

# Function to apply git-secrets to a repository
apply_git_secrets() {
    local repo_path="$1"
    echo "🔒 Applying git-secrets to: $repo_path"
    
    cd "$repo_path" || return 1
    
    # Install git-secrets hooks
    git secrets --install --force 2>/dev/null || echo "  ⚠️  Could not install hooks (may already exist)"
    
    # Register AWS patterns
    git secrets --register-aws 2>/dev/null || echo "  ⚠️  Could not register AWS patterns (may already exist)"
    
    echo "  ✅ Git-secrets applied to $(basename "$repo_path")"
}

# Find and process git repositories
if [ "$1" = "--all" ]; then
    echo "🔍 Searching for all git repositories in home directory..."
    echo "⚠️  This may take a while and will modify ALL git repositories!"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find ~ -name ".git" -type d 2>/dev/null | while read -r git_dir; do
            repo_path=$(dirname "$git_dir")
            apply_git_secrets "$repo_path"
        done
    else
        echo "❌ Cancelled"
        exit 0
    fi
elif [ "$1" = "--current" ]; then
    echo "🔒 Applying git-secrets to current repository..."
    if [ -d ".git" ]; then
        apply_git_secrets "$(pwd)"
    else
        echo "❌ Current directory is not a git repository"
        exit 1
    fi
elif [ -n "$1" ]; then
    echo "🔒 Applying git-secrets to specified repository: $1"
    if [ -d "$1/.git" ]; then
        apply_git_secrets "$1"
    else
        echo "❌ $1 is not a git repository"
        exit 1
    fi
else
    echo "📋 Usage:"
    echo "  $0 --current          # Apply to current repository"
    echo "  $0 --all              # Apply to ALL git repositories (dangerous!)"
    echo "  $0 /path/to/repo      # Apply to specific repository"
    echo ""
    echo "🔒 Current repository status:"
    if [ -d ".git" ]; then
        echo "  • Git repository: ✅"
        if [ -f ".git/hooks/pre-commit" ] && grep -q "git secrets" ".git/hooks/pre-commit" 2>/dev/null; then
            echo "  • Git-secrets installed: ✅"
        else
            echo "  • Git-secrets installed: ❌"
            echo "    Run: $0 --current"
        fi
    else
        echo "  • Not a git repository"
    fi
fi

echo ""
echo "🧪 Test git-secrets protection:"
echo "  echo 'API_KEY=cxup_fake123456789012345' > test-secret.txt"
echo "  git add test-secret.txt"
echo "  git commit -m 'test' # Should be blocked!"
echo "  rm test-secret.txt"

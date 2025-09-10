#!/bin/bash

# Global Git-Secrets Setup Script
# This script sets up git-secrets globally for all repositories

echo "🔒 Setting up Git-Secrets globally..."

# Install git-secrets globally using templates
echo "📦 Installing git-secrets templates..."
git secrets --install ~/.git-templates/git-secrets
git config --global init.templateDir ~/.git-templates/git-secrets

# Register AWS patterns globally
echo "🔍 Registering AWS secret patterns..."
git secrets --register-aws --global

# Add custom patterns globally
echo "🔍 Adding custom secret patterns..."

# Coralogix API keys
git secrets --add --global 'cxup_[A-Za-z0-9]{20,}'

# GitHub tokens
git secrets --add --global 'ghp_[A-Za-z0-9]{36}'
git secrets --add --global 'gho_[A-Za-z0-9]{36}'
git secrets --add --global 'ghu_[A-Za-z0-9]{36}'
git secrets --add --global 'ghs_[A-Za-z0-9]{36}'
git secrets --add --global 'ghr_[A-Za-z0-9]{36}'

# OpenAI API keys
git secrets --add --global 'sk-[A-Za-z0-9]{20,}'

# Stripe keys
git secrets --add --global 'sk_live_[A-Za-z0-9]{24,}'
git secrets --add --global 'pk_live_[A-Za-z0-9]{24,}'

# Private keys
git secrets --add --global -- '-----BEGIN [A-Z]+ PRIVATE KEY-----'

# Generic long tokens (be careful with this one)
git secrets --add --global '[a-zA-Z0-9_-]{40,}'

echo "✅ Global git-secrets setup complete!"
echo ""
echo "📋 What this means:"
echo "  • All NEW repositories will automatically have git-secrets protection"
echo "  • Existing repositories need to be updated manually"
echo ""
echo "🔧 To apply to existing repositories, run:"
echo "  cd /path/to/existing/repo"
echo "  git secrets --install"
echo "  git secrets --register-aws"
echo ""
echo "🧪 Test the setup:"
echo "  mkdir test-repo && cd test-repo"
echo "  git init"
echo "  echo 'CORALOGIX_API_KEY=cxup_fake123456789012345' > test.txt"
echo "  git add test.txt"
echo "  git commit -m 'test' # Should be blocked!"
echo ""
echo "🌍 Global patterns active:"
git config --global --get-regexp secrets.patterns | sed 's/^/  • /'

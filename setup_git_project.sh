#!/bin/bash
# Automated Git setup for PESU_RR_AIML_B_P13_An_online_food_delivery_system_ZomaClone

# --- CONFIGURATION ---
REPO_URL="https://github.com/pestechnology/PESU_RR_AIML_B_P13_An_online_food_delivery_system_ZomaClone.git"
FEATURES=(
  "SCRUM-3-customer-account-verification"
  "SCRUM-4-search-filter-restaurants"
  "SCRUM-5-shopping-cart"
  "SCRUM-6-address-coupons"
  "SCRUM-8-order-acceptance"
  "SCRUM-9-menu-price-management"
  "SCRUM-11-secure-payment"
  "SCRUM-12-delivery-tracking"
  "SCRUM-13-agent-navigation"
  "SCRUM-14-admin-report"
  "SCRUM-15-system-scalability"
  "SCRUM-16-security-measures"
)

echo "🚀 Setting up Git repository for ZomaClone project..."

# Initialize repo if not already
if [ ! -d .git ]; then
  git init
  echo "Git repository initialized."
fi

# Add remote origin if not added
if ! git remote | grep -q origin; then
  git remote add origin "$REPO_URL"
  echo "Remote origin added: $REPO_URL"
fi

# Create main branch
git checkout -b main 2>/dev/null || git checkout main
git add .
git commit -m "feat: initial project setup" || echo "Initial commit exists."
git push -u origin main

# Create develop branch from main
git checkout -b develop || git checkout develop
git push -u origin develop

# --- Create feature branches ---
for feature in "${FEATURES[@]}"; do
  echo "📦 Creating branch feature/$feature ..."
  git checkout develop
  git checkout -b "feature/$feature"

  echo "Initial setup for $feature" > "${feature}.txt"
  git add "${feature}.txt"
  git commit -m "feat: initialize $feature"
  git push -u origin "feature/$feature"
done

# Return to develop
git checkout develop
echo "✅ All branches created and pushed successfully!"

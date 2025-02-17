#!/bin/bash

read -p "Enter your Personal Access Token (PAT): " pat

# Get the current remote URL
current_url=$(git remote get-url origin)

# Determine if the remote is GitHub or Azure DevOps
if [[ "$current_url" == *"github.com"* ]]; then
    repo_url=$(echo "$current_url" | sed -E 's#https://([^@]+@)?github.com/#https://github.com/#')
    new_url=$(echo "$repo_url" | sed -E "s#https://github.com/#https://$pat@github.com/#")
elif [[ "$current_url" == *"visualstudio.com"* || "$current_url" == *"dev.azure.com"* ]]; then
    repo_url=$(echo "$current_url" | sed -E 's#https://([^@]+@)?([^/]+)/#https://\2/#')
    new_url=$(echo "$repo_url" | sed -E "s#https://#https://$pat@#")
else
    echo "Unsupported remote URL format."
    exit 1
fi

echo "Current remote URL: $current_url"
echo "Constructed new remote URL: $new_url"
read -p "Do you want to proceed with updating the remote URL? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
    echo "Operation canceled."
    exit 1
fi

git remote set-url origin "$new_url"

echo "Updated remote URL to: $new_url"

git remote -v

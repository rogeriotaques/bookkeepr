#!/bin/bash

# Bump the version on the frontend and backend package.json files
# and buid, tag, and push the new Docker image

# Get the current version
CURRENT_VERSION=$(cat frontend/package.json | jq -r '.version')

# Get the new version
read -p "Enter the new version: " NEW_VERSION

# Update the version in frontend/package.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/g" frontend/package.json

# Update the version in backend/package.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/g" backend/package.json

# Push changes to git
git add frontend/package.json backend/package.json
git commit -m "Bump version to $NEW_VERSION"
git tag $NEW_VERSION
git push

echo "Version updated to $NEW_VERSION"

# Build the new Docker image
docker build -t abtzco/bookkeepr .
echo "Docker image built"

# Tag the new Docker image
docker tag abtzco/bookkeepr abtzco/bookkeepr:$NEW_VERSION
echo "Docker image tagged"

# Push the new Docker image
docker push abtzco/bookkeepr
echo "Docker image pushed"

echo "All done!"

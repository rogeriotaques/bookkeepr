#!/bin/bash

# Bump the version on the frontend and backend package.json files
# and buid, tag, and push the new Docker image

# Make sure docker is running
# If not running, return an error
if ! docker info &> /dev/null; then
  echo "Docker is not running. Please start it and try again."
  exit 1
fi

# Get the current version
CURRENT_VERSION=$(cat frontend/package.json | jq -r '.version')

# Get the new version
read -p "Enter the new version: " NEW_VERSION

# Update the version in frontend/package.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/g" frontend/package.json

# Update the version in backend/package.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/g" backend/package.json

echo "Version bumped to $NEW_VERSION in the package.json files"
echo ""

# Push changes to git
git add frontend/package.json backend/package.json
git commit -m "Bump version to $NEW_VERSION"
git push
git tag $NEW_VERSION
git push --tags


echo "Version updated to $NEW_VERSION"
echo ""

# Build the new Docker image
docker build --platform linux/amd64 -t abtzco/bookkeepr .
echo "Docker image built"
echo ""

# Tag the new Docker image
docker image tag abtzco/bookkeepr abtzco/bookkeepr:$NEW_VERSION
echo "Docker image tagged"
echo ""

# Push the new Docker image
docker push abtzco/bookkeepr
echo "Docker image pushed"
echo ""

echo "All done!"

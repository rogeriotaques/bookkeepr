#!/bin/bash

# Bump the version on the frontend and backend package.json files
# and build, tag, and push the new Docker image.
#
# Usage:
#   ./bump-and-push-docker-image.sh             # bump the version, then publish
#   ./bump-and-push-docker-image.sh --no-bump   # publish the current version
#   ./bump-and-push-docker-image.sh --help

SKIP_BUMP=false

usage() {
  echo "Usage: $(basename "$0") [--no-bump]"
  echo ""
  echo "  --no-bump   Do not change the version. Check that frontend/package.json"
  echo "              and backend/package.json share the same version, then publish it."
  echo "  -h, --help  Show this help."
}

case "${1:-}" in
  --no-bump)
    SKIP_BUMP=true
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  "")
    ;;
  *)
    echo "Unknown option: $1"
    usage
    exit 1
    ;;
esac

# Make sure jq is available
if ! command -v jq &> /dev/null; then
  echo "jq is not installed. Install it and try again."
  exit 1
fi

# Make sure docker is running
# If not running, return an error
if ! docker info &> /dev/null; then
  echo "Docker is not running. Please start it and try again."
  exit 1
fi

# Get the current versions
FRONTEND_VERSION=$(jq -r '.version' frontend/package.json)
BACKEND_VERSION=$(jq -r '.version' backend/package.json)

if [ -z "$FRONTEND_VERSION" ] || [ "$FRONTEND_VERSION" = "null" ] || \
   [ -z "$BACKEND_VERSION" ] || [ "$BACKEND_VERSION" = "null" ]; then
  echo "Could not read the version from frontend/package.json or backend/package.json."
  exit 1
fi

if [ "$SKIP_BUMP" = true ]; then
  # The version was updated manually. Make sure both files agree.
  if [ "$FRONTEND_VERSION" != "$BACKEND_VERSION" ]; then
    echo "Version mismatch: frontend/package.json is $FRONTEND_VERSION but backend/package.json is $BACKEND_VERSION."
    echo "Align the versions or run without --no-bump."
    exit 1
  fi

  NEW_VERSION="$FRONTEND_VERSION"
  echo "Bump skipped. Using version $NEW_VERSION"
  echo ""
else
  # Get the new version
  read -p "Enter the new version: " NEW_VERSION

  if [ -z "$NEW_VERSION" ]; then
    echo "No version entered. Aborting."
    exit 1
  fi

  # Update the version in frontend/package.json
  sed -i '' "s/\"version\": \"$FRONTEND_VERSION\"/\"version\": \"$NEW_VERSION\"/g" frontend/package.json

  # Update the version in backend/package.json
  sed -i '' "s/\"version\": \"$BACKEND_VERSION\"/\"version\": \"$NEW_VERSION\"/g" backend/package.json

  echo "Version bumped to $NEW_VERSION in the package.json files"
  echo ""
fi

# Push changes to git
git add frontend/package.json backend/package.json

if [ "$SKIP_BUMP" = true ]; then
  # Commit only when the manually updated files have uncommitted changes.
  # Limit the commit to the package.json files so other staged work stays untouched.
  if git diff --cached --quiet -- frontend/package.json backend/package.json; then
    echo "No package.json changes to commit"
  else
    git commit -m "Bump version to $NEW_VERSION" -- frontend/package.json backend/package.json
  fi
else
  git commit -m "Bump version to $NEW_VERSION"
fi

git push

if git rev-parse -q --verify "refs/tags/$NEW_VERSION" > /dev/null; then
  echo "Tag $NEW_VERSION already exists"
else
  git tag "$NEW_VERSION"
fi

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

# Login to hub.docker.io
docker login

# Push the new Docker image
docker push abtzco/bookkeepr
echo "Docker image pushed"
echo ""

echo "All done!"

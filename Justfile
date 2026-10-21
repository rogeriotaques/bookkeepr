# List available recipes (default)
default:
    @just --list

# Install dependencies (root, frontend, backend)
install:
    npm install
    npm --prefix frontend install
    npm --prefix backend install

# Start frontend + backend in development (Ctrl+C to stop)
start:
    npm start

# Start the backend only (http://localhost:8083)
start-backend:
    cd backend && npm start

# Start the frontend only (http://localhost:5173)
start-frontend:
    cd frontend && npm start

# Build the frontend for production
build:
    cd frontend && npm run build

# Run all tests
test: test-backend test-frontend

# Run backend tests
test-backend:
    cd backend && npm test

# Run frontend tests
test-frontend:
    cd frontend && npm test

# Build the Docker image (extra args go to docker build, e.g. --platform linux/amd64)
docker-build *args:
    docker buildx build {{ args }} --load -t abtzco/bookkeepr:latest .

# Run the local Docker image (http://localhost:8090, data in ./tmp-data)
docker-run:
    docker run --rm --name bookkeepr -p 8090:8083 -v "$PWD/tmp-data:/bookkeepr/data" abtzco/bookkeepr:latest

# Stop the local Docker container
docker-stop:
    @docker rm -f bookkeepr 2>/dev/null && echo "Container removed" || echo "No container running"

# Docker Setup for CDK Deployment

## Why Docker is Required

AWS CDK needs Docker to:
- Build Lambda function containers
- Package assets for deployment
- Create container images for some services

## Installation Options

### Option 1: Docker Desktop (Recommended)
1. Download Docker Desktop for Mac: https://www.docker.com/products/docker-desktop/
2. Install and start Docker Desktop
3. Verify installation: `docker --version`

### Option 2: Homebrew Installation
```bash
# Install Docker via Homebrew
brew install --cask docker

# Start Docker Desktop
open /Applications/Docker.app
```

### Option 3: Alternative - Use AWS Cloud9 or CodeBuild
If you prefer not to install Docker locally, you can:
1. Use AWS Cloud9 (cloud IDE with Docker pre-installed)
2. Use the CodeBuild deployment method we created earlier
3. Use GitHub Codespaces (if available)

## Quick Docker Installation Check
After installation, verify Docker is working:
```bash
docker --version
docker run hello-world
```

## Proceed with Deployment
Once Docker is installed and running:
```bash
# Run the pre-deployment check again
./pre-deploy-check.sh

# If all checks pass, deploy
./deploy-direct-cdk.sh
```

## Alternative: Cloud-based Deployment
If you prefer not to install Docker, you can use the CodeBuild approach:
1. Use the `deploy-private-repo.yml` CloudFormation template
2. This runs the deployment in AWS CodeBuild (which has Docker)
3. No local Docker installation required
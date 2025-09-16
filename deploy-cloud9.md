# Cloud9 Deployment Guide

## Deploy Bedrock Chat using AWS Cloud9 (No Local Docker Required)

If you prefer not to install Docker locally, you can use AWS Cloud9 for deployment.

### Step 1: Create Cloud9 Environment

1. Go to AWS Cloud9 console: https://console.aws.amazon.com/cloud9/
2. Click "Create environment"
3. Configure:
   - **Name**: `bedrock-chat-deployment`
   - **Instance type**: `t3.small` (sufficient for deployment)
   - **Platform**: `Amazon Linux 2`
   - **Region**: `ap-southeast-2`
4. Click "Create"

### Step 2: Setup Cloud9 Environment

Once your Cloud9 environment is ready:

```bash
# Update system
sudo yum update -y

# Install Node.js 18 (required for CDK)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verify installations
node --version
npm --version
docker --version  # Should already be available in Cloud9
```

### Step 3: Clone and Configure Repository

```bash
# Clone your private repository
git clone https://github.com/DonthineniSagar/bedrock-chat.git
cd bedrock-chat

# Configure AWS credentials (if not already configured)
aws configure set region ap-southeast-2

# Verify your account and region
aws sts get-caller-identity
```

### Step 4: Deploy

```bash
# Make scripts executable
chmod +x pre-deploy-check.sh deploy-direct-cdk.sh

# Run pre-deployment check
./pre-deploy-check.sh

# If all checks pass, deploy
./deploy-direct-cdk.sh
```

### Step 5: Monitor Deployment

The deployment will take 30-45 minutes. You can monitor progress in the Cloud9 terminal.

### Step 6: Cleanup Cloud9 (Optional)

After successful deployment, you can delete the Cloud9 environment to avoid ongoing costs:
1. Go to Cloud9 console
2. Select your environment
3. Click "Delete"

## Benefits of Cloud9 Approach

- ✅ No local Docker installation required
- ✅ Pre-configured AWS environment
- ✅ Proper IAM permissions
- ✅ All required tools pre-installed
- ✅ Runs in your AWS account (secure)

## Cost

Cloud9 costs ~$0.10/hour for t3.small instance. For a 1-hour deployment session, cost is ~$0.10.
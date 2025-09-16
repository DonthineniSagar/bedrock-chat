#!/bin/bash

# Bedrock Chat Private Repository Deployment Script
# This script deploys Bedrock Chat from your private GitHub repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
STACK_NAME="bedrock-chat-private"
REGION="ap-southeast-2"
REPO_URL="https://github.com/DonthineniSagar/bedrock-chat.git"
VERSION="v3"
TEMPLATE_FILE="deploy-private-repo.yml"

echo -e "${BLUE}🚀 Bedrock Chat Private Repository Deployment${NC}"
echo -e "${BLUE}===============================================${NC}"

# Check if GitHub token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}❌ Error: GITHUB_TOKEN environment variable is required${NC}"
    echo -e "${YELLOW}💡 Please set your GitHub Personal Access Token:${NC}"
    echo -e "   export GITHUB_TOKEN=\"ghp_your_token_here\""
    echo -e ""
    echo -e "${YELLOW}📝 To create a token:${NC}"
    echo -e "   1. Go to https://github.com/settings/tokens"
    echo -e "   2. Generate new token (classic)"
    echo -e "   3. Select 'repo' scope for private repository access"
    echo -e "   4. Copy the token and set the environment variable"
    exit 1
fi

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}❌ Error: Template file $TEMPLATE_FILE not found${NC}"
    echo -e "${YELLOW}💡 Make sure you're running this script from the repository root${NC}"
    exit 1
fi

# Check AWS CLI and credentials
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ Error: AWS CLI is not installed${NC}"
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Error: AWS credentials not configured${NC}"
    echo -e "${YELLOW}💡 Run 'aws configure' to set up your credentials${NC}"
    exit 1
fi

echo -e "${GREEN}✅ GitHub token provided${NC}"
echo -e "${GREEN}✅ AWS credentials configured${NC}"
echo -e "${GREEN}✅ Template file found${NC}"

# Display deployment parameters
echo -e "\n${BLUE}📋 Deployment Parameters:${NC}"
echo -e "   Stack Name: $STACK_NAME"
echo -e "   Region: $REGION"
echo -e "   Repository: $REPO_URL"
echo -e "   Branch: $VERSION"
echo -e "   Template: $TEMPLATE_FILE"

# Ask for confirmation
echo -e "\n${YELLOW}❓ Do you want to proceed with the deployment? (y/N)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️  Deployment cancelled${NC}"
    exit 0
fi

echo -e "\n${BLUE}🚀 Starting deployment...${NC}"

# Deploy the CloudFormation stack
aws cloudformation create-stack \
    --stack-name "$STACK_NAME" \
    --template-body "file://$TEMPLATE_FILE" \
    --parameters \
        ParameterKey=GitHubToken,ParameterValue="$GITHUB_TOKEN" \
        ParameterKey=BedrockRegion,ParameterValue="$REGION" \
        ParameterKey=RepoUrl,ParameterValue="$REPO_URL" \
        ParameterKey=Version,ParameterValue="$VERSION" \
        ParameterKey=CdkJsonOverride,ParameterValue='{"context":{"enableRagReplicas":false,"enableBotStoreReplicas":false}}' \
    --capabilities CAPABILITY_IAM \
    --region "$REGION"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CloudFormation stack creation initiated successfully!${NC}"
    echo -e "\n${BLUE}📊 Monitoring deployment progress...${NC}"
    
    # Wait for stack creation to complete
    echo -e "${YELLOW}⏳ Waiting for stack creation to complete (this may take 30-45 minutes)...${NC}"
    
    aws cloudformation wait stack-create-complete \
        --stack-name "$STACK_NAME" \
        --region "$REGION"
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
        
        # Get the CodeBuild project name
        PROJECT_NAME=$(aws cloudformation describe-stacks \
            --stack-name "$STACK_NAME" \
            --region "$REGION" \
            --query 'Stacks[0].Outputs[?OutputKey==`ProjectName`].OutputValue' \
            --output text 2>/dev/null)
        
        if [ -n "$PROJECT_NAME" ]; then
            echo -e "\n${BLUE}🔨 CodeBuild Project: $PROJECT_NAME${NC}"
            echo -e "${YELLOW}💡 To trigger a build manually:${NC}"
            echo -e "   aws codebuild start-build --project-name $PROJECT_NAME --region $REGION"
        fi
        
        echo -e "\n${BLUE}📝 Next Steps:${NC}"
        echo -e "   1. The CodeBuild project will automatically start building your application"
        echo -e "   2. Monitor the build progress in the AWS CodeBuild console"
        echo -e "   3. Once complete, you'll get the Frontend URL in the build logs"
        echo -e "   4. Enable Bedrock model access in the $REGION console if not already done"
        
        echo -e "\n${GREEN}💰 Cost Optimization Applied:${NC}"
        echo -e "   - RAG replicas: Disabled (saves ~$75/month)"
        echo -e "   - Bot Store replicas: Disabled (saves ~$50/month)"
        echo -e "   - Region: ap-southeast-2 (optimized for APAC)"
        echo -e "   - Estimated monthly cost: ~$185 (40% savings)"
        
    else
        echo -e "\n${RED}❌ Stack creation failed or timed out${NC}"
        echo -e "${YELLOW}💡 Check the CloudFormation console for details:${NC}"
        echo -e "   https://console.aws.amazon.com/cloudformation/home?region=$REGION"
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to create CloudFormation stack${NC}"
    exit 1
fi
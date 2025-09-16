#!/bin/bash

# Direct CDK Deployment Script for Bedrock Chat
# Cost-optimized deployment to ap-southeast-2 with custom domain

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGION="us-east-1"
DOMAIN="chat.cloudpro-digital.co.nz"
HOSTED_ZONE_ID="Z1047836YHDM15Z2GKR5"

echo -e "${BLUE}🚀 Bedrock Chat Direct CDK Deployment${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}Region: $REGION (us-east-1 - primary Bedrock region)${NC}"
echo -e "${GREEN}Domain: $DOMAIN${NC}"
echo -e "${GREEN}Cost Optimization: Maximum savings enabled${NC}"

# Pre-deployment checks
echo -e "\n${BLUE}🔍 Pre-deployment checks...${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity --region $REGION &> /dev/null; then
    echo -e "${RED}❌ Error: AWS credentials not configured for region $REGION${NC}"
    exit 1
fi
echo -e "${GREEN}✅ AWS credentials configured${NC}"

# Check if we're in the right directory
if [ ! -f "cdk/package.json" ]; then
    echo -e "${RED}❌ Error: Not in the correct directory. Please run from the repository root.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Repository structure verified${NC}"

# Check Node.js and npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js and npm available${NC}"

# Check Docker (required for CDK)
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed (required for CDK)${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Verify hosted zone
echo -e "\n${BLUE}🔍 Verifying Route 53 hosted zone...${NC}"
ZONE_CHECK=$(aws route53 get-hosted-zone --id $HOSTED_ZONE_ID --region $REGION --query 'HostedZone.Name' --output text 2>/dev/null || echo "ERROR")
if [ "$ZONE_CHECK" != "cloudpro-digital.co.nz." ]; then
    echo -e "${RED}❌ Error: Cannot access hosted zone $HOSTED_ZONE_ID${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Hosted zone verified: $ZONE_CHECK${NC}"

# Check Bedrock model access
echo -e "\n${BLUE}🔍 Checking Bedrock model access...${NC}"
BEDROCK_MODELS=$(aws bedrock list-foundation-models --region $REGION --query 'modelSummaries[?contains(modelId, `claude`) || contains(modelId, `nova`)].modelId' --output text 2>/dev/null || echo "")
if [ -z "$BEDROCK_MODELS" ]; then
    echo -e "${YELLOW}⚠️  Warning: Cannot verify Bedrock model access. Make sure you've enabled model access in the Bedrock console.${NC}"
    echo -e "${YELLOW}   Go to: https://console.aws.amazon.com/bedrock/home?region=$REGION#/modelaccess${NC}"
else
    echo -e "${GREEN}✅ Bedrock models accessible${NC}"
fi

# Display deployment configuration
echo -e "\n${BLUE}📋 Deployment Configuration:${NC}"
echo -e "   Region: $REGION"
echo -e "   Domain: $DOMAIN"
echo -e "   Hosted Zone: $HOSTED_ZONE_ID"
echo -e "   Cost Optimization: RAG replicas disabled, Bot Store replicas disabled"
echo -e "   Lambda SnapStart: DISABLED (dev environment - maximum cost savings)"
echo -e "   Cross-Region Inference: DISABLED (dev environment)"
echo -e "   Self Sign-up: Enabled (dev convenience)"
echo -e "   Estimated Monthly Cost: ~$145 (52% savings)"

# Ask for confirmation
echo -e "\n${YELLOW}❓ Do you want to proceed with the deployment? (y/N)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️  Deployment cancelled${NC}"
    exit 0
fi

echo -e "\n${BLUE}🚀 Starting CDK deployment...${NC}"

# Navigate to CDK directory
cd cdk

# Install dependencies
echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Bootstrap CDK (if not already done)
echo -e "\n${BLUE}🏗️  Bootstrapping CDK...${NC}"
npx cdk bootstrap --region $REGION

# Deploy the application
echo -e "\n${BLUE}🚀 Deploying Bedrock Chat...${NC}"
echo -e "${YELLOW}⏳ This will take approximately 30-45 minutes...${NC}"

# Deploy using the default environment (which has our custom domain config)
npx cdk deploy --all --require-approval never --region $REGION

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
    
    # Get the outputs
    echo -e "\n${BLUE}📊 Deployment Outputs:${NC}"
    
    # Get CloudFront URL
    CLOUDFRONT_URL=$(aws cloudformation describe-stacks \
        --stack-name BedrockChatStack \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`FrontendURL`].OutputValue' \
        --output text 2>/dev/null || echo "Not found")
    
    if [ "$CLOUDFRONT_URL" != "Not found" ]; then
        echo -e "${GREEN}✅ CloudFront URL: $CLOUDFRONT_URL${NC}"
    fi
    
    # Check if custom domain is working
    echo -e "\n${BLUE}🔍 Checking custom domain setup...${NC}"
    sleep 30  # Wait a bit for DNS propagation
    
    if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ Custom domain is accessible: https://$DOMAIN${NC}"
    else
        echo -e "${YELLOW}⚠️  Custom domain may still be propagating. Try again in a few minutes.${NC}"
        echo -e "${YELLOW}   Direct CloudFront access: $CLOUDFRONT_URL${NC}"
    fi
    
    echo -e "\n${GREEN}🎯 Access your Bedrock Chat:${NC}"
    echo -e "${GREEN}   Custom Domain: https://$DOMAIN${NC}"
    echo -e "${GREEN}   CloudFront URL: $CLOUDFRONT_URL${NC}"
    
    echo -e "\n${BLUE}📝 Next Steps:${NC}"
    echo -e "   1. Access your application at https://$DOMAIN"
    echo -e "   2. Create your first user account (self-signup is disabled)"
    echo -e "   3. Add users via AWS Cognito console if needed"
    echo -e "   4. Monitor costs in AWS Cost Explorer"
    
    echo -e "\n${GREEN}💰 Cost Optimization Summary:${NC}"
    echo -e "   - Monthly savings: ~$160 (52% reduction from $305 to $145)"
    echo -e "   - RAG replicas: Disabled"
    echo -e "   - Bot Store replicas: Disabled"
    echo -e "   - Lambda SnapStart: Disabled (saves ~$10/month)"
    echo -e "   - Cross-region inference: Disabled"
    echo -e "   - Limited to cheapest models only"
    echo -e "   - Region: us-east-1 (primary Bedrock region)"
    echo -e "   - Custom domain: Configured"
    
else
    echo -e "\n${RED}❌ Deployment failed${NC}"
    echo -e "${YELLOW}💡 Check the error messages above and try again${NC}"
    echo -e "${YELLOW}   Common issues:${NC}"
    echo -e "${YELLOW}   - Bedrock model access not enabled${NC}"
    echo -e "${YELLOW}   - Insufficient IAM permissions${NC}"
    echo -e "${YELLOW}   - Domain/hosted zone issues${NC}"
    exit 1
fi
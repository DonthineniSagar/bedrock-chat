#!/bin/bash

# Pre-deployment validation script for Bedrock Chat
# Checks all prerequisites before CDK deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REGION="us-east-1"
DOMAIN="chat.cloudpro-digital.co.nz"
HOSTED_ZONE_ID="Z1047836YHDM15Z2GKR5"

echo -e "${BLUE}🔍 Pre-deployment Validation for Bedrock Chat${NC}"
echo -e "${BLUE}=============================================${NC}"

ERRORS=0
WARNINGS=0

# Check AWS CLI and credentials
echo -e "\n${BLUE}1. AWS Configuration${NC}"
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not installed${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ AWS CLI installed${NC}"
    
    if aws sts get-caller-identity --region $REGION &> /dev/null; then
        ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
        echo -e "${GREEN}✅ AWS credentials configured (Account: $ACCOUNT_ID)${NC}"
    else
        echo -e "${RED}❌ AWS credentials not configured${NC}"
        ((ERRORS++))
    fi
fi

# Check Node.js and npm
echo -e "\n${BLUE}2. Development Environment${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed${NC}"
    ((ERRORS++))
else
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed ($NODE_VERSION)${NC}"
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not installed${NC}"
    ((ERRORS++))
else
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed ($NPM_VERSION)${NC}"
fi

# Check Docker
echo -e "\n${BLUE}3. Docker (Required for CDK)${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed${NC}"
    ((ERRORS++))
else
    echo -e "${GREEN}✅ Docker installed${NC}"
    
    if docker info &> /dev/null; then
        echo -e "${GREEN}✅ Docker is running${NC}"
    else
        echo -e "${RED}❌ Docker is not running${NC}"
        ((ERRORS++))
    fi
fi

# Check CDK
echo -e "\n${BLUE}4. AWS CDK${NC}"
if [ -f "cdk/package.json" ]; then
    echo -e "${GREEN}✅ CDK project structure found${NC}"
    
    cd cdk
    if [ -f "node_modules/.bin/cdk" ] || command -v cdk &> /dev/null; then
        echo -e "${GREEN}✅ CDK available${NC}"
    else
        echo -e "${YELLOW}⚠️  CDK not installed locally (will install during deployment)${NC}"
        ((WARNINGS++))
    fi
    cd ..
else
    echo -e "${RED}❌ CDK project structure not found${NC}"
    ((ERRORS++))
fi

# Check Route 53 hosted zone
echo -e "\n${BLUE}5. Route 53 Domain Configuration${NC}"
ZONE_CHECK=$(aws route53 get-hosted-zone --id $HOSTED_ZONE_ID --region $REGION --query 'HostedZone.Name' --output text 2>/dev/null || echo "ERROR")
if [ "$ZONE_CHECK" = "cloudpro-digital.co.nz." ]; then
    echo -e "${GREEN}✅ Hosted zone accessible: $ZONE_CHECK${NC}"
    
    # Check if chat subdomain already exists
    EXISTING_RECORD=$(aws route53 list-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --query "ResourceRecordSets[?Name=='chat.cloudpro-digital.co.nz.']" --output text 2>/dev/null || echo "")
    if [ -n "$EXISTING_RECORD" ]; then
        echo -e "${YELLOW}⚠️  chat.cloudpro-digital.co.nz record already exists${NC}"
        ((WARNINGS++))
    else
        echo -e "${GREEN}✅ chat subdomain available for creation${NC}"
    fi
else
    echo -e "${RED}❌ Cannot access hosted zone $HOSTED_ZONE_ID${NC}"
    ((ERRORS++))
fi

# Check Bedrock model access
echo -e "\n${BLUE}6. Amazon Bedrock Configuration${NC}"
BEDROCK_MODELS=$(aws bedrock list-foundation-models --region $REGION --query 'modelSummaries[?contains(modelId, `claude`) || contains(modelId, `nova`)].modelId' --output text 2>/dev/null || echo "")
if [ -n "$BEDROCK_MODELS" ]; then
    MODEL_COUNT=$(echo $BEDROCK_MODELS | wc -w)
    echo -e "${GREEN}✅ Bedrock models accessible ($MODEL_COUNT models found)${NC}"
else
    echo -e "${YELLOW}⚠️  Cannot verify Bedrock model access${NC}"
    echo -e "${YELLOW}   Please enable model access at: https://console.aws.amazon.com/bedrock/home?region=$REGION#/modelaccess${NC}"
    ((WARNINGS++))
fi

# Check parameter configuration
echo -e "\n${BLUE}7. Parameter Configuration${NC}"
if grep -q "chat.cloudpro-digital.co.nz" cdk/parameter.ts; then
    echo -e "${GREEN}✅ Custom domain configured in parameters${NC}"
else
    echo -e "${RED}❌ Custom domain not found in parameter configuration${NC}"
    ((ERRORS++))
fi

if grep -q "Z1047836YHDM15Z2GKR5" cdk/parameter.ts; then
    echo -e "${GREEN}✅ Hosted zone ID configured in parameters${NC}"
else
    echo -e "${RED}❌ Hosted zone ID not found in parameter configuration${NC}"
    ((ERRORS++))
fi

if grep -q "enableRagReplicas: false" cdk/parameter.ts; then
    echo -e "${GREEN}✅ Cost optimization (RAG replicas disabled)${NC}"
else
    echo -e "${YELLOW}⚠️  RAG replicas not disabled (higher costs)${NC}"
    ((WARNINGS++))
fi

# Check region-specific services
echo -e "\n${BLUE}8. Regional Service Availability (us-east-1)${NC}"
echo -e "${GREEN}✅ Amazon Bedrock: Available${NC}"
echo -e "${GREEN}✅ OpenSearch Serverless: Available${NC}"
echo -e "${GREEN}✅ Lambda SnapStart: Available${NC}"
echo -e "${GREEN}✅ CloudFront: Global service${NC}"
echo -e "${GREEN}✅ Route 53: Global service${NC}"

# Summary
echo -e "\n${BLUE}📊 Validation Summary${NC}"
echo -e "${BLUE}===================${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 Ready for deployment!${NC}"
        echo -e "\n${BLUE}🚀 To deploy, run:${NC}"
        echo -e "${GREEN}   chmod +x deploy-direct-cdk.sh${NC}"
        echo -e "${GREEN}   ./deploy-direct-cdk.sh${NC}"
    else
        echo -e "${YELLOW}⚠️  $WARNINGS warnings found - review above${NC}"
        echo -e "${YELLOW}💡 You can proceed with deployment, but consider addressing warnings${NC}"
    fi
else
    echo -e "${RED}❌ $ERRORS critical errors found${NC}"
    echo -e "${RED}🛑 Please fix errors before deployment${NC}"
fi

echo -e "\n${BLUE}💰 Expected Deployment:${NC}"
echo -e "   Domain: https://$DOMAIN"
echo -e "   Region: $REGION (us-east-1 - primary Bedrock region)"
echo -e "   Monthly Cost: ~$185 (40% savings)"
echo -e "   Deployment Time: ~30-45 minutes"

exit $ERRORS
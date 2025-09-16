#!/bin/bash

# Cleanup script for old Bedrock Chat stacks
# This will delete existing stacks to start fresh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Bedrock Chat Stack Cleanup${NC}"
echo -e "${BLUE}=============================${NC}"

# Check for existing stacks in ap-southeast-2
echo -e "\n${BLUE}🔍 Checking for existing stacks in ap-southeast-2...${NC}"
APAC_STACKS=$(aws cloudformation list-stacks --region ap-southeast-2 --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query 'StackSummaries[?contains(StackName, `Bedrock`) || contains(StackName, `bedrock`) || contains(StackName, `Chat`) || contains(StackName, `chat`)].StackName' --output text)

if [ -n "$APAC_STACKS" ]; then
    echo -e "${YELLOW}⚠️  Found existing stacks in ap-southeast-2:${NC}"
    for stack in $APAC_STACKS; do
        echo -e "   - $stack"
    done
    
    echo -e "\n${YELLOW}❓ Do you want to delete these stacks? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        for stack in $APAC_STACKS; do
            echo -e "${BLUE}🗑️  Deleting stack: $stack${NC}"
            aws cloudformation delete-stack --stack-name "$stack" --region ap-southeast-2
            echo -e "${GREEN}✅ Deletion initiated for $stack${NC}"
        done
        
        echo -e "\n${YELLOW}⏳ Waiting for stack deletions to complete...${NC}"
        for stack in $APAC_STACKS; do
            echo -e "${BLUE}   Waiting for $stack...${NC}"
            aws cloudformation wait stack-delete-complete --stack-name "$stack" --region ap-southeast-2
            echo -e "${GREEN}   ✅ $stack deleted successfully${NC}"
        done
    else
        echo -e "${YELLOW}⏹️  Stack deletion cancelled${NC}"
    fi
else
    echo -e "${GREEN}✅ No existing stacks found in ap-southeast-2${NC}"
fi

# Check for existing stacks in us-east-1
echo -e "\n${BLUE}🔍 Checking for existing stacks in us-east-1...${NC}"
USEAST_STACKS=$(aws cloudformation list-stacks --region us-east-1 --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query 'StackSummaries[?contains(StackName, `Bedrock`) || contains(StackName, `bedrock`) || contains(StackName, `Chat`) || contains(StackName, `chat`)].StackName' --output text)

if [ -n "$USEAST_STACKS" ]; then
    echo -e "${YELLOW}⚠️  Found existing stacks in us-east-1:${NC}"
    for stack in $USEAST_STACKS; do
        echo -e "   - $stack"
    done
    
    echo -e "\n${YELLOW}❓ Do you want to delete these stacks? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        for stack in $USEAST_STACKS; do
            echo -e "${BLUE}🗑️  Deleting stack: $stack${NC}"
            aws cloudformation delete-stack --stack-name "$stack" --region us-east-1
            echo -e "${GREEN}✅ Deletion initiated for $stack${NC}"
        done
        
        echo -e "\n${YELLOW}⏳ Waiting for stack deletions to complete...${NC}"
        for stack in $USEAST_STACKS; do
            echo -e "${BLUE}   Waiting for $stack...${NC}"
            aws cloudformation wait stack-delete-complete --stack-name "$stack" --region us-east-1
            echo -e "${GREEN}   ✅ $stack deleted successfully${NC}"
        done
    else
        echo -e "${YELLOW}⏹️  Stack deletion cancelled${NC}"
    fi
else
    echo -e "${GREEN}✅ No existing stacks found in us-east-1${NC}"
fi

echo -e "\n${GREEN}🎉 Cleanup completed! Ready for fresh deployment.${NC}"
echo -e "\n${BLUE}📝 Next steps:${NC}"
echo -e "   1. Configuration has been updated for us-east-1"
echo -e "   2. Run: ./deploy-direct-cdk.sh"
echo -e "   3. Your domain will work from us-east-1 (global CloudFront)"
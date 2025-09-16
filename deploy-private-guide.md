# Private Repository Deployment Guide

## Quick Deployment with GitHub Token

### Option A: Deploy via AWS Console
1. Go to AWS CloudFormation console in ap-southeast-2
2. Create new stack with `deploy-private-repo.yml`
3. Fill in parameters:
   - **GitHubToken**: Paste your GitHub Personal Access Token
   - **BedrockRegion**: ap-southeast-2 (default)
   - **RepoUrl**: https://github.com/DonthineniSagar/bedrock-chat.git (default)
   - **Version**: v3 (default)
   - Other parameters as needed

### Option B: Deploy via AWS CLI
```bash
# Set your GitHub token
export GITHUB_TOKEN="ghp_your_token_here"

# Deploy the stack
aws cloudformation create-stack \
  --stack-name bedrock-chat-private \
  --template-body file://deploy-private-repo.yml \
  --parameters \
    ParameterKey=GitHubToken,ParameterValue=$GITHUB_TOKEN \
    ParameterKey=BedrockRegion,ParameterValue=ap-southeast-2 \
    ParameterKey=RepoUrl,ParameterValue=https://github.com/DonthineniSagar/bedrock-chat.git \
    ParameterKey=Version,ParameterValue=v3 \
  --capabilities CAPABILITY_IAM \
  --region ap-southeast-2
```

### Option C: Deploy with Cost Optimization Override
```bash
aws cloudformation create-stack \
  --stack-name bedrock-chat-private \
  --template-body file://deploy-private-repo.yml \
  --parameters \
    ParameterKey=GitHubToken,ParameterValue=$GITHUB_TOKEN \
    ParameterKey=BedrockRegion,ParameterValue=ap-southeast-2 \
    ParameterKey=CdkJsonOverride,ParameterValue='{"context":{"enableRagReplicas":false,"enableBotStoreReplicas":false}}' \
  --capabilities CAPABILITY_IAM \
  --region ap-southeast-2
```

## Security Features

### Token Storage
- GitHub token is stored securely in AWS Systems Manager Parameter Store
- Token is encrypted using AWS KMS
- CodeBuild retrieves token at runtime with proper IAM permissions

### IAM Permissions
- CodeBuild role has minimal required permissions
- Token access is restricted to the specific CodeBuild project
- All actions are logged in CloudTrail

## Monitoring

### Check Deployment Status
```bash
# Check stack status
aws cloudformation describe-stacks \
  --stack-name bedrock-chat-private \
  --region ap-southeast-2 \
  --query 'Stacks[0].StackStatus'

# Check CodeBuild project
aws codebuild list-projects --region ap-southeast-2
```

### View Build Logs
```bash
# Get project name from stack outputs
PROJECT_NAME=$(aws cloudformation describe-stacks \
  --stack-name bedrock-chat-private \
  --region ap-southeast-2 \
  --query 'Stacks[0].Outputs[?OutputKey==`ProjectName`].OutputValue' \
  --output text)

# Start a build
aws codebuild start-build \
  --project-name $PROJECT_NAME \
  --region ap-southeast-2
```

## Troubleshooting

### Common Issues

1. **"Repository not found" error**
   - Verify GitHub token has `repo` scope
   - Check repository URL is correct
   - Ensure token hasn't expired

2. **"Access denied" error**
   - Verify token has access to the private repository
   - Check if repository owner/organization settings allow token access

3. **Build fails during git clone**
   - Check CloudWatch logs for detailed error messages
   - Verify token is stored correctly in Parameter Store

### Verify Token Storage
```bash
# Check if token parameter exists (won't show the value)
aws ssm describe-parameters \
  --filters "Key=Name,Values=/bedrock-chat/bedrock-chat-private/github-token" \
  --region ap-southeast-2
```

## Token Management

### Rotate Token
1. Generate new GitHub token
2. Update CloudFormation stack with new token parameter
3. Old token will be automatically replaced

### Revoke Access
1. Delete the GitHub token from GitHub settings
2. Delete the CloudFormation stack to clean up resources

## Cost Optimization

The private repository deployment includes all cost optimizations:
- ap-southeast-2 region configuration
- Disabled replicas for cost savings
- Environment-specific parameter support
- Estimated savings: $120/month (40% reduction)
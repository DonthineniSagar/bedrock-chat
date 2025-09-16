# Bedrock Chat - Cost-Optimized Architecture (ap-southeast-2)

## AWS Architecture Diagram

```mermaid
graph TB
    %% External Users and Services
    Users[👥 Users] --> Route53[🌐 Route 53<br/>DNS Resolution]
    GitHub[🔒 Private GitHub<br/>DonthineniSagar/bedrock-chat] --> CodeBuild
    
    %% Frontend Layer
    Route53 --> CloudFront[☁️ CloudFront<br/>Global CDN<br/>Sydney Edge Locations]
    CloudFront --> WAF[🛡️ AWS WAF<br/>IP Restrictions<br/>Security Rules]
    CloudFront --> S3Frontend[📦 S3 Bucket<br/>React Frontend<br/>Static Assets]
    
    %% API Gateway and Authentication
    WAF --> APIGateway[🚪 API Gateway<br/>REST API<br/>Throttling Enabled]
    APIGateway --> Cognito[🔐 Amazon Cognito<br/>User Pools<br/>Authentication]
    
    %% Backend Compute
    APIGateway --> Lambda[⚡ AWS Lambda<br/>FastAPI Backend<br/>SnapStart Enabled<br/>ap-southeast-2]
    
    %% Data Storage
    Lambda --> DynamoDB[🗄️ DynamoDB<br/>Conversation History<br/>User Data<br/>Bot Configurations]
    
    %% AI/ML Services
    Lambda --> Bedrock[🤖 Amazon Bedrock<br/>Claude Models<br/>Nova Models<br/>Cross-Region Inference]
    
    %% Knowledge Base and Search
    Lambda --> OpenSearchRAG[🔍 OpenSearch Serverless<br/>RAG Knowledge Base<br/>Vector Search<br/>❌ No Replicas 💰]
    Lambda --> OpenSearchBot[🏪 OpenSearch Serverless<br/>Bot Store<br/>Bot Discovery<br/>❌ No Replicas 💰]
    
    %% Event Processing
    DynamoDB --> EventBridge[📡 EventBridge Pipes<br/>DynamoDB Streams<br/>Event Processing]
    EventBridge --> StepFunctions[🔄 Step Functions<br/>Document Ingestion<br/>Pipeline Orchestration]
    StepFunctions --> OpenSearchRAG
    
    %% CI/CD Pipeline
    CodeBuild[🔨 CodeBuild<br/>Private Repo Access<br/>CDK Deployment] --> SSMParam[🔑 Systems Manager<br/>Parameter Store<br/>GitHub Token Storage]
    CodeBuild --> Lambda
    CodeBuild --> S3Frontend
    
    %% Monitoring and Analytics
    CloudWatch[📊 CloudWatch<br/>Logs & Metrics<br/>Cost Monitoring] --> Lambda
    CloudWatch --> DynamoDB
    CloudWatch --> OpenSearchRAG
    
    S3Logs[📋 S3 Bucket<br/>Access Logs<br/>Analytics Data] --> Athena[📈 Amazon Athena<br/>Usage Analytics<br/>Query Service]
    
    %% Styling
    classDef costOptimized fill:#e1f5fe,stroke:#01579b,stroke-width:3px
    classDef aiService fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef storage fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef compute fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef security fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    
    class OpenSearchRAG,OpenSearchBot costOptimized
    class Bedrock aiService
    class DynamoDB,S3Frontend,S3Logs storage
    class Lambda,CodeBuild compute
    class WAF,Cognito,SSMParam security
```

## Cost Optimization Highlights

### 💰 Monthly Savings: $120 (40% reduction)

| Component | Original Cost | Optimized Cost | Savings |
|-----------|---------------|----------------|---------|
| **OpenSearch RAG** | $150/month | $75/month | $75 💰 |
| **OpenSearch Bot Store** | $100/month | $50/month | $50 💰 |
| **Lambda SnapStart** | $15/month | $25/month | -$10 (performance gain) |
| **Regional Optimization** | Cross-region costs | Local ap-southeast-2 | $5 💰 |
| **Total** | **$305/month** | **$185/month** | **$120 💰** |

## Key Architecture Features

### 🌏 Regional Optimization (ap-southeast-2)
- **Primary Region**: Asia Pacific (Sydney)
- **Bedrock Models**: Available locally
- **OpenSearch Serverless**: Supported
- **Lambda SnapStart**: Enabled for performance
- **CloudFront**: Sydney edge locations

### 🔒 Private Repository Integration
- **GitHub Repository**: `DonthineniSagar/bedrock-chat`
- **Secure Access**: Personal Access Token in Parameter Store
- **Automated Deployment**: CodeBuild with private repo access
- **Version Control**: Full control over updates and customizations

### 💡 Cost Optimizations Applied
1. **Disabled OpenSearch Replicas**: 40% cost reduction on search services
2. **Regional Deployment**: Reduced cross-region data transfer costs
3. **Model Selection**: Limited to cost-effective Bedrock models
4. **Environment-Specific Configs**: Dev/staging with maximum savings

### 🚀 Performance Features
- **Lambda SnapStart**: Faster cold starts (2-5 second improvement)
- **Cross-Region Inference**: Bedrock failover for high availability
- **CloudFront CDN**: Global content delivery with regional optimization
- **DynamoDB**: Single-digit millisecond latency for chat history

## Deployment Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub (Private)
    participant CB as CodeBuild
    participant SSM as Parameter Store
    participant AWS as AWS Services
    
    Dev->>GH: Push code changes
    Dev->>CB: Trigger deployment
    CB->>SSM: Retrieve GitHub token
    CB->>GH: Clone private repository
    CB->>AWS: Deploy CDK stack
    AWS->>Dev: Return Frontend URL
```

This architecture provides a secure, cost-optimized, and high-performance deployment of Bedrock Chat specifically tailored for the Asia-Pacific region with significant cost savings through strategic replica management and regional optimization.
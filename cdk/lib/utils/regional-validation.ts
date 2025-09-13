/**
 * Regional service availability validation utilities for ap-southeast-2
 */

export interface ServiceAvailability {
  serviceName: string;
  region: string;
  isAvailable: boolean;
  alternativeRegion?: string;
  impact?: string;
}

export interface RegionalValidationResult {
  region: string;
  allServicesAvailable: boolean;
  services: ServiceAvailability[];
  recommendations: string[];
}

/**
 * Validate service availability in ap-southeast-2 region
 * @param targetRegion The target AWS region to validate
 * @returns Validation result with service availability status
 */
export function validateRegionalServices(targetRegion: string): RegionalValidationResult {
  const services: ServiceAvailability[] = [
    {
      serviceName: "Amazon Bedrock",
      region: targetRegion,
      isAvailable: targetRegion === "ap-southeast-2",
      alternativeRegion: targetRegion !== "ap-southeast-2" ? "us-east-1" : undefined,
      impact: targetRegion !== "ap-southeast-2" ? "Cross-region inference required for Bedrock models" : undefined
    },
    {
      serviceName: "OpenSearch Serverless",
      region: targetRegion,
      isAvailable: ["ap-southeast-2", "ap-southeast-1", "ap-northeast-1", "us-east-1", "us-west-2", "eu-west-1"].includes(targetRegion),
      alternativeRegion: !["ap-southeast-2", "ap-southeast-1", "ap-northeast-1", "us-east-1", "us-west-2", "eu-west-1"].includes(targetRegion) ? "ap-southeast-1" : undefined,
      impact: !["ap-southeast-2", "ap-southeast-1", "ap-northeast-1", "us-east-1", "us-west-2", "eu-west-1"].includes(targetRegion) ? "RAG functionality may not be available" : undefined
    },
    {
      serviceName: "Lambda SnapStart",
      region: targetRegion,
      isAvailable: !["ap-southeast-3", "ap-south-2", "eu-south-2", "eu-central-2"].includes(targetRegion),
      alternativeRegion: ["ap-southeast-3", "ap-south-2", "eu-south-2", "eu-central-2"].includes(targetRegion) ? "ap-southeast-2" : undefined,
      impact: ["ap-southeast-3", "ap-south-2", "eu-south-2", "eu-central-2"].includes(targetRegion) ? "Cold start performance may be impacted" : undefined
    },
    {
      serviceName: "DynamoDB",
      region: targetRegion,
      isAvailable: true, // Available in all regions
      impact: undefined
    },
    {
      serviceName: "API Gateway",
      region: targetRegion,
      isAvailable: true, // Available in all regions
      impact: undefined
    },
    {
      serviceName: "CloudFront",
      region: targetRegion,
      isAvailable: true, // Global service
      impact: undefined
    }
  ];

  const allServicesAvailable = services.every(service => service.isAvailable);
  
  const recommendations: string[] = [];
  
  if (targetRegion === "ap-southeast-2") {
    recommendations.push("✅ All services are available in ap-southeast-2");
    recommendations.push("💰 Consider disabling replicas for cost optimization in non-production environments");
    recommendations.push("🚀 Lambda SnapStart is supported for improved performance");
  } else {
    recommendations.push(`⚠️  Target region ${targetRegion} may have limited service availability`);
    recommendations.push("🔄 Consider using ap-southeast-2 for full service support");
  }

  // Add cost optimization recommendations
  recommendations.push("💡 Cost Optimization Tips:");
  recommendations.push("  - Set enableRagReplicas=false for dev/test environments");
  recommendations.push("  - Set enableBotStoreReplicas=false to reduce OpenSearch costs");
  recommendations.push("  - Limit globalAvailableModels to reduce model access costs");

  return {
    region: targetRegion,
    allServicesAvailable,
    services,
    recommendations
  };
}

/**
 * Get recommended Bedrock models for ap-southeast-2 region
 * @returns Array of recommended model IDs available in the region
 */
export function getRecommendedModelsForRegion(region: string): string[] {
  if (region === "ap-southeast-2") {
    return [
      "claude-v3.5-sonnet",
      "claude-v3.5-haiku",
      "claude-v3-haiku",
      "amazon-nova-pro",
      "amazon-nova-lite",
      "amazon-nova-micro"
    ];
  }
  
  // Fallback for other regions - basic models that are widely available
  return [
    "claude-v3.5-haiku",
    "claude-v3-haiku"
  ];
}

/**
 * Validate parameter configuration for regional deployment
 * @param region Target deployment region
 * @param enableRagReplicas RAG replicas setting
 * @param enableBotStoreReplicas Bot store replicas setting
 * @returns Validation result with warnings and recommendations
 */
export function validateParameterConfiguration(
  region: string,
  enableRagReplicas: boolean,
  enableBotStoreReplicas: boolean
): { isValid: boolean; warnings: string[]; recommendations: string[] } {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Check OpenSearch Serverless availability
  const opensearchAvailable = ["ap-southeast-2", "ap-southeast-1", "ap-northeast-1", "us-east-1", "us-west-2", "eu-west-1"].includes(region);
  
  if (!opensearchAvailable && (enableRagReplicas || enableBotStoreReplicas)) {
    warnings.push(`OpenSearch Serverless not available in ${region} - RAG and Bot Store features may not work`);
    recommendations.push("Consider deploying to ap-southeast-2 or disable RAG/Bot Store features");
  }
  
  // Cost optimization recommendations
  if (enableRagReplicas && enableBotStoreReplicas) {
    recommendations.push("💰 Both RAG and Bot Store replicas are enabled - consider disabling for non-production environments");
  }
  
  if (region !== "ap-southeast-2") {
    warnings.push(`Deploying to ${region} instead of ap-southeast-2 may result in higher latency for Asia-Pacific users`);
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations
  };
}
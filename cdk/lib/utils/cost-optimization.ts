/**
 * Cost optimization utilities and configuration matrix for Bedrock Chat deployment
 */

export interface CostOptimizationConfig {
  environment: 'dev' | 'staging' | 'prod';
  ragReplicas: boolean;
  botStoreReplicas: boolean;
  lambdaSnapStart: boolean;
  crossRegionInference: boolean;
  modelRestrictions: string[];
  estimatedMonthlySavings: number;
  performanceImpact: string;
  description: string;
}

export interface CostEstimate {
  service: string;
  monthlyUSD: number;
  unit: string;
  notes: string;
}

export interface CostComparisonResult {
  configuration: string;
  totalMonthlyCost: number;
  savingsVsDefault: number;
  savingsPercentage: number;
  breakdown: CostEstimate[];
  tradeoffs: string[];
}

/**
 * Cost optimization configuration matrix for different environments
 */
export const COST_OPTIMIZATION_MATRIX: Record<string, CostOptimizationConfig> = {
  'maximum-cost-savings': {
    environment: 'dev',
    ragReplicas: false,
    botStoreReplicas: false,
    lambdaSnapStart: false,
    crossRegionInference: false,
    modelRestrictions: ['claude-v3.5-haiku', 'amazon-nova-lite'],
    estimatedMonthlySavings: 200,
    performanceImpact: 'Moderate - slower cold starts, limited model selection',
    description: 'Maximum cost savings for development and testing environments'
  },
  'balanced-optimization': {
    environment: 'staging',
    ragReplicas: false,
    botStoreReplicas: false,
    lambdaSnapStart: true,
    crossRegionInference: true,
    modelRestrictions: ['claude-v3.5-sonnet', 'claude-v3.5-haiku', 'amazon-nova-pro', 'amazon-nova-lite'],
    estimatedMonthlySavings: 120,
    performanceImpact: 'Low - good performance with cost savings',
    description: 'Balanced approach for staging environments'
  },
  'production-optimized': {
    environment: 'prod',
    ragReplicas: true,
    botStoreReplicas: true,
    lambdaSnapStart: true,
    crossRegionInference: true,
    modelRestrictions: [],
    estimatedMonthlySavings: 0,
    performanceImpact: 'None - full performance and availability',
    description: 'Production configuration with high availability'
  },
  'cost-conscious-prod': {
    environment: 'prod',
    ragReplicas: false,
    botStoreReplicas: false,
    lambdaSnapStart: true,
    crossRegionInference: true,
    modelRestrictions: ['claude-v3.5-sonnet', 'claude-v3.5-haiku', 'amazon-nova-pro'],
    estimatedMonthlySavings: 80,
    performanceImpact: 'Low - slight availability impact during high load',
    description: 'Cost-conscious production with acceptable performance'
  }
};

/**
 * Estimate monthly costs for different AWS services based on configuration
 * Note: These are rough estimates for ap-southeast-2 region
 */
export function estimateServiceCosts(config: CostOptimizationConfig): CostEstimate[] {
  const estimates: CostEstimate[] = [];

  // OpenSearch Serverless costs (RAG)
  if (config.ragReplicas) {
    estimates.push({
      service: 'OpenSearch Serverless (RAG with replicas)',
      monthlyUSD: 150,
      unit: 'OCU hours',
      notes: 'Includes standby replicas for high availability'
    });
  } else {
    estimates.push({
      service: 'OpenSearch Serverless (RAG without replicas)',
      monthlyUSD: 75,
      unit: 'OCU hours',
      notes: 'Single OCU, cost-optimized configuration'
    });
  }

  // Bot Store OpenSearch costs
  if (config.botStoreReplicas) {
    estimates.push({
      service: 'OpenSearch Serverless (Bot Store with replicas)',
      monthlyUSD: 100,
      unit: 'OCU hours',
      notes: 'Bot store with standby replicas'
    });
  } else {
    estimates.push({
      service: 'OpenSearch Serverless (Bot Store without replicas)',
      monthlyUSD: 50,
      unit: 'OCU hours',
      notes: 'Bot store without replicas'
    });
  }

  // Lambda costs
  if (config.lambdaSnapStart) {
    estimates.push({
      service: 'Lambda with SnapStart',
      monthlyUSD: 25,
      unit: 'GB-seconds + SnapStart',
      notes: 'Includes SnapStart cache charges for faster cold starts'
    });
  } else {
    estimates.push({
      service: 'Lambda without SnapStart',
      monthlyUSD: 15,
      unit: 'GB-seconds',
      notes: 'Standard Lambda pricing, slower cold starts'
    });
  }

  // DynamoDB (consistent across configurations)
  estimates.push({
    service: 'DynamoDB',
    monthlyUSD: 20,
    unit: 'RCU/WCU',
    notes: 'Conversation storage, scales with usage'
  });

  // API Gateway (consistent across configurations)
  estimates.push({
    service: 'API Gateway',
    monthlyUSD: 10,
    unit: 'API calls',
    notes: 'REST API requests, scales with usage'
  });

  // CloudFront (consistent across configurations)
  estimates.push({
    service: 'CloudFront',
    monthlyUSD: 5,
    unit: 'Data transfer',
    notes: 'Global CDN for frontend delivery'
  });

  // Bedrock model costs (varies by model selection)
  const modelCostMultiplier = config.modelRestrictions.length > 0 ? 0.7 : 1.0;
  estimates.push({
    service: 'Amazon Bedrock',
    monthlyUSD: 50 * modelCostMultiplier,
    unit: 'Input/Output tokens',
    notes: config.modelRestrictions.length > 0 
      ? 'Reduced cost due to limited model selection'
      : 'Full model access, cost varies by usage'
  });

  return estimates;
}

/**
 * Compare costs between different optimization configurations
 */
export function compareCostConfigurations(): CostComparisonResult[] {
  const results: CostComparisonResult[] = [];
  
  Object.entries(COST_OPTIMIZATION_MATRIX).forEach(([configName, config]) => {
    const breakdown = estimateServiceCosts(config);
    const totalCost = breakdown.reduce((sum, estimate) => sum + estimate.monthlyUSD, 0);
    
    // Calculate savings vs production-optimized (baseline)
    const baselineCost = estimateServiceCosts(COST_OPTIMIZATION_MATRIX['production-optimized'])
      .reduce((sum, estimate) => sum + estimate.monthlyUSD, 0);
    
    const savings = baselineCost - totalCost;
    const savingsPercentage = (savings / baselineCost) * 100;
    
    // Define tradeoffs for each configuration
    const tradeoffs: string[] = [];
    if (!config.ragReplicas) {
      tradeoffs.push('Reduced RAG availability during high load or failures');
    }
    if (!config.botStoreReplicas) {
      tradeoffs.push('Reduced bot store availability during high load');
    }
    if (!config.lambdaSnapStart) {
      tradeoffs.push('Slower Lambda cold start times (2-5 seconds)');
    }
    if (config.modelRestrictions.length > 0) {
      tradeoffs.push(`Limited to ${config.modelRestrictions.length} models: ${config.modelRestrictions.join(', ')}`);
    }
    if (!config.crossRegionInference) {
      tradeoffs.push('No cross-region failover for Bedrock models');
    }
    
    results.push({
      configuration: configName,
      totalMonthlyCost: totalCost,
      savingsVsDefault: savings,
      savingsPercentage: Math.round(savingsPercentage),
      breakdown,
      tradeoffs
    });
  });
  
  return results.sort((a, b) => b.savingsVsDefault - a.savingsVsDefault);
}

/**
 * Get recommended configuration based on environment type
 */
export function getRecommendedConfiguration(environment: 'dev' | 'staging' | 'prod'): CostOptimizationConfig {
  switch (environment) {
    case 'dev':
      return COST_OPTIMIZATION_MATRIX['maximum-cost-savings'];
    case 'staging':
      return COST_OPTIMIZATION_MATRIX['balanced-optimization'];
    case 'prod':
      return COST_OPTIMIZATION_MATRIX['cost-conscious-prod']; // Default to cost-conscious prod
    default:
      return COST_OPTIMIZATION_MATRIX['balanced-optimization'];
  }
}

/**
 * Generate cost optimization report
 */
export function generateCostOptimizationReport(): string {
  const comparisons = compareCostConfigurations();
  
  let report = '# Cost Optimization Report for Bedrock Chat (ap-southeast-2)\n\n';
  report += '## Configuration Comparison\n\n';
  
  comparisons.forEach(config => {
    report += `### ${config.configuration.replace(/-/g, ' ').toUpperCase()}\n`;
    report += `- **Monthly Cost**: $${config.totalMonthlyCost}\n`;
    report += `- **Savings**: $${config.savingsVsDefault} (${config.savingsPercentage}%)\n`;
    report += `- **Tradeoffs**: ${config.tradeoffs.length > 0 ? config.tradeoffs.join(', ') : 'None'}\n\n`;
    
    report += '**Cost Breakdown:**\n';
    config.breakdown.forEach(service => {
      report += `- ${service.service}: $${service.monthlyUSD}/month (${service.notes})\n`;
    });
    report += '\n';
  });
  
  report += '## Recommendations\n\n';
  report += '1. **Development**: Use "maximum-cost-savings" configuration\n';
  report += '2. **Staging**: Use "balanced-optimization" configuration\n';
  report += '3. **Production**: Choose between "production-optimized" (high availability) or "cost-conscious-prod" (cost savings)\n\n';
  
  report += '## ap-southeast-2 Specific Notes\n\n';
  report += '- All services are available in ap-southeast-2 region\n';
  report += '- Lambda SnapStart is supported for improved performance\n';
  report += '- OpenSearch Serverless pricing may vary slightly from other regions\n';
  report += '- Consider data transfer costs for cross-region access\n';
  
  return report;
}
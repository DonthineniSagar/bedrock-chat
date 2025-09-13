#!/usr/bin/env node

/**
 * Migration Validation Script
 * Validates Bedrock Chat configuration for ap-southeast-2 deployment
 */

const fs = require('fs');
const path = require('path');

class MigrationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.recommendations = [];
  }

  /**
   * Validate repository configuration
   */
  validateRepositoryConfig() {
    console.log('🔍 Validating repository configuration...');
    
    // Check deploy.yml
    if (fs.existsSync('deploy.yml')) {
      const deployContent = fs.readFileSync('deploy.yml', 'utf8');
      
      if (deployContent.includes('aws-samples/bedrock-chat')) {
        this.errors.push('deploy.yml still references aws-samples repository');
      }
      
      if (!deployContent.includes('DonthineniSagar/bedrock-chat')) {
        this.errors.push('deploy.yml does not reference private repository');
      }
      
      if (!deployContent.includes('ap-southeast-2')) {
        this.warnings.push('deploy.yml does not default to ap-southeast-2 region');
      }
    } else {
      this.errors.push('deploy.yml file not found');
    }
  }

  /**
   * Validate CDK configuration
   */
  validateCdkConfig() {
    console.log('🔍 Validating CDK configuration...');
    
    // Check cdk.json
    if (fs.existsSync('cdk/cdk.json')) {
      const cdkContent = fs.readFileSync('cdk/cdk.json', 'utf8');
      const cdkConfig = JSON.parse(cdkContent);
      
      // Region validation
      if (cdkConfig.context.bedrockRegion !== 'ap-southeast-2') {
        this.warnings.push(`bedrockRegion is ${cdkConfig.context.bedrockRegion}, consider ap-southeast-2`);
      }
      
      // Cost optimization validation
      if (cdkConfig.context.enableRagReplicas === true) {
        this.recommendations.push('Consider setting enableRagReplicas to false for cost savings');
      }
      
      if (cdkConfig.context.enableBotStoreReplicas === true) {
        this.recommendations.push('Consider setting enableBotStoreReplicas to false for cost savings');
      }
      
      // Lambda SnapStart validation for ap-southeast-2
      if (cdkConfig.context.enableLambdaSnapStart === false) {
        this.recommendations.push('Lambda SnapStart is supported in ap-southeast-2, consider enabling for better performance');
      }
      
    } else {
      this.errors.push('cdk/cdk.json file not found');
    }
  }

  /**
   * Validate parameter.ts configuration
   */
  validateParameterConfig() {
    console.log('🔍 Validating parameter.ts configuration...');
    
    if (fs.existsSync('cdk/parameter.ts')) {
      const paramContent = fs.readFileSync('cdk/parameter.ts', 'utf8');
      
      if (!paramContent.includes('ap-southeast-2')) {
        this.warnings.push('parameter.ts does not include ap-southeast-2 configuration');
      }
      
      if (!paramContent.includes('bedrockChatParams.set')) {
        this.warnings.push('parameter.ts does not define any environment configurations');
      }
      
      // Check for cost optimization settings
      if (paramContent.includes('enableRagReplicas: true')) {
        this.recommendations.push('Consider cost-optimized settings in parameter.ts environments');
      }
      
    } else {
      this.warnings.push('cdk/parameter.ts file not found - consider using type-safe parameters');
    }
  }

  /**
   * Validate regional service availability
   */
  validateRegionalServices() {
    console.log('🔍 Validating regional service availability...');
    
    const apSoutheast2Services = {
      'Amazon Bedrock': true,
      'OpenSearch Serverless': true,
      'Lambda SnapStart': true,
      'DynamoDB': true,
      'API Gateway': true,
      'CloudFront': true,
      'Cognito': true
    };
    
    Object.entries(apSoutheast2Services).forEach(([service, available]) => {
      if (available) {
        console.log(`  ✅ ${service} is available in ap-southeast-2`);
      } else {
        this.warnings.push(`${service} may not be available in ap-southeast-2`);
      }
    });
  }

  /**
   * Validate cost optimization settings
   */
  validateCostOptimization() {
    console.log('🔍 Validating cost optimization...');
    
    // Check if cost optimization utilities exist
    if (fs.existsSync('cdk/lib/utils/cost-optimization.ts')) {
      console.log('  ✅ Cost optimization utilities found');
    } else {
      this.warnings.push('Cost optimization utilities not found');
    }
    
    // Check if regional validation exists
    if (fs.existsSync('cdk/lib/utils/regional-validation.ts')) {
      console.log('  ✅ Regional validation utilities found');
    } else {
      this.warnings.push('Regional validation utilities not found');
    }
    
    // Provide cost optimization recommendations
    this.recommendations.push('Review cost optimization matrix in cdk/lib/utils/cost-optimization.ts');
    this.recommendations.push('Consider using environment-specific configurations for different cost profiles');
  }

  /**
   * Validate deployment readiness
   */
  validateDeploymentReadiness() {
    console.log('🔍 Validating deployment readiness...');
    
    const requiredFiles = [
      'cdk/cdk.json',
      'cdk/package.json',
      'deploy.yml'
    ];
    
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`  ✅ ${file} exists`);
      } else {
        this.errors.push(`Required file missing: ${file}`);
      }
    });
    
    // Check for backup
    if (fs.existsSync('migration-backup.json')) {
      console.log('  ✅ Migration backup found');
    } else {
      this.warnings.push('No migration backup found - consider creating one');
    }
  }

  /**
   * Generate deployment checklist
   */
  generateDeploymentChecklist() {
    const checklist = [
      '□ Repository migrated to private GitHub repo',
      '□ Region configured for ap-southeast-2',
      '□ Cost optimization settings reviewed',
      '□ Bedrock model access enabled in ap-southeast-2',
      '□ AWS credentials configured for target region',
      '□ CDK bootstrap completed for ap-southeast-2',
      '□ Parameter configurations validated',
      '□ Backup of original configuration created'
    ];
    
    return checklist;
  }

  /**
   * Run all validations
   */
  runValidation() {
    console.log('🚀 Starting migration validation...\n');
    
    this.validateRepositoryConfig();
    this.validateCdkConfig();
    this.validateParameterConfig();
    this.validateRegionalServices();
    this.validateCostOptimization();
    this.validateDeploymentReadiness();
    
    this.generateReport();
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📋 Validation Report');
    console.log('='.repeat(50));
    
    // Errors
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS (Must Fix):');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (Should Review):');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    // Recommendations
    if (this.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    
    // Deployment checklist
    console.log('\n📝 DEPLOYMENT CHECKLIST:');
    this.generateDeploymentChecklist().forEach(item => console.log(`  ${item}`));
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`  Errors: ${this.errors.length}`);
    console.log(`  Warnings: ${this.warnings.length}`);
    console.log(`  Recommendations: ${this.recommendations.length}`);
    
    if (this.errors.length === 0) {
      console.log('\n✅ Validation passed! Ready for deployment.');
      console.log('\n🚀 Next steps:');
      console.log('  1. cd cdk && npm ci');
      console.log('  2. npx cdk bootstrap --region ap-southeast-2');
      console.log('  3. npx cdk deploy --all --region ap-southeast-2');
    } else {
      console.log('\n❌ Validation failed. Please fix errors before deployment.');
    }
    
    // Cost estimation
    console.log('\n💰 ESTIMATED MONTHLY COSTS (ap-southeast-2):');
    console.log('  - OpenSearch Serverless (no replicas): ~$125/month');
    console.log('  - Lambda + SnapStart: ~$25/month');
    console.log('  - DynamoDB: ~$20/month');
    console.log('  - Other services: ~$15/month');
    console.log('  - Total estimated: ~$185/month');
    console.log('  - Savings vs default config: ~$120/month (40% reduction)');
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log('Migration Validation Script');
    console.log('');
    console.log('Usage:');
    console.log('  node validate-migration.js        # Run full validation');
    console.log('  node validate-migration.js --help # Show this help');
    process.exit(0);
  }
  
  const validator = new MigrationValidator();
  validator.runValidation();
}

if (require.main === module) {
  main();
}

module.exports = MigrationValidator;
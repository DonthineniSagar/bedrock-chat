#!/usr/bin/env node

/**
 * Repository Migration Utility Script
 * Migrates Bedrock Chat configuration to private repository with ap-southeast-2 optimization
 */

const fs = require('fs');
const path = require('path');

const MIGRATION_CONFIG = {
  sourceRepo: 'https://github.com/aws-samples/bedrock-chat.git',
  targetRepo: 'https://github.com/DonthineniSagar/bedrock-chat.git',
  targetRegion: 'ap-southeast-2',
  backupFile: 'migration-backup.json'
};

const FILES_TO_UPDATE = [
  {
    file: 'deploy.yml',
    updates: [
      {
        search: 'Default: "https://github.com/aws-samples/bedrock-chat.git"',
        replace: `Default: "${MIGRATION_CONFIG.targetRepo}"`
      },
      {
        search: 'Default: "us-east-1"',
        replace: `Default: "${MIGRATION_CONFIG.targetRegion}"`
      }
    ]
  },
  {
    file: 'cdk/cdk.json',
    updates: [
      {
        search: '"bedrockRegion": "us-east-1"',
        replace: `"bedrockRegion": "${MIGRATION_CONFIG.targetRegion}"`
      },
      {
        search: '"enableRagReplicas": true',
        replace: '"enableRagReplicas": false'
      }
    ]
  }
];

/**
 * Create backup of original configuration
 */
function createBackup() {
  console.log('📦 Creating backup of original configuration...');
  
  const backup = {
    timestamp: new Date().toISOString(),
    originalRepo: MIGRATION_CONFIG.sourceRepo,
    targetRepo: MIGRATION_CONFIG.targetRepo,
    originalFiles: {}
  };

  FILES_TO_UPDATE.forEach(({ file }) => {
    if (fs.existsSync(file)) {
      backup.originalFiles[file] = fs.readFileSync(file, 'utf8');
      console.log(`  ✅ Backed up ${file}`);
    }
  });

  fs.writeFileSync(MIGRATION_CONFIG.backupFile, JSON.stringify(backup, null, 2));
  console.log(`📁 Backup saved to ${MIGRATION_CONFIG.backupFile}`);
}

/**
 * Update repository references in files
 */
function updateRepositoryReferences() {
  console.log('🔄 Updating repository references...');

  FILES_TO_UPDATE.forEach(({ file, updates }) => {
    if (!fs.existsSync(file)) {
      console.log(`  ⚠️  File not found: ${file}`);
      return;
    }

    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    updates.forEach(({ search, replace }) => {
      if (content.includes(search)) {
        content = content.replace(search, replace);
        modified = true;
        console.log(`  ✅ Updated ${file}: ${search} → ${replace}`);
      } else {
        console.log(`  ⚠️  Pattern not found in ${file}: ${search}`);
      }
    });

    if (modified) {
      fs.writeFileSync(file, content);
    }
  });
}

/**
 * Validate migration results
 */
function validateMigration() {
  console.log('🔍 Validating migration...');
  
  const issues = [];
  
  // Check deploy.yml
  if (fs.existsSync('deploy.yml')) {
    const deployContent = fs.readFileSync('deploy.yml', 'utf8');
    if (!deployContent.includes(MIGRATION_CONFIG.targetRepo)) {
      issues.push('deploy.yml still references original repository');
    }
    if (!deployContent.includes(MIGRATION_CONFIG.targetRegion)) {
      issues.push('deploy.yml still uses original region');
    }
  }
  
  // Check cdk.json
  if (fs.existsSync('cdk/cdk.json')) {
    const cdkContent = fs.readFileSync('cdk/cdk.json', 'utf8');
    if (!cdkContent.includes(`"bedrockRegion": "${MIGRATION_CONFIG.targetRegion}"`)) {
      issues.push('cdk.json still uses original region');
    }
    if (cdkContent.includes('"enableRagReplicas": true')) {
      issues.push('cdk.json still has cost-inefficient replica settings');
    }
  }
  
  // Check parameter.ts
  if (fs.existsSync('cdk/parameter.ts')) {
    const paramContent = fs.readFileSync('cdk/parameter.ts', 'utf8');
    if (!paramContent.includes('ap-southeast-2')) {
      issues.push('parameter.ts does not include ap-southeast-2 configuration');
    }
  }
  
  if (issues.length === 0) {
    console.log('  ✅ Migration validation passed!');
    return true;
  } else {
    console.log('  ❌ Migration validation failed:');
    issues.forEach(issue => console.log(`    - ${issue}`));
    return false;
  }
}

/**
 * Rollback migration if needed
 */
function rollbackMigration() {
  console.log('🔄 Rolling back migration...');
  
  if (!fs.existsSync(MIGRATION_CONFIG.backupFile)) {
    console.log('  ❌ No backup file found!');
    return false;
  }
  
  const backup = JSON.parse(fs.readFileSync(MIGRATION_CONFIG.backupFile, 'utf8'));
  
  Object.entries(backup.originalFiles).forEach(([file, content]) => {
    fs.writeFileSync(file, content);
    console.log(`  ✅ Restored ${file}`);
  });
  
  console.log('🔄 Rollback completed');
  return true;
}

/**
 * Display migration summary
 */
function displaySummary() {
  console.log('\n📋 Migration Summary:');
  console.log(`  Source Repository: ${MIGRATION_CONFIG.sourceRepo}`);
  console.log(`  Target Repository: ${MIGRATION_CONFIG.targetRepo}`);
  console.log(`  Target Region: ${MIGRATION_CONFIG.targetRegion}`);
  console.log(`  Cost Optimizations: RAG replicas disabled, region optimized`);
  console.log('\n🚀 Next Steps:');
  console.log('  1. Push changes to your private repository');
  console.log('  2. Update any CI/CD pipelines to use the new repository');
  console.log('  3. Test deployment with: ./bin.sh --bedrock-region ap-southeast-2');
  console.log('  4. Consider using parameter.ts for environment-specific configurations');
}

/**
 * Main migration function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--rollback')) {
    rollbackMigration();
    return;
  }
  
  if (args.includes('--validate-only')) {
    validateMigration();
    return;
  }
  
  console.log('🚀 Starting Bedrock Chat repository migration...\n');
  
  try {
    createBackup();
    updateRepositoryReferences();
    
    if (validateMigration()) {
      displaySummary();
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('\n❌ Migration completed with issues. Review the validation errors above.');
      console.log('💡 Run with --rollback to revert changes if needed.');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('💡 Run with --rollback to revert any changes.');
    process.exit(1);
  }
}

// Handle command line usage
if (require.main === module) {
  if (process.argv.includes('--help')) {
    console.log('Bedrock Chat Repository Migration Utility');
    console.log('');
    console.log('Usage:');
    console.log('  node migrate-to-private-repo.js           # Run migration');
    console.log('  node migrate-to-private-repo.js --rollback # Rollback migration');
    console.log('  node migrate-to-private-repo.js --validate-only # Validate only');
    console.log('  node migrate-to-private-repo.js --help    # Show this help');
    process.exit(0);
  }
  
  main();
}

module.exports = {
  createBackup,
  updateRepositoryReferences,
  validateMigration,
  rollbackMigration,
  MIGRATION_CONFIG
};
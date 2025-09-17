import { BedrockChatParametersInput } from "./lib/utils/parameter-models";

export const bedrockChatParams = new Map<string, BedrockChatParametersInput>();

// Maximum cost savings configuration for us-east-1 region with custom domain
// Default environment optimized for development with maximum cost savings
bedrockChatParams.set("default", {
  bedrockRegion: "us-east-1",
  enableRagReplicas: false, // Cost saving - disable replicas
  enableBotStoreReplicas: false, // Cost saving - disable bot store replicas
  enableLambdaSnapStart: false, // DISABLED - Save on SnapStart charges for dev environment
  enableBedrockCrossRegionInference: false, // Disable for dev to reduce complexity and costs
  
  // Custom domain configuration
  alternateDomainName: "chat.cloudpro-digital.co.nz",
  hostedZoneId: "Z1047836YHDM15Z2GKR5",
  
  // Premium model selection with Claude 4.0 models added
  globalAvailableModels: [
    "claude-v4-opus",     // Claude 4.0 Opus - Most advanced model
    "claude-v4-sonnet",   // Claude 4.0 Sonnet - Balanced performance (added!)
    "claude-v3.5-sonnet", // Claude 3.5 Sonnet - Premium model
    "claude-v3.5-haiku",  // Claude 3.5 Haiku - Fast & efficient
    "amazon-nova-lite",   // Multimodal Nova model
    "amazon-nova-micro"   // Ultra-cheap option
  ], // Premium selection with both Claude 4.0 models for best capabilities
  
  // Security settings
  selfSignUpEnabled: true, // Enable for dev environment convenience
});

// Development environment - maximum cost savings
bedrockChatParams.set("dev", {
  bedrockRegion: "us-east-1",
  enableRagReplicas: false, // Cost saving for dev environment
  enableBotStoreReplicas: false, // Cost saving for dev environment
  enableLambdaSnapStart: false, // Disable to save on SnapStart charges in dev
  enableBedrockCrossRegionInference: false, // Disable for dev to reduce complexity
  selfSignUpEnabled: true, // Allow self-signup for dev testing
  globalAvailableModels: [
    "claude-v4-opus",     // Claude 4.0 Opus - Most advanced model
    "claude-v4-sonnet",   // Claude 4.0 Sonnet - Balanced performance
    "claude-v3.5-sonnet", // Claude 3.5 Sonnet - Premium model
    "claude-v3.5-haiku",  // Claude 3.5 Haiku - Efficient for development
    "amazon-nova-lite"
  ],
});

// Production environment - balanced performance and cost
bedrockChatParams.set("prod", {
  bedrockRegion: "us-east-1", 
  enableRagReplicas: true, // Enable for production availability
  enableBotStoreReplicas: true, // Enable for production availability
  enableLambdaSnapStart: true, // Enable for production performance
  enableBedrockCrossRegionInference: true, // Enable for production resilience
  selfSignUpEnabled: false, // Disable self-signup for production security
  globalAvailableModels: [
    "claude-v4-opus",     // Claude 4.0 Opus - Most advanced model
    "claude-v4-sonnet",   // Claude 4.0 Sonnet - Balanced performance
    "claude-v3.5-sonnet", // Claude 3.5 Sonnet
    "claude-v3.5-haiku",  // Claude 3.5 Haiku
    "claude-v3-haiku",    // Claude 3 Haiku
    "amazon-nova-pro",    // Nova Pro
    "amazon-nova-lite"    // Nova Lite
  ],
});

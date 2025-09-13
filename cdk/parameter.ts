import { BedrockChatParametersInput } from "./lib/utils/parameter-models";

export const bedrockChatParams = new Map<string, BedrockChatParametersInput>();

// Cost-optimized configuration for ap-southeast-2 region
// Default environment with cost optimizations
bedrockChatParams.set("default", {
  bedrockRegion: "ap-southeast-2",
  enableRagReplicas: false, // Cost saving - disable replicas for default environment
  enableBotStoreReplicas: false, // Cost saving - disable bot store replicas
  enableLambdaSnapStart: true, // Keep enabled for performance (ap-southeast-2 supports it)
  enableBedrockCrossRegionInference: true, // Enable for better availability
  globalAvailableModels: [
    "claude-v3.5-sonnet",
    "claude-v3.5-haiku", 
    "claude-v3-haiku",
    "amazon-nova-pro",
    "amazon-nova-lite",
    "amazon-nova-micro"
  ], // Limit to commonly used models to reduce costs
});

// Development environment - maximum cost savings
bedrockChatParams.set("dev", {
  bedrockRegion: "ap-southeast-2",
  enableRagReplicas: false, // Cost saving for dev environment
  enableBotStoreReplicas: false, // Cost saving for dev environment
  enableLambdaSnapStart: false, // Disable to save on SnapStart charges in dev
  enableBedrockCrossRegionInference: false, // Disable for dev to reduce complexity
  selfSignUpEnabled: true, // Allow self-signup for dev testing
  globalAvailableModels: [
    "claude-v3.5-haiku", // Use cheaper model for development
    "amazon-nova-lite"
  ],
});

// Production environment - balanced performance and cost
bedrockChatParams.set("prod", {
  bedrockRegion: "ap-southeast-2", 
  enableRagReplicas: true, // Enable for production availability
  enableBotStoreReplicas: true, // Enable for production availability
  enableLambdaSnapStart: true, // Enable for production performance
  enableBedrockCrossRegionInference: true, // Enable for production resilience
  selfSignUpEnabled: false, // Disable self-signup for production security
  globalAvailableModels: [
    "claude-v3.5-sonnet",
    "claude-v3.5-haiku",
    "claude-v3-haiku",
    "amazon-nova-pro",
    "amazon-nova-lite"
  ],
});

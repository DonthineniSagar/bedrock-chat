import { BedrockChatParametersInput } from "./lib/utils/parameter-models";

export const bedrockChatParams = new Map<string, BedrockChatParametersInput>();

// Configuration with inference profiles enabled for Claude Sonnet 4
// Default environment with cross-region inference for inference profiles
bedrockChatParams.set("default", {
  bedrockRegion: "us-east-1",
  enableRagReplicas: false, // Cost saving - disable replicas
  enableBotStoreReplicas: false, // Cost saving - disable bot store replicas
  enableLambdaSnapStart: false, // DISABLED - Save on SnapStart charges for dev environment
  enableBedrockCrossRegionInference: true, // ENABLED - Required for inference profiles

  // Custom domain configuration
  alternateDomainName: "chat.cloudpro-digital.co.nz",
  hostedZoneId: "Z1047836YHDM15Z2GKR5",

  // Claude models with inference profiles support
  globalAvailableModels: [
    "arn:aws:bedrock:us-east-1:314485284702:inference-profile/global.anthropic.claude-sonnet-4-20250514-v1:0", // Claude Sonnet 4 - Inference Profile
    "claude-v4-opus",        // Claude 4.0 Opus - Most advanced model
    "claude-v4-sonnet",      // Claude 4.0 Sonnet - Balanced performance
    "claude-v3.7-sonnet",    // Claude 3.7 Sonnet - Enhanced capabilities
    "claude-v3.5-sonnet-v2", // Claude 3.5 Sonnet v2 - Improved version
    "claude-v3.5-sonnet",    // Claude 3.5 Sonnet - Premium model
    "claude-v3.5-haiku",     // Claude 3.5 Haiku - Fast & efficient
    "amazon-nova-lite",      // Multimodal Nova model
    "amazon-nova-micro"      // Ultra-cheap option
  ], // Models with inference profile support

  // Security settings
  selfSignUpEnabled: true, // Enable for dev environment convenience
});

// Development environment with inference profiles
bedrockChatParams.set("dev", {
  bedrockRegion: "us-east-1",
  enableRagReplicas: false, // Cost saving for dev environment
  enableBotStoreReplicas: false, // Cost saving for dev environment
  enableLambdaSnapStart: false, // Disable to save on SnapStart charges in dev
  enableBedrockCrossRegionInference: true, // ENABLED - Required for inference profiles
  selfSignUpEnabled: true, // Allow self-signup for dev testing
  globalAvailableModels: [
    "arn:aws:bedrock:us-east-1:314485284702:inference-profile/global.anthropic.claude-sonnet-4-20250514-v1:0", // Claude Sonnet 4 - Inference Profile
    "claude-v4-opus",        // Claude 4.0 Opus - Most advanced model
    "claude-v4-sonnet",      // Claude 4.0 Sonnet - Balanced performance
    "claude-v3.7-sonnet",    // Claude 3.7 Sonnet - Enhanced capabilities
    "claude-v3.5-sonnet-v2", // Claude 3.5 Sonnet v2 - Improved version
    "claude-v3.5-sonnet",    // Claude 3.5 Sonnet - Premium model
    "claude-v3.5-haiku",     // Claude 3.5 Haiku - Efficient for development
    "amazon-nova-lite"
  ],
});

// Production environment with inference profiles
bedrockChatParams.set("prod", {
  bedrockRegion: "us-east-1",
  enableRagReplicas: true, // Enable for production availability
  enableBotStoreReplicas: true, // Enable for production availability
  enableLambdaSnapStart: true, // Enable for production performance
  enableBedrockCrossRegionInference: true, // ENABLED - Required for inference profiles
  selfSignUpEnabled: false, // Disable self-signup for production security
  globalAvailableModels: [
    "arn:aws:bedrock:us-east-1:314485284702:inference-profile/global.anthropic.claude-sonnet-4-20250514-v1:0", // Claude Sonnet 4 - Inference Profile
    "claude-v4-opus",        // Claude 4.0 Opus - Most advanced model
    "claude-v4-sonnet",      // Claude 4.0 Sonnet - Balanced performance
    "claude-v3.7-sonnet",    // Claude 3.7 Sonnet - Enhanced capabilities
    "claude-v3.5-sonnet-v2", // Claude 3.5 Sonnet v2 - Improved version
    "claude-v3.5-sonnet",    // Claude 3.5 Sonnet
    "claude-v3.5-haiku",     // Claude 3.5 Haiku
    "claude-v3-haiku",       // Claude 3 Haiku
    "amazon-nova-pro",       // Nova Pro
    "amazon-nova-lite"       // Nova Lite
  ],
});

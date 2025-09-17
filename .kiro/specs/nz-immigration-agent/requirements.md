# Requirements Document

## Introduction

The Kiwi Navigator is an intelligent agent designed to help users navigate New Zealand's immigration system by crawling and analyzing official NZ immigration websites. The agent will provide accurate, up-to-date information about visa requirements, application processes, and immigration policies by accessing official government sources.

## Requirements

### Requirement 1

**User Story:** As a potential immigrant to New Zealand, I want to ask questions about visa requirements and get accurate answers from official sources, so that I can make informed decisions about my immigration journey.

#### Acceptance Criteria

1. WHEN a user asks about visa types THEN the system SHALL provide information sourced from official NZ immigration websites
2. WHEN a user requests specific visa requirements THEN the system SHALL return current eligibility criteria and documentation requirements
3. WHEN the system provides information THEN it SHALL cite the official source URL and last updated date
4. IF information is not available or unclear THEN the system SHALL direct users to contact Immigration New Zealand directly

### Requirement 2

**User Story:** As an immigration consultant, I want to access the latest policy changes and updates, so that I can provide current advice to my clients.

#### Acceptance Criteria

1. WHEN the agent crawls official websites THEN it SHALL identify and prioritize recent policy updates and changes
2. WHEN policy changes are detected THEN the system SHALL highlight what has changed from previous versions
3. WHEN providing policy information THEN the system SHALL include effective dates and transition periods
4. IF multiple policy versions exist THEN the system SHALL clearly indicate which version is currently active

### Requirement 3

**User Story:** As a user with specific circumstances, I want to get personalized guidance based on my situation, so that I can understand which immigration pathways apply to me.

#### Acceptance Criteria

1. WHEN a user describes their background and goals THEN the system SHALL suggest relevant visa categories
2. WHEN providing pathway recommendations THEN the system SHALL explain eligibility requirements for each option
3. WHEN multiple pathways are available THEN the system SHALL compare advantages and requirements of each
4. IF user circumstances are complex THEN the system SHALL recommend seeking professional immigration advice

### Requirement 4

**User Story:** As a user researching immigration timelines, I want to understand processing times and application procedures, so that I can plan my immigration timeline effectively.

#### Acceptance Criteria

1. WHEN a user asks about processing times THEN the system SHALL provide current official processing timeframes
2. WHEN explaining application procedures THEN the system SHALL outline step-by-step processes with required documentation
3. WHEN processing times vary by location or circumstances THEN the system SHALL specify these variations
4. IF processing times have recently changed THEN the system SHALL indicate the change and effective date
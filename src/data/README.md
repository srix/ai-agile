# Skill Multipliers Data

This directory contains configuration data for the AI Sprint Simulator.

## skillMultipliers.csv

This CSV file defines the capacity multipliers for different skill levels and areas.

### Format

- **skill_level**: The experience level (junior, mid, senior, lead)
- **backend**: Multiplier for backend development work
- **frontend**: Multiplier for frontend development work
- **fullstack**: Multiplier for fullstack development work
- **qa**: Multiplier for QA/testing work
- **devops**: Multiplier for DevOps/infrastructure work
- **mobile**: Multiplier for mobile development work

### How it works

Each multiplier represents the relative capacity contribution of a team member at that skill level in that area. For example:
- A senior backend developer (1.0) contributes twice as much as a junior backend developer (0.5)
- A lead fullstack developer (1.3) contributes more than a senior in a single area

The multipliers are multiplied by the team member's availability percentage to calculate their actual daily capacity contribution.

### Editing

You can edit this CSV file directly to adjust capacity calculations. Changes will be reflected immediately when you reload the application.


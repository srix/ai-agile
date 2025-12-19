import { Story, Epic } from '../types';

// Rule-based story generation (v1 - deterministic)
export function generateStoriesFromEpic(epicDescription: string): Story[] {
  const stories: Story[] = [];
  const lowerDesc = epicDescription.toLowerCase();
  const baseId = Date.now();
  let storyIndex = 1;

  // Simple keyword-based breakdown
  if (lowerDesc.includes('api') || lowerDesc.includes('backend')) {
    stories.push({
      id: `story-${baseId}-${storyIndex++}`,
      title: 'Design and implement API endpoints',
      description: 'Create RESTful API endpoints with proper error handling and validation',
      points: 8,
      status: 'planned',
    });
    stories.push({
      id: `story-${baseId}-${storyIndex++}`,
      title: 'Database schema and migrations',
      description: 'Design database schema and create migration scripts',
      points: 5,
      status: 'planned',
    });
  }

  if (lowerDesc.includes('ui') || lowerDesc.includes('frontend') || lowerDesc.includes('interface')) {
    stories.push({
      id: `story-${baseId}-${storyIndex++}`,
      title: 'Build user interface components',
      description: 'Create responsive UI components with proper styling',
      points: 8,
      status: 'planned',
    });
    stories.push({
      id: `story-${baseId}-${storyIndex++}`,
      title: 'Implement user interactions',
      description: 'Add event handlers and state management for user interactions',
      points: 5,
      status: 'planned',
    });
  }

  if (lowerDesc.includes('auth') || lowerDesc.includes('login') || lowerDesc.includes('authentication')) {
    stories.push({
      id: `story-${baseId}-${storyIndex++}`,
      title: 'Implement authentication system',
      description: 'Set up user authentication with secure token management',
      points: 13,
      status: 'planned',
    });
  }

  if (lowerDesc.includes('test') || lowerDesc.includes('testing')) {
    stories.push({
      id: `story-${baseId}-${storyIndex++}`,
      title: 'Write unit and integration tests',
      description: 'Create comprehensive test coverage for critical paths',
      points: 8,
      status: 'planned',
    });
  }

  // Default stories if no specific keywords found
  if (stories.length === 0) {
    stories.push(
      {
        id: `story-${baseId}-${storyIndex++}`,
        title: 'Initial setup and configuration',
        description: 'Set up project structure and development environment',
        points: 5,
        status: 'planned',
      },
      {
        id: `story-${baseId}-${storyIndex++}`,
        title: 'Core feature implementation',
        description: 'Implement main functionality based on requirements',
        points: 13,
        status: 'planned',
      },
      {
        id: `story-${baseId}-${storyIndex++}`,
        title: 'Testing and validation',
        description: 'Test the implementation and fix any issues',
        points: 8,
        status: 'planned',
      }
    );
  }

  return stories;
}

export function createEpicFromDescription(title: string, description: string): Epic {
  const stories = generateStoriesFromEpic(description);
  const totalPoints = stories.reduce((sum, story) => sum + story.points, 0);

  return {
    id: `epic-${Date.now()}`,
    title,
    description,
    stories,
    totalPoints,
  };
}


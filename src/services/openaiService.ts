import { Story } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIStoryResponse {
  title: string;
  description: string;
  points: number;
}

/**
 * Generates user stories from an epic description using OpenAI
 */
export async function generateStoriesWithOpenAI(
  epicTitle: string,
  epicDescription: string
): Promise<Story[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.');
  }

  const systemPrompt = `You are an expert Agile product owner who breaks down epics into well-structured user stories.

Your task is to analyze an epic description and generate a list of user stories with:
1. Clear, actionable titles
2. Detailed descriptions
3. Story point estimates using Fibonacci sequence (1, 2, 3, 5, 8, 13, 21)

Return ONLY a valid JSON array of stories in this exact format:
[
  {
    "title": "Story title",
    "description": "Detailed description of what needs to be done",
    "points": 8
  }
]

Guidelines:
- Break down the epic into 3-8 stories
- Each story should be independently deliverable
- Points should reflect complexity (1=trivial, 13=complex, 21=very complex)
- Include stories for backend, frontend, testing, and infrastructure as needed
- Be specific and technical`;

  const userPrompt = `Epic Title: ${epicTitle}

Epic Description:
${epicDescription}

Generate user stories for this epic. Return only the JSON array, no additional text.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using cost-effective model
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    // Extract JSON from response (handle cases where there might be markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }

    const stories: OpenAIStoryResponse[] = JSON.parse(jsonContent);

    // Convert to Story format with unique IDs
    const baseId = Date.now();
    return stories.map((story, index) => ({
      id: `story-${baseId}-${index + 1}`,
      title: story.title,
      description: story.description,
      points: Math.max(1, Math.min(21, story.points)), // Clamp points to valid range
      status: 'planned' as const,
    }));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse OpenAI response: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Checks if OpenAI API key is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!OPENAI_API_KEY;
}


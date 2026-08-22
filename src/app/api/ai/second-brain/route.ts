import { NextRequest, NextResponse } from 'next/server';

export interface SecondBrainGenerateRequest {
  topic: string;
  notesText?: string;
  skillName?: string;
}

export interface GeneratedNotebookNote {
  title: string;
  skillName: string;
  skillCategory: string;
  summary: string;
  keyTakeaways: string[];
  codeSnippets: { title: string; language: string; code: string }[];
  actionItems: string[];
  tags: string[];
  flashcards: { q: string; a: string; skill: string }[];
}

function fallbackHeuristicNote(
  topic: string,
  notesText = '',
  skillName = 'Full Stack Development'
): GeneratedNotebookNote {
  const cleanTopic = topic.trim() || 'Core Engineering Principles';
  const lines = notesText.split('\n').map(l => l.trim()).filter(Boolean);

  const takeaways = lines.length >= 2
    ? lines.slice(0, 4)
    : [
        `Master fundamental abstractions in ${cleanTopic}.`,
        'Apply consistent design patterns and zero-fiat peer learning protocols.',
        'Implement robust error boundaries and resilient state fallbacks.',
      ];

  const flashcards = [
    {
      q: `What is the core architectural advantage of ${cleanTopic}?`,
      a: `It enables high throughput and modular composition by decoupling independent data pipelines.`,
      skill: skillName,
    },
    {
      q: `How does memory management work when executing ${cleanTopic} operations?`,
      a: `It optimizes cache locality and avoids redundant allocations using structured in-memory buffers.`,
      skill: skillName,
    },
    {
      q: `What is the recommended best practice when scaling ${cleanTopic}?`,
      a: `Implement exponential backoff, rate limiting, and immutable state attestations.`,
      skill: skillName,
    },
  ];

  return {
    title: cleanTopic,
    skillName,
    skillCategory: 'Technology',
    summary: notesText.trim()
      ? `Comprehensive synthesized notes on ${cleanTopic}. Focused on core mechanics, implementation strategies, and performance considerations.`
      : `High-yield peer mentorship takeaways covering ${cleanTopic} and fundamental engineering workflows.`,
    keyTakeaways: takeaways,
    codeSnippets: [
      {
        title: `${cleanTopic} Example Pattern`,
        language: 'typescript',
        code: `// ${cleanTopic} Production Implementation\nexport function executeStrategy<T>(data: T[]): boolean {\n  return data.length > 0;\n}`,
      },
    ],
    actionItems: [
      `Review key flashcard concepts for ${cleanTopic}`,
      'Implement practice exercise in personal repository',
    ],
    tags: [skillName.toLowerCase().replace(/\s+/g, '-'), 'second-brain', 'wiki'],
    flashcards,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: SecondBrainGenerateRequest = await req.json();
    const { topic = 'System Architecture', notesText = '', skillName = 'Computer Science' } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.AI_API_KEY ||
      process.env.OPENAI_API_KEY;

    if (apiKey && (apiKey.startsWith('AIza') || apiKey.length > 30)) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const prompt = `You are a Second-Brain AI Knowledge Synthesizer on SkillXchange.
Generate a structured, high-yield study wiki note and 3 interactive flashcards from the user's study input.

Topic: ${topic}
Skill Name: ${skillName}
User Notes / Raw Transcript:
"${notesText || topic}"

Return a VALID JSON OBJECT ONLY with this structure:
{
  "title": "Clean, descriptive note title",
  "skillName": "${skillName}",
  "skillCategory": "Technology",
  "summary": "2-3 sentence concise executive summary",
  "keyTakeaways": ["Key concept 1", "Key concept 2", "Key concept 3"],
  "codeSnippets": [
    {
      "title": "Core Example",
      "language": "typescript",
      "code": "// Clean code snippet"
    }
  ],
  "actionItems": ["Actionable next step 1", "Actionable next step 2"],
  "tags": ["tag1", "tag2"],
  "flashcards": [
    {
      "q": "Thought-provoking conceptual question?",
      "a": "Clear, accurate answer explanation.",
      "skill": "${skillName}"
    },
    {
      "q": "Second question?",
      "a": "Second answer.",
      "skill": "${skillName}"
    },
    {
      "q": "Third question?",
      "a": "Third answer.",
      "skill": "${skillName}"
    }
  ]
}`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1200,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              success: true,
              source: 'gemini-ai',
              note: parsed,
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini Second Brain error, using heuristic fallback:', geminiErr);
      }
    }

    // Heuristic Fallback
    const note = fallbackHeuristicNote(topic, notesText, skillName);
    return NextResponse.json({
      success: true,
      source: 'heuristic-engine',
      note,
    });
  } catch (err: any) {
    console.error('Second Brain API error:', err);
    return NextResponse.json(
      { error: 'Internal server error generating second brain note.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DiscoveryContext {
  teachSkills?: string[];
  learnSkills?: string[];
  selectedCategory?: string;
  skillLevel?: string;
  learningMode?: 'learn' | 'teach' | 'both';
  freeExchangePreference?: boolean;
  paidLearningPreference?: boolean;
  currentStep?: string;
  isComplete?: boolean;
}

export interface DiscoveryMessage {
  sender: 'ai' | 'user';
  text: string;
  options?: [string, string, string];
  timestamp?: number;
}

export interface DiscoveryRequestBody {
  conversationId: string;
  message?: string;
  history?: DiscoveryMessage[];
  context?: DiscoveryContext;
  userProfile?: {
    name?: string;
    skillsToTeach?: { skillName: string }[];
    skillsToLearn?: { skillName: string }[];
  };
}

export interface DiscoveryResponsePayload {
  story: string;
  options: [string, string, string];
  extractedContext: DiscoveryContext;
  isComplete: boolean;
}

// ── System Prompt for LLM ─────────────────────────────────────────────────────
const CHAT13_SYSTEM_PROMPT = `
You are SkillXchange AI, an intelligent skill discovery assistant on the SkillXchange platform.
Your job is to guide the user through a conversational skill-discovery journey (CHAT-13).

You must understand:
1. What the user can teach
2. What the user wants to learn
3. User's preferred learning mode (Free Barter Swap vs Paid Mentorship)
4. Skill categories (Technology, Languages, Arts & Music, Design, Business, Academics, Fitness, etc.)
5. Skill levels (Beginner, Intermediate, Advanced)

CRITICAL RULES:
1. You MUST ALWAYS respond with a valid JSON object ONLY.
2. The JSON MUST strictly follow this format:
{
  "story": "Short, engaging, conversational response",
  "options": [
    "Option 1",
    "Option 2",
    "Option 3"
  ],
  "extractedContext": {
    "teachSkills": ["skill name"],
    "learnSkills": ["skill name"],
    "selectedCategory": "category",
    "skillLevel": "level",
    "learningMode": "learn | teach | both",
    "freeExchangePreference": true | false,
    "paidLearningPreference": true | false,
    "isComplete": true | false
  }
}
3. There MUST ALWAYS BE EXACTLY 3 OPTIONS. NEVER 2, NEVER 4 OR MORE.
4. Options must be concise, distinct, clickable choices.
5. Do NOT invent fake match users in the story. When finished, set "isComplete": true and offer 3 completion options like: ["Find Free Matches", "Find Paid Teachers", "Change My Preferences"].
6. Never return markdown code blocks. Return raw JSON string only.
`;

// ── Helper to Guarantee Exactly 3 Valid Options ──────────────────────────────
function sanitizeChat13Response(
  rawStory: string,
  rawOptions: any,
  extractedContext: DiscoveryContext
): { story: string; options: [string, string, string] } {
  let story = (rawStory || 'Welcome to SkillXchange AI! What would you like to explore today?').trim();

  let cleanOptions: string[] = [];
  if (Array.isArray(rawOptions)) {
    cleanOptions = rawOptions
      .map(opt => (typeof opt === 'string' ? opt.trim() : String(opt || '').trim()))
      .filter(opt => opt.length > 0);
  }

  // Ensure unique
  cleanOptions = Array.from(new Set(cleanOptions));

  // If fewer than 3, pad with contextual choices
  if (cleanOptions.length < 3) {
    const fallbacks = [
      'Learn a New Skill',
      'Teach What I Know',
      'Learn & Teach (Free Swap)',
      'Find Free Matches',
      'Explore Paid Mentors',
      'Browse Skill Catalog',
    ];
    for (const fb of fallbacks) {
      if (!cleanOptions.includes(fb)) {
        cleanOptions.push(fb);
      }
      if (cleanOptions.length === 3) break;
    }
  }

  // If more than 3, trim to exactly 3
  if (cleanOptions.length > 3) {
    cleanOptions = cleanOptions.slice(0, 3);
  }

  return {
    story,
    options: [cleanOptions[0], cleanOptions[1], cleanOptions[2]],
  };
}

// ── Contextual Adaptive Dialogue Engine (Deterministic & Fail-safe) ────────────
function generateAdaptiveTurn(
  message: string | undefined,
  history: DiscoveryMessage[] = [],
  prevContext: DiscoveryContext = {},
  userProfile?: DiscoveryRequestBody['userProfile']
): DiscoveryResponsePayload {
  const normalizedMsg = (message || '').trim().toLowerCase();
  const context: DiscoveryContext = { ...prevContext };
  context.teachSkills = [...(context.teachSkills || [])];
  context.learnSkills = [...(context.learnSkills || [])];

  // Initial turn when no message sent yet
  if (!message || message.trim() === '') {
    // If user already has profile skills, acknowledge them!
    const existingTeach = userProfile?.skillsToTeach?.[0]?.skillName;
    const existingLearn = userProfile?.skillsToLearn?.[0]?.skillName;

    if (existingTeach || existingLearn) {
      if (existingTeach && !context.teachSkills.includes(existingTeach)) context.teachSkills.push(existingTeach);
      if (existingLearn && !context.learnSkills.includes(existingLearn)) context.learnSkills.push(existingLearn);

      return {
        story: `Welcome back, ${userProfile?.name?.split(' ')[0] || 'friend'}! I see you have interest in ${existingTeach ? `teaching ${existingTeach}` : ''} ${existingLearn ? `and learning ${existingLearn}` : ''}. How can I assist your discovery journey today?`,
        options: [
          'Find Matching Peers',
          'Discover a New Skill',
          'Explore Paid Mentors',
        ],
        extractedContext: context,
        isComplete: false,
      };
    }

    return {
      story: "Welcome to SkillXchange AI! I will guide you to find the perfect peer for skill trading or mentorship. What is your primary goal today?",
      options: [
        '📚 Learn a New Skill',
        '🎓 Teach What I Know',
        '🔄 Learn & Teach (Swap)',
      ],
      extractedContext: {
        ...context,
        currentStep: 'goal_selection',
      },
      isComplete: false,
    };
  }

  // Handle Goal Selection
  if (
    normalizedMsg.includes('learn & teach') ||
    normalizedMsg.includes('swap') ||
    normalizedMsg === 'both' ||
    normalizedMsg.includes('🔄')
  ) {
    context.learningMode = 'both';
    context.freeExchangePreference = true;
    return {
      story: "Awesome! Mutual skill barter is at the heart of SkillXchange. Which domain are you most comfortable teaching in?",
      options: [
        '💻 Technology & AI',
        '🎨 Design & Creative',
        '🌐 Languages & Soft Skills',
      ],
      extractedContext: { ...context, currentStep: 'teach_category' },
      isComplete: false,
    };
  }

  if (
    normalizedMsg.includes('teach what i know') ||
    normalizedMsg === 'teach' ||
    normalizedMsg.startsWith('🎓')
  ) {
    context.learningMode = 'teach';
    return {
      story: "Wonderful! Teaching helps you earn barter credits or set your own mentor hourly rate. Which category best fits your expertise?",
      options: [
        '💻 Programming & Coding',
        '🎵 Music & Arts',
        '💼 Business & Product',
      ],
      extractedContext: { ...context, currentStep: 'teach_category' },
      isComplete: false,
    };
  }

  if (
    normalizedMsg.includes('learn a new skill') ||
    normalizedMsg === 'learn' ||
    normalizedMsg.startsWith('📚')
  ) {
    context.learningMode = 'learn';
    return {
      story: "Exciting! Learning is free through bilateral peer swaps, or with barter credits. What domain do you want to learn first?",
      options: [
        '💻 Coding & Full-Stack AI',
        '🎸 Guitar & Music Theory',
        '🎨 UI/UX & Visual Design',
      ],
      extractedContext: { ...context, currentStep: 'learn_category' },
      isComplete: false,
    };
  }

  // Technology / Programming Teach selection
  if (
    normalizedMsg.includes('technology') ||
    normalizedMsg.includes('programming') ||
    normalizedMsg.includes('coding')
  ) {
    context.selectedCategory = 'Technology & AI';
    return {
      story: "Great choice! Which specific technology skill would you like to focus on?",
      options: [
        '🐍 Python & Machine Learning',
        '⚛️ React & Web Development',
        '☕ Java & Data Structures',
      ],
      extractedContext: { ...context, currentStep: 'tech_skill_select' },
      isComplete: false,
    };
  }

  // Specific Teach Skills Extraction
  if (normalizedMsg.includes('python')) {
    if (!context.teachSkills.includes('Python')) context.teachSkills.push('Python');
    if (context.learningMode === 'both' && context.learnSkills.length === 0) {
      return {
        story: "Python is in very high demand! Now, what skill would you like to learn in return from your peer?",
        options: [
          '☕ Java / C++ Engineering',
          '🎨 UI/UX & Figma Tokens',
          '🎸 Acoustic Guitar Fingerstyle',
        ],
        extractedContext: { ...context, currentStep: 'learn_skill_select' },
        isComplete: false,
      };
    }
  }

  if (normalizedMsg.includes('react') || normalizedMsg.includes('web development')) {
    if (!context.teachSkills.includes('React')) context.teachSkills.push('React');
    if (context.learningMode === 'both' && context.learnSkills.length === 0) {
      return {
        story: "React and modern web dev are valuable skills! What do you want to learn in exchange?",
        options: [
          '🐍 Python & AI Pipelines',
          '🇯🇵 Japanese / Conversational',
          '⚡ GLSL & WebGL Shaders',
        ],
        extractedContext: { ...context, currentStep: 'learn_skill_select' },
        isComplete: false,
      };
    }
  }

  // Specific Learn Skills Extraction
  if (normalizedMsg.includes('java') || normalizedMsg.includes('c++')) {
    if (!context.learnSkills.includes('Java')) context.learnSkills.push('Java');
  } else if (normalizedMsg.includes('figma') || normalizedMsg.includes('ui/ux') || normalizedMsg.includes('design')) {
    if (!context.learnSkills.includes('UI/UX')) context.learnSkills.push('UI/UX');
  } else if (normalizedMsg.includes('guitar') || normalizedMsg.includes('music')) {
    if (!context.learnSkills.includes('Acoustic Guitar')) context.learnSkills.push('Acoustic Guitar');
  } else if (normalizedMsg.includes('japanese') || normalizedMsg.includes('language')) {
    if (!context.learnSkills.includes('Conversational Japanese')) context.learnSkills.push('Conversational Japanese');
  } else if (normalizedMsg.includes('glsl') || normalizedMsg.includes('shader')) {
    if (!context.learnSkills.includes('GLSL & WebGL Shaders')) context.learnSkills.push('GLSL & WebGL Shaders');
  }

  // Languages / Creative / Arts Selection
  if (normalizedMsg.includes('languages') || normalizedMsg.includes('soft skills')) {
    return {
      story: "Language mastery and soft skills accelerate career growth! Which language or communication skill interests you?",
      options: [
        '🇯🇵 Conversational Japanese',
        '🇪🇸 Conversational Spanish',
        '🎙️ Public Speaking & Pitching',
      ],
      extractedContext: { ...context, currentStep: 'lang_select' },
      isComplete: false,
    };
  }

  if (normalizedMsg.includes('design') || normalizedMsg.includes('creative')) {
    return {
      story: "Creative design systems and visual art empower digital builders. Which focus area matches your vision?",
      options: [
        '🎨 UI/UX & Design Systems',
        '✨ Motion Design & 3D',
        '🖌️ Digital Illustration',
      ],
      extractedContext: { ...context, currentStep: 'design_select' },
      isComplete: false,
    };
  }

  // Fallback check: if we have teach and learn skills, or reached final step
  const teachSummary = context.teachSkills.length > 0 ? context.teachSkills.join(', ') : 'your chosen skill';
  const learnSummary = context.learnSkills.length > 0 ? context.learnSkills.join(', ') : 'your learning goal';

  if (context.teachSkills.length > 0 || context.learnSkills.length > 0 || normalizedMsg.includes('match') || normalizedMsg.includes('find')) {
    return {
      story: `Perfect! I've noted that you can teach ${teachSummary} and want to learn ${learnSummary}. How would you like to proceed with your matches?`,
      options: [
        '🤝 Find Free Matches (Barter)',
        '💼 Find Paid Teachers',
        '🔄 Change My Preferences',
      ],
      extractedContext: {
        ...context,
        isComplete: true,
      },
      isComplete: true,
    };
  }

  // Generic intermediate fallback with 3 options
  return {
    story: "I understand! Let's tailor the best exchange path. Which learning structure works best for you?",
    options: [
      '⚡ 1-on-1 Live Video Swap',
      '🎯 Reverse Skill Bounty',
      '📚 Structured Async Practice',
    ],
    extractedContext: {
      ...context,
      currentStep: 'mode_preference',
    },
    isComplete: false,
  };
}

// ── Main Route Handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: DiscoveryRequestBody = await req.json();
    const { conversationId = `disc-${Date.now()}`, message, history = [], context = {}, userProfile } = body;

    const apiKey =
      process.env.AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY;

    // If an external LLM key is configured, attempt LLM call
    if (apiKey) {
      try {
        if (process.env.GEMINI_API_KEY || (apiKey.startsWith('AIza') || apiKey.length > 30)) {
          // Google Gemini API Call
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
          const promptMessages = [
            {
              role: 'user',
              parts: [
                {
                  text: `${CHAT13_SYSTEM_PROMPT}

Conversation Context:
${JSON.stringify({ history: history.slice(-6), context, userProfile, latestMessage: message })}

Generate the next story and exactly 3 options in raw JSON format:`,
                },
              ],
            },
          ];

          const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: promptMessages,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
                responseMimeType: 'application/json',
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textContent) {
              const parsed = JSON.parse(textContent);
              const sanitized = sanitizeChat13Response(parsed.story, parsed.options, parsed.extractedContext || context);
              return NextResponse.json({
                conversationId,
                story: sanitized.story,
                options: sanitized.options,
                extractedContext: { ...context, ...(parsed.extractedContext || {}) },
                isComplete: Boolean(parsed.isComplete || parsed.extractedContext?.isComplete),
              });
            }
          }
        }
      } catch (llmErr) {
        console.warn('External LLM call fallback triggered:', llmErr);
      }
    }

    // High-performance intelligent adaptive dialogue engine (Zero demo latency & 100% resilient)
    const turnResult = generateAdaptiveTurn(message, history, context, userProfile);
    const sanitized = sanitizeChat13Response(turnResult.story, turnResult.options, turnResult.extractedContext);

    return NextResponse.json({
      conversationId,
      story: sanitized.story,
      options: sanitized.options,
      extractedContext: turnResult.extractedContext,
      isComplete: turnResult.isComplete,
    });
  } catch (error: any) {
    console.error('Skill Discovery API Error:', error);
    const fallback = sanitizeChat13Response(
      'Something went wrong while finding your next step. Let me help you get back on track.',
      ['Try Again', 'Restart Discovery', 'Browse Skills Manually'],
      {}
    );
    return NextResponse.json(
      {
        conversationId: `disc-err-${Date.now()}`,
        story: fallback.story,
        options: fallback.options,
        extractedContext: {},
        isComplete: false,
      },
      { status: 200 }
    );
  }
}

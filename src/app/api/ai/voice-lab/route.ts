import { NextRequest, NextResponse } from 'next/server';

export interface VoiceLabRequest {
  scenario: string;
  transcript: string;
  durationSeconds?: number;
}

export interface VoiceLabAnalysis {
  clarityScore: number;
  confidenceScore: number;
  wordsPerMinute: number;
  tonalCadence: string;
  fillerWordsCount: number;
  fillerWordsList: { word: string; count: number }[];
  strengths: string[];
  areasForImprovement: string[];
  coachFeedback: string;
  suggestedScript: string;
}

const SYSTEM_PROMPT = `
You are an expert AI Executive Speech & Communication Coach on SkillXchange.
Your job is to analyze the user's spoken rehearsal transcript for a given scenario (e.g., Investor Pitch, Tech Defense, Salary Negotiation, Public Speaking).

Analyze the speech objectively on:
1. Clarity & Conciseness (0-100%)
2. Tonal Confidence & Persuasiveness (0-100%)
3. Speech Pace (Words Per Minute: optimal is 130-160 WPM)
4. Filler Words (e.g., 'um', 'uh', 'like', 'basically', 'actually', 'you know', 'sort of', 'kind of')
5. Specific Strengths (2-3 crisp bullet points)
6. Actionable Areas for Improvement (2-3 actionable advice points)
7. Overall Coach Feedback (2-3 supportive, executive-level sentences)
8. Suggested Rephrasing / Polished Script (A cleaner, more punchy, professional version of what they said)

CRITICAL: Return a VALID RAW JSON OBJECT ONLY with NO markdown wrapper:
{
  "clarityScore": 88,
  "confidenceScore": 85,
  "wordsPerMinute": 140,
  "tonalCadence": "Authoritative & Clear",
  "fillerWordsCount": 3,
  "fillerWordsList": [
    { "word": "basically", "count": 2 },
    { "word": "like", "count": 1 }
  ],
  "strengths": [
    "Clear problem-solution framing with concrete technical terms.",
    "Good narrative structure with logical transitions."
  ],
  "areasForImprovement": [
    "Reduce reliance on filler words like 'basically'.",
    "Strengthen the final call to action."
  ],
  "coachFeedback": "Strong opening with compelling technical substance. Refining your cadence during key transition sentences will significantly elevate your executive presence.",
  "suggestedScript": "Our distributed key-value database achieves sub-millisecond p99 latency by utilizing zero-copy memory mapped files and asynchronous write-ahead logging."
}
`;

function fallbackHeuristicAnalysis(
  scenario: string,
  transcript: string,
  durationSeconds = 30
): VoiceLabAnalysis {
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const calculatedWPM = Math.max(80, Math.min(220, Math.round((wordCount / Math.max(10, durationSeconds)) * 60)));

  const fillerTerms = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of', 'literally', 'right'];
  const fillerList: { word: string; count: number }[] = [];
  let totalFillers = 0;

  fillerTerms.forEach(term => {
    const reg = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = transcript.match(reg);
    if (matches && matches.length > 0) {
      fillerList.push({ word: term, count: matches.length });
      totalFillers += matches.length;
    }
  });

  const fillerRatio = wordCount > 0 ? totalFillers / wordCount : 0;
  const clarity = Math.max(65, Math.min(98, Math.round(96 - fillerRatio * 200)));
  const confidence = Math.max(70, Math.min(99, Math.round(92 - (calculatedWPM < 110 || calculatedWPM > 180 ? 12 : 0) - totalFillers * 3)));

  let tonalCadence = 'Well-Balanced & Professional';
  if (calculatedWPM > 170) tonalCadence = 'Fast-Paced & Energetic';
  else if (calculatedWPM < 115) tonalCadence = 'Deliberate & Measured';
  else if (totalFillers > 5) tonalCadence = 'Hesitant Transitions';

  const cleanedScript = transcript
    .replace(/\b(um|uh|like|basically|actually|you know)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return {
    clarityScore: clarity,
    confidenceScore: confidence,
    wordsPerMinute: calculatedWPM,
    tonalCadence,
    fillerWordsCount: totalFillers,
    fillerWordsList: fillerList,
    strengths: [
      `Articulated core message relevant to "${scenario}".`,
      `Maintained a communicative speaking rhythm of ~${calculatedWPM} WPM.`,
      `Demonstrated authentic domain knowledge in vocabulary.`,
    ],
    areasForImprovement: [
      totalFillers > 0
        ? `Replace ${totalFillers} detected filler word${totalFillers > 1 ? 's' : ''} (${fillerList.map(f => `"${f.word}"`).join(', ')}) with brief 1-second strategic pauses.`
        : 'Incorporate higher dynamic vocal range to emphasize key takeaways.',
      'Conclude with an assertive closing hook to solidify audience retention.',
    ],
    coachFeedback: `Solid rehearsal delivery for "${scenario}". You conveyed the essential points with good conviction. Fine-tuning your breathing pauses will further enhance your executive presence.`,
    suggestedScript: cleanedScript || transcript,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: VoiceLabRequest = await req.json();
    const { scenario = 'Executive Pitch', transcript = '', durationSeconds = 30 } = body;

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: 'Transcript text is required for AI speech evaluation.' },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.AI_API_KEY ||
      process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const promptText = `${SYSTEM_PROMPT}

Target Scenario: ${scenario}
Speech Duration: ${durationSeconds} seconds
Speech Transcript to Analyze:
"${transcript}"

Output valid JSON:`;

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: promptText }],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1000,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawOutput) {
            const parsed: VoiceLabAnalysis = JSON.parse(rawOutput);
            return NextResponse.json({
              success: true,
              source: 'gemini-ai',
              analysis: {
                clarityScore: Number(parsed.clarityScore) || 88,
                confidenceScore: Number(parsed.confidenceScore) || 85,
                wordsPerMinute: Number(parsed.wordsPerMinute) || 140,
                tonalCadence: parsed.tonalCadence || 'Persuasive & Clear',
                fillerWordsCount: Number(parsed.fillerWordsCount) || 0,
                fillerWordsList: Array.isArray(parsed.fillerWordsList) ? parsed.fillerWordsList : [],
                strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Clear narrative structure.'],
                areasForImprovement: Array.isArray(parsed.areasForImprovement) ? parsed.areasForImprovement : ['Refine vocal pauses.'],
                coachFeedback: parsed.coachFeedback || 'Great rehearsal.',
                suggestedScript: parsed.suggestedScript || transcript,
              },
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini Voice Lab call error, using resilient analyzer:', geminiError);
      }
    }

    // Resilient heuristic analyzer fallback
    const heuristic = fallbackHeuristicAnalysis(scenario, transcript, durationSeconds);
    return NextResponse.json({
      success: true,
      source: 'heuristic-engine',
      analysis: heuristic,
    });
  } catch (err: any) {
    console.error('Voice Lab API route error:', err);
    return NextResponse.json(
      { error: 'Internal server error processing speech excerpt.' },
      { status: 500 }
    );
  }
}

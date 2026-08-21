import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface ExplainParams {
  currentStep: {
    id: string;
    code: string;
    title: string;
    domain?: string;
  };
  completedCerts: Array<{
    id: string;
    code: string;
    title: string;
  }>;
}

/**
 * Generate fallback explanation if all APIs are rate-limited, unreachable, or offline.
 */
export function generateStaticFallback(params: ExplainParams): string {
  const { currentStep, completedCerts } = params;
  
  if (completedCerts.length === 0) {
    return `Starting with ${currentStep.code} (${currentStep.title}) establishes essential foundational knowledge in Microsoft ecosystem principles, preparing you for deeper role-based technical challenges.`;
  }

  const recentCert = completedCerts[completedCerts.length - 1];
  return `Building upon your mastery in ${recentCert.code} (${recentCert.title}), advancing to ${currentStep.code} (${currentStep.title}) is the natural progression to expand your architectural depth, engineering agility, and career readiness.`;
}

// Ordered Gemini cascade from flagship to lower/lite models
const GEMINI_CASCADE = [
  'gemini-3.7-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

// NVIDIA NIM Models to try if Gemini models are busy or 503
const NVIDIA_NIM_MODELS = [
  'meta/llama-3.1-8b-instruct',
  'nvidia/llama-3.1-nemotron-70b-instruct',
  'mistralai/mistral-7b-instruct-v0.3',
];

/**
 * Call NVIDIA NIM OpenAI-compatible API endpoint as secondary failover
 */
async function callNvidiaNim(prompt: string): Promise<{ text: string; model: string } | null> {
  const apiKey = process.env.NVIDIA_API_KEY || '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';
  if (!apiKey) return null;

  for (const nimModel of NVIDIA_NIM_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: nimModel,
          messages: [
            {
              role: 'system',
              content: 'You are an inspiring Microsoft Learning Path advisor. Provide concise, 1-2 sentence high-impact technical rationale explaining why this certification is the next best step.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.6,
          max_tokens: 180,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`NVIDIA NIM ${nimModel} responded with HTTP ${response.status}`);
        continue;
      }

      const data: any = await response.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (text) {
        return { text, model: `nvidia-nim (${nimModel})` };
      }
    } catch (err) {
      console.warn(`NVIDIA NIM call failed for ${nimModel}:`, (err as Error).message);
    }
  }

  return null;
}

/**
 * Call AI explanation engine server-side with automatic cascading fallback:
 * 1. Gemini 3.7 Flash
 * 2. Gemini 2.5 Flash
 * 3. Gemini 2.0 Flash
 * 4. Gemini 2.0 Flash Lite (2B tier)
 * 5. NVIDIA NIM (Llama 3.1 8B / Nemotron)
 * 6. Resilient static fallback
 */
export async function explainNextStep(params: ExplainParams): Promise<{
  cert_id: string;
  explanation: string;
  is_fallback: boolean;
  model: string;
}> {
  const { currentStep, completedCerts } = params;

  const completedSummary = completedCerts.length > 0
    ? completedCerts.map(c => `${c.code}: ${c.title}`).join(', ')
    : 'None (Starting first milestone)';

  const prompt = `You are a Microsoft Certified Technical Career Mentor.
Task: In 1-2 encouraging, precise sentences, explain why learning "${currentStep.code}: ${currentStep.title}" is the logical next step after completing: [${completedSummary}].
Highlight how the concepts from the completed certifications reinforce and enable success in this next certification step. Keep the tone inspiring, professional, and concise.`;

  const ai = getAiClient();

  // 1. Try Gemini cascade
  if (ai) {
    for (const modelName of GEMINI_CASCADE) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on ${modelName}`)), 4500)
        );

        const apiCallPromise = ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.7,
            systemInstruction: 'You are an inspiring Microsoft Learning Path advisor. Provide concise, 1-2 sentence high-impact technical rationale.',
          },
        });

        const response = await Promise.race([apiCallPromise, timeoutPromise]);
        const explanationText = response?.text?.trim();

        if (explanationText) {
          return {
            cert_id: currentStep.id,
            explanation: explanationText,
            is_fallback: modelName !== GEMINI_CASCADE[0],
            model: modelName,
          };
        }
      } catch (error) {
        const errMsg = (error as Error).message || '';
        console.warn(`Gemini ${modelName} encountered issue (${errMsg}). Cascading to next tier...`);
      }
    }
  }

  // 2. If Gemini models are busy/503/exhausted, failover to NVIDIA NIM
  console.log('Gemini cascade busy or unavailable. Invoking NVIDIA NIM failover...');
  const nimResult = await callNvidiaNim(prompt);
  if (nimResult && nimResult.text) {
    return {
      cert_id: currentStep.id,
      explanation: nimResult.text,
      is_fallback: true,
      model: nimResult.model,
    };
  }

  // 3. Resilient static fallback
  console.warn('All Gemini models and NVIDIA NIM failover exhausted. Using resilient static fallback.');
  return {
    cert_id: currentStep.id,
    explanation: generateStaticFallback(params),
    is_fallback: true,
    model: 'static-fallback (resilient mode)',
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StudyAssistRequest {
  messages: ChatMessage[];
  context?: {
    currentDomain?: string;
    completedCerts?: Array<{ code: string; title: string }>;
    targetCert?: string;
  };
}

export interface StudyAssistResponse {
  message: string;
  model: string;
  is_fallback: boolean;
}

/**
 * Handle All-Purpose Study Assist chat interactions with Gemini and failovers
 */
export async function studyAssistChat(req: StudyAssistRequest): Promise<StudyAssistResponse> {
  const { messages, context } = req;
  const userMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');
  const latestUserMessage = userMessages[userMessages.length - 1]?.content || 'Hello';

  const contextStr = context ? `
Current Learning Context:
- Active Track: ${context.currentDomain || 'General Microsoft Cloud'}
- Completed Milestones: ${context.completedCerts?.map(c => `${c.code} (${c.title})`).join(', ') || 'None yet'}
- Target Milestone: ${context.targetCert || 'Flexible'}
` : '';

  const systemInstruction = `You are the ultimate Microsoft Certification & Azure Cloud Study Mentor ("LearnBot AI").
Your purpose is to help students, developers, and architects master Microsoft exam certifications (AZ-900, AZ-104, AZ-305, AZ-400, AI-900, AI-102, SC-900, SC-200, DP-900, DP-203, DP-600, PL-900, etc.).

Your capabilities:
1. Explain complex cloud concepts, architectures, and services (e.g. Azure Networking, IAM, AKS, Entra ID, Fabric, Cosmos DB) clearly with simple analogies and best practices.
2. Provide high-yield exam tips, common distractor traps, and official Microsoft Learn concepts.
3. Generate realistic multiple-choice practice questions with detailed explanations for correct and incorrect options.
4. Recommend tailored study roadmaps, time estimations, and prerequisite sequencing.
5. Answer questions directly, structured with clear headings, bullet points, or code snippets when helpful.
${contextStr}`;

  const ai = getAiClient();

  // Try Gemini Cascade
  if (ai) {
    for (const modelName of GEMINI_CASCADE) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on ${modelName}`)), 7500)
        );

        // Convert messages to Gemini format or contents string
        const conversationHistory = userMessages.map(m => `${m.role === 'user' ? 'Learner' : 'Study Assistant'}: ${m.content}`).join('\n\n');
        const prompt = `${conversationHistory}\n\nStudy Assistant:`;

        const apiCallPromise = ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            temperature: 0.7,
            systemInstruction,
          },
        });

        const response = await Promise.race([apiCallPromise, timeoutPromise]);
        const text = response?.text?.trim();

        if (text) {
          return {
            message: text,
            model: modelName,
            is_fallback: modelName !== GEMINI_CASCADE[0],
          };
        }
      } catch (err) {
        console.warn(`Study Assist Gemini ${modelName} encountered issue:`, (err as Error).message);
      }
    }
  }

  // Failover to NVIDIA NIM
  try {
    const nimResult = await callNvidiaNim(`${systemInstruction}\n\nUser Question: ${latestUserMessage}`);
    if (nimResult && nimResult.text) {
      return {
        message: nimResult.text,
        model: nimResult.model,
        is_fallback: true,
      };
    }
  } catch (err) {
    console.warn('NVIDIA NIM chat failover failed:', err);
  }

  // Graceful offline fallback
  return {
    message: `Here is a study tip for **${context?.currentDomain || 'Azure'}**: Focus on understanding core service boundaries (e.g., Azure Storage Access Tiers, Entra ID vs Azure RBAC, or Virtual Network Peering). Review official Microsoft Learn sandbox labs to reinforce hands-on implementation before taking your exam!`,
    model: 'offline-study-guide',
    is_fallback: true,
  };
}

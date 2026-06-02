const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

type GroqMessage = { role: 'system' | 'user'; content: string };

function getKey(): string | null {
  const key = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  return key && key.length > 10 ? key : null;
}

const cache = new Map<string, Promise<string | null>>();
const PERSIST_PREFIX = 'tarmil:groq:';

function persistGet(cacheKey: string): string | null {
  try {
    return localStorage.getItem(PERSIST_PREFIX + cacheKey);
  } catch {
    return null;
  }
}

function persistSet(cacheKey: string, value: string): void {
  try {
    localStorage.setItem(PERSIST_PREFIX + cacheKey, value);
  } catch {
    // ignore quota errors
  }
}

export async function groqChat(
  cacheKey: string,
  messages: GroqMessage[],
  maxTokens = 400,
): Promise<string | null> {
  const key = getKey();
  if (!key) return null;

  const persisted = persistGet(cacheKey);
  if (persisted) return persisted;

  const memHit = cache.get(cacheKey);
  if (memHit) return memHit;

  const promise = doChat(key, messages, maxTokens).then((text) => {
    if (text) persistSet(cacheKey, text);
    return text;
  });
  cache.set(cacheKey, promise);
  promise.catch(() => cache.delete(cacheKey));
  return promise;
}

async function doChat(
  apiKey: string,
  messages: GroqMessage[],
  maxTokens: number,
): Promise<string | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === 'string' && text.trim().length > 0
      ? text.trim()
      : null;
  } catch {
    return null;
  }
}

export async function rewriteAsTravelIntro(
  cityName: string,
  rawText: string,
): Promise<string | null> {
  if (!rawText || rawText.length < 40) return null;
  const cacheKey = `intro:${cityName.toLowerCase()}`;
  return groqChat(cacheKey, [
    {
      role: 'system',
      content:
        'You are a travel editor for a curated trip-planning app. Rewrite city descriptions so they read like editorial travel intros, not encyclopedia entries. Lead with what a traveler does there, the neighborhoods that matter, and the texture of daily life. Skip population figures, founding dates, area in km², and dry geographic facts. Active voice. Sentence cap 20 words. Four sentences maximum. Do not mention sources. Do not use em dashes. Do not start with the city name.',
    },
    {
      role: 'user',
      content: `City: ${cityName}\n\nSource paragraph (rewrite this):\n${rawText}`,
    },
  ]);
}

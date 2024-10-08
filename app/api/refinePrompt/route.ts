import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an AI assistant that helps refine prompts for image generation. Your task is to take the user's input and create a detailed, vivid description that can be used to generate an interesting and visually appealing image. Focus on adding visual details, style suggestions, and mood elements.`;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt) {
    console.error('No prompt provided');
    return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    console.log('Sending request to GROQ API');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.2-3b-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        max_tokens: 512
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}. Error: ${errorText}`);
      return NextResponse.json({ error: `API request failed: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log('Received response from GROQ API:', data);

    if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
      console.error('Unexpected API response structure:', data);
      return NextResponse.json({ error: 'Unexpected API response structure' }, { status: 500 });
    }

    const refinedPrompt = data.choices[0].message.content.trim();
    console.log('Refined prompt:', refinedPrompt);

    return NextResponse.json({ refinedPrompt });
  } catch (error: unknown) {
    console.error('Error refining prompt:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to refine prompt: ${errorMessage}` }, { status: 500 });
  }
}
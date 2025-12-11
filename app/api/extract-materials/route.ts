// app/api/extract-materials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Placeholder prompt - replace with your actual prompt tomorrow
const EXTRACTION_PROMPT = `Extract and summarize all materials mentioned in the following construction specification section. 
List each material with its specifications, quantities if mentioned, and any relevant details.

Section text:
{sectionText}`;

export async function POST(request: NextRequest) {
  try {
    const { sectionText } = await request.json();

    if (!sectionText) {
      return NextResponse.json(
        { error: 'Section text is required' },
        { status: 400 }
      );
    }

    const prompt = EXTRACTION_PROMPT.replace('{sectionText}', sectionText);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a construction materials extraction assistant. Extract materials from specification documents.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const materials = completion.choices[0]?.message?.content || 'No materials found';

    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return NextResponse.json(
      { error: 'Failed to extract materials' },
      { status: 500 }
    );
  }
}
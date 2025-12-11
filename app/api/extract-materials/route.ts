// app/api/extract-materials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const EXTRACTION_PROMPT = `I will upload a construction specification PDF. I want you to extract ONLY the materials required and all applicable technical standards (ASTM, ANSI, ACI, etc.). Then produce a clean, extremely accurate pre-construction summary with the following structure:

1. Project Header
   – Developer or owner name
   – Project name
   – Project address

2. Quick Summary (Bid Assessment)
   – Standard requirements
   – Premium or unusual requirements that will affect cost, complexity, or schedule

3. Full Detailed Breakdown
   – Organize by categories (CMU, mortar, grout, reinforcement, ties/anchors, flashing, drainage, accessories, etc.)
   – List required materials
   – List required standards
   – Call out anything that is not typical or will increase cost

This summary should be extremely accurate, easy to read quickly, and formatted so a construction estimator or subcontractor can instantly understand the scope and decide whether to bid.

Section text:
{sectionText}

After you finish, tell me: "Ready to convert to UI components whenever you are."`;

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
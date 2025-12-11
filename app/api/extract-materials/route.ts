// app/api/extract-materials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Rough estimate: 1 token ≈ 4 characters
// Leave buffer for prompt overhead (~2000 tokens)
const MAX_TOKENS_PER_CHUNK = 6000;
const MAX_CHARS_PER_CHUNK = MAX_TOKENS_PER_CHUNK * 4; // ~24,000 characters
const OVERLAP_CHARS = 2000; // Overlap between chunks to maintain context

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

const CHUNK_PROMPT = `Extract materials and technical standards from this portion of a construction specification PDF. Focus on:
- Materials required (CMU, mortar, grout, reinforcement, ties/anchors, flashing, drainage, accessories, etc.)
- Technical standards (ASTM, ANSI, ACI, etc.)
- Any unusual or premium requirements

This is part {chunkNumber} of {totalChunks}. Extract what you can from this portion:

{sectionText}

Provide a structured list of materials and standards found in this portion.`;

// Split text into chunks with overlap
function chunkText(text: string): string[] {
  if (text.length <= MAX_CHARS_PER_CHUNK) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + MAX_CHARS_PER_CHUNK;
    
    // If not the last chunk, try to break at a sentence or paragraph boundary
    if (end < text.length) {
      // Look for paragraph break (double newline) within the last 1000 chars
      const searchStart = Math.max(start, end - 1000);
      const paragraphBreak = text.lastIndexOf('\n\n', end);
      const sentenceBreak = text.lastIndexOf('. ', end);
      
      if (paragraphBreak > searchStart) {
        end = paragraphBreak + 2;
      } else if (sentenceBreak > searchStart) {
        end = sentenceBreak + 2;
      }
    }

    chunks.push(text.slice(start, end));
    
    // Move start forward with overlap
    start = end - OVERLAP_CHARS;
    if (start < 0) start = 0;
  }

  return chunks;
}

// Process a single chunk
async function processChunk(chunk: string, chunkNumber: number, totalChunks: number): Promise<string> {
  const prompt = CHUNK_PROMPT
    .replace('{chunkNumber}', chunkNumber.toString())
    .replace('{totalChunks}', totalChunks.toString())
    .replace('{sectionText}', chunk);

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

  return completion.choices[0]?.message?.content || '';
}

// Combine results from multiple chunks
async function combineResults(chunkResults: string[]): Promise<string> {
  const combinePrompt = `I have extracted materials from different portions of a construction specification PDF. Please combine these extractions into a single, comprehensive, well-organized summary with the following structure:

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

Extracted portions:
${chunkResults.map((result, i) => `\n--- Portion ${i + 1} ---\n${result}`).join('\n')}

Combine these into a single comprehensive summary. Remove duplicates and organize logically. After you finish, tell me: "Ready to convert to UI components whenever you are."`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a construction materials extraction assistant. Combine and organize extracted materials from specification documents.',
      },
      {
        role: 'user',
        content: combinePrompt,
      },
    ],
  });

  return completion.choices[0]?.message?.content || 'No materials found';
}

export async function POST(request: NextRequest) {
  try {
    const { sectionText } = await request.json();

    if (!sectionText) {
      return NextResponse.json(
        { error: 'Section text is required' },
        { status: 400 }
      );
    }

    // Check if text needs chunking
    const chunks = chunkText(sectionText);
    
    let materials: string;

    if (chunks.length === 1) {
      // Single chunk - use original prompt
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

      materials = completion.choices[0]?.message?.content || 'No materials found';
    } else {
      // Multiple chunks - process separately then combine
      console.log(`Processing ${chunks.length} chunks...`);
      
      const chunkResults = await Promise.all(
        chunks.map((chunk, index) => 
          processChunk(chunk, index + 1, chunks.length)
        )
      );

      console.log('Combining results...');
      materials = await combineResults(chunkResults);
    }

    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return NextResponse.json(
      { error: 'Failed to extract materials' },
      { status: 500 }
    );
  }
}
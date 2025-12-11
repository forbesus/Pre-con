// app/lib/pdfProcessor.ts
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
// Initialize worker source at module load time
if (typeof window !== 'undefined') {
  // Use unpkg CDN which is more reliable for PDF.js workers
  const pdfjsVersion = pdfjsLib.version || '5.4.449';
  pdfjsLib.GlobalWorkerOptions.workerSrc = 
    `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
}

// Keyword to search for (matching Python script)
const KEYWORD = 'UNIT MASONRY';

export interface PageMatch {
  pageNumber: number;
  matches: string[];
}

export interface Section {
  title: string;
  startPage: number;
  endPage: number;
  pages: number[];
}

export interface PDFProcessingResult {
  relevantPages: PageMatch[];
  sections: Section[];
  pdfDocument: any; // Store PDF document for later text extraction
}

// Store the PDF file and document for later text extraction
let cachedPDF: { file: File; document: any } | null = null;

export async function processPDF(file: File): Promise<PDFProcessingResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  // Cache the PDF for later text extraction
  cachedPDF = { file, document: pdf };
  
  const relevantPages: PageMatch[] = [];
  const totalPages = pdf.numPages;
  
  let startPage: number | null = null;
  let endPage: number | null = null;
  
  // Search bottom 10% of each page for the keyword (matching Python script logic)
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    
    // Get text content from the page
    const textContent = await page.getTextContent();
    
    // Filter text items that are in the bottom 10% of the page
    // In PDF.js, coordinates start from bottom-left (0,0 is bottom-left)
    // transform[5] is the y-coordinate from bottom
    // Bottom 10% means items with y coordinate <= 10% of page height
    const bottomText = textContent.items
      .filter((item: any) => {
        if (!item.transform || item.transform.length < 6) return false;
        // transform[5] is the y-coordinate (from bottom, 0 is bottom)
        const itemY = item.transform[5];
        // Bottom 10%: y should be between 0 and 10% of page height
        return itemY >= 0 && itemY <= viewport.height * 0.10;
      })
      .map((item: any) => item.str)
      .join(' ');
    
    // Check if keyword is in bottom area text
    if (bottomText.includes(KEYWORD)) {
      if (startPage === null) {
        startPage = pageNum;
      }
      endPage = pageNum; // Update as long as keyword appears
      relevantPages.push({
        pageNumber: pageNum,
        matches: [KEYWORD]
      });
    } else {
      // If we found a start page but keyword no longer appears, break
      if (startPage !== null) {
        break;
      }
    }
  }
  
  if (startPage === null) {
    throw new Error(`Keyword "${KEYWORD}" not found in PDF.`);
  }
  
  // Extract sections based on the found page range
  const sections = extractSections(startPage, endPage!);
  
  return { relevantPages, sections, pdfDocument: pdf };
}

function extractSections(startPage: number, endPage: number): Section[] {
  // Create a single section from start to end page (matching Python script behavior)
  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return [{
    title: 'UNIT MASONRY',
    startPage,
    endPage,
    pages
  }];
}

// Extract text from specific pages for AI processing
export async function extractTextFromPages(pages: number[]): Promise<string> {
  if (!cachedPDF || !cachedPDF.document) {
    throw new Error('PDF not loaded. Please process PDF first.');
  }
  
  const pdf = cachedPDF.document;
  const textParts: string[] = [];
  
  for (const pageNum of pages) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(`--- Page ${pageNum} ---\n${pageText}\n`);
  }
  
  return textParts.join('\n');
}



// app/lib/pdfProcessor.ts
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

// Hardcoded keywords (replace with your actual keywords)
const KEYWORDS = [
  'materials',
  'specifications',
  'equipment',
  'supplies',
  // Add your keywords here
];

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

export async function processPDF(file: File): Promise<{
  relevantPages: PageMatch[];
  sections: Section[];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const relevantPages: PageMatch[] = [];
  const totalPages = pdf.numPages;
  
  // Search each page for keywords
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
      .toLowerCase();
    
    const matches = KEYWORDS.filter(keyword => 
      pageText.includes(keyword.toLowerCase())
    );
    
    if (matches.length > 0) {
      relevantPages.push({
        pageNumber: pageNum,
        matches
      });
    }
  }
  
  // Extract sections based on relevant pages
  const sections = extractSections(relevantPages, totalPages);
  
  return { relevantPages, sections };
}

function extractSections(relevantPages: PageMatch[], totalPages: number): Section[] {
  // Group consecutive pages into sections
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  
  relevantPages.forEach((pageMatch, index) => {
    const pageNum = pageMatch.pageNumber;
    const prevPage = index > 0 ? relevantPages[index - 1].pageNumber : null;
    
    // Start new section if gap > 2 pages
    if (prevPage && pageNum - prevPage > 2) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: `Section ${sections.length + 1}`,
        startPage: pageNum,
        endPage: pageNum,
        pages: [pageNum]
      };
    } else {
      if (!currentSection) {
        currentSection = {
          title: `Section ${sections.length + 1}`,
          startPage: pageNum,
          endPage: pageNum,
          pages: [pageNum]
        };
      } else {
        currentSection.endPage = pageNum;
        currentSection.pages.push(pageNum);
      }
    }
  });
  
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}



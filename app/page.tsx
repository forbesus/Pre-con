// app/page.tsx
'use client';

import { useState } from 'react';
import PDFUploader from './components/pdfuploader';
import SectionSelector from './components/SectionSelector';
import MaterialsDisplay from './components/MeterialsDisplay';

interface Section {
  title: string;
  startPage: number;
  endPage: number;
  pages: number[];
}

export default function Home() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSections, setSelectedSections] = useState<Section[]>([]);
  const [materialsResults, setMaterialsResults] = useState<Array<{
    sectionTitle: string;
    materials: string;
  }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const handlePDFProcessed = (data: { sections: Section[] }) => {
    setSections(data.sections);
    setSelectedSections([]);
    setMaterialsResults([]);
  };

  const handleExtractMaterials = async () => {
    if (selectedSections.length === 0) {
      alert('Please select at least one section');
      return;
    }

    setIsExtracting(true);
    const results = [];

    try {
      // For each selected section, extract text and send to API
      // Note: You'll need to extract text from PDF pages for each section
      // This is a simplified version - you'll need to pass the actual text
      
      for (const section of selectedSections) {
        // TODO: Extract actual text from PDF pages for this section
        const sectionText = `[Section ${section.startPage}-${section.endPage} text would go here]`;
        
        const response = await fetch('/api/extract-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionText }),
        });

        const data = await response.json();
        results.push({
          sectionTitle: `${section.title} (Pages ${section.startPage}-${section.endPage})`,
          materials: data.materials,
        });
      }

      setMaterialsResults(results);
    } catch (error) {
      console.error('Error extracting materials:', error);
      alert('Error extracting materials. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Construction Spec Processor</h1>
        
        <PDFUploader 
          onPDFProcessed={handlePDFProcessed}
          onProcessing={setIsProcessing}
        />

        {isProcessing && <p>Processing PDF...</p>}

        {sections.length > 0 && (
          <>
            <SectionSelector
              sections={sections}
              onSectionsSelected={setSelectedSections}
            />
            
            {selectedSections.length > 0 && (
              <button
                onClick={handleExtractMaterials}
                disabled={isExtracting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isExtracting ? 'Extracting...' : 'Extract Materials'}
              </button>
            )}
          </>
        )}

        {materialsResults.length > 0 && (
          <MaterialsDisplay results={materialsResults} />
        )}
      </div>
    </div>
  );
}
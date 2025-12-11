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

type Step = 'upload' | 'sections' | 'summary';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
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
    setCurrentStep('sections');
  };

  const handleAddToProject = async () => {
    if (selectedSections.length === 0) {
      alert('Please select at least one section');
      return;
    }

    setIsExtracting(true);
    const results = [];

    try {
      const { extractTextFromPages } = await import('./lib/pdfprocessor');
      
      for (const section of selectedSections) {
        // Extract actual text from PDF pages for this section
        const sectionText = await extractTextFromPages(section.pages);
        
        const response = await fetch('/api/extract-materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionText }),
        });

        if (!response.ok) {
          throw new Error('Failed to extract materials');
        }

        const data = await response.json();
        results.push({
          sectionTitle: `${section.title} (Pages ${section.startPage}-${section.endPage})`,
          materials: data.materials,
        });
      }

      setMaterialsResults(results);
      setCurrentStep('summary');
    } catch (error) {
      console.error('Error extracting materials:', error);
      alert('Error extracting materials. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'summary') {
      setCurrentStep('sections');
      setMaterialsResults([]);
    } else if (currentStep === 'sections') {
      setCurrentStep('upload');
      setSections([]);
      setSelectedSections([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {currentStep === 'upload' && (
          <PDFUploader 
            onPDFProcessed={handlePDFProcessed}
            onProcessing={setIsProcessing}
          />
        )}

        {isProcessing && (
          <div className="bg-[#2a2a2a] rounded-lg p-8 text-center">
            <p className="text-white">Processing PDF...</p>
          </div>
        )}

        {currentStep === 'sections' && sections.length > 0 && (
          <SectionSelector
            sections={sections}
            onSectionsSelected={setSelectedSections}
            onAddToProject={handleAddToProject}
          />
        )}

        {isExtracting && (
          <div className="bg-[#2a2a2a] rounded-lg p-8 text-center">
            <p className="text-white">Extracting materials...</p>
          </div>
        )}

        {currentStep === 'summary' && materialsResults.length > 0 && (
          <MaterialsDisplay 
            results={materialsResults}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
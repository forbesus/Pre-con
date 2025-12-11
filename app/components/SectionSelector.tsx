// app/components/SectionSelector.tsx
'use client';

import { useState } from 'react';

interface Section {
  title: string;
  startPage: number;
  endPage: number;
  pages: number[];
}

interface SectionSelectorProps {
  sections: Section[];
  onSectionsSelected: (selectedSections: Section[]) => void;
  onAddToProject: () => void;
}

export default function SectionSelector({ sections, onSectionsSelected, onAddToProject }: SectionSelectorProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSection = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
    
    // Update parent with selected sections
    const selectedSections = sections.filter((_, i) => newSelected.has(i));
    onSectionsSelected(selectedSections);
  };

  if (sections.length === 0) return null;

  const hasSelection = selected.size > 0;
  const selectionCount = selected.size;

  return (
    <div className="w-full max-w-6xl mx-auto align-center justify-center flex flex-col items-center">
      <h2 className="text-5xl font-bold mb-12 text-center text-white">Choose your sections 👇</h2>
      
      <div className="bg-[#1a1a1a] rounded-lg p-10 mb-6 align-center justify-center w-full max-w-2xl mx-auto">
        <ul className="space-y-4">
          {sections.map((section, index) => (
            <li key={index} className="flex items-center space-x-4">
              {selected.has(index) ? (
                <div className="w-5 h-5 rounded bg-[#ff6b35] flex-shrink-0"></div>
              ) : (
                <div className="w-5 h-5 rounded border-2 border-[#3a3a3a] flex-shrink-0"></div>
              )}
              <button
                onClick={() => toggleSection(index)}
                className={`text-left flex-1 transition-colors text-base ${
                  selected.has(index)
                    ? 'text-[#ff6b35]'
                    : 'text-white hover:text-[#ff6b35]'
                }`}
              >
                <span className="text-[#b0b0b0]">• </span>
                {section.title} (Pages {section.startPage}-{section.endPage})
              </button>
            </li>
          ))}
        </ul>
        
        {hasSelection && (
          <p className="text-[#b0b0b0] text-base mt-6">
            {selectionCount} {selectionCount === 1 ? 'section' : 'sections'} selected
          </p>
        )}
      </div>

      <button
        onClick={onAddToProject}
        disabled={!hasSelection}
        className={`w-full max-w-2xl mx-auto align-center justify-center py-4 px-8 rounded-lg transition-colors uppercase font-bold text-lg ${
          hasSelection
            ? 'bg-[#ff6b35] text-white hover:bg-[#ff8555]'
            : 'bg-[#3a3a3a] text-[#666] cursor-not-allowed border border-[#4a4a4a] disabled:opacity-50'
        }`}
      >
        {hasSelection ? 'Create Summary' : 'Add to project'}
      </button>
    </div>
  );
}
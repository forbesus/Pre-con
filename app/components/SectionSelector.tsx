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
}

export default function SectionSelector({ sections, onSectionsSelected }: SectionSelectorProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSection = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
    
    const selectedSections = sections.filter((_, i) => newSelected.has(i));
    onSectionsSelected(selectedSections);
  };

  if (sections.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Select Relevant Sections:</h3>
      {sections.map((section, index) => (
        <label key={index} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.has(index)}
            onChange={() => toggleSection(index)}
            className="w-4 h-4"
          />
          <span>
            {section.title} (Pages {section.startPage}-{section.endPage})
          </span>
        </label>
      ))}
    </div>
  );
}
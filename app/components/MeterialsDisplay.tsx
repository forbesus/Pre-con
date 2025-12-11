// app/components/MaterialsDisplay.tsx
'use client';

interface MaterialsDisplayProps {
  results: Array<{
    sectionTitle: string;
    materials: string;
  }>;
  onBack: () => void;
}

export default function MaterialsDisplay({ results, onBack }: MaterialsDisplayProps) {
  if (results.length === 0) return null;

  // Extract project name from first result or use default
  const projectName = results[0]?.sectionTitle.split(' ')[0] || 'Project';
  const projectInitial = projectName.charAt(0).toUpperCase();

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Your job summary 👇</h2>
      
      <div className="bg-[#1a1a1a] rounded-lg p-8">
        {/* Project Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#ff6b35] flex items-center justify-center text-white text-3xl font-bold">
            {projectInitial}
          </div>
        </div>

        {/* Summary Content */}
        <div className="space-y-6 mb-6">
          {results.map((result, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-xl font-semibold text-white mb-3">{result.sectionTitle}</h3>
              
              {/* Parse and display materials in a structured way */}
              <div className="text-[#b0b0b0] whitespace-pre-wrap text-sm">
                {result.materials.split('\n').map((line, lineIndex) => {
                  // Format bullet points
                  if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                    return (
                      <div key={lineIndex} className="flex items-start mb-2">
                        <span className="text-[#ff6b35] mr-2">•</span>
                        <span>{line.replace(/^[-•]\s*/, '')}</span>
                      </div>
                    );
                  }
                  // Format section headers
                  if (line.trim().endsWith(':') || /^[A-Z][^:]*$/.test(line.trim())) {
                    return (
                      <div key={lineIndex} className="font-semibold text-white mt-4 mb-2">
                        {line}
                      </div>
                    );
                  }
                  return (
                    <div key={lineIndex} className="mb-1">{line}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-6 rounded-lg bg-[#3a3a3a] text-white hover:bg-[#4a4a4a] transition-colors uppercase font-semibold"
          >
            Decline Job
          </button>
          <button
            className="flex-1 py-3 px-6 rounded-lg bg-[#ff6b35] text-white hover:bg-[#ff8555] transition-colors uppercase font-semibold"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}
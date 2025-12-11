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
    <div className="w-full max-w-6xl mx-auto align-center justify-center flex flex-col items-center">
      <h2 className="text-5xl font-bold mb-12 text-center text-white">Your job summary 👇</h2>
      
      <div className="bg-[#1a1a1a] rounded-lg p-10 mb-6 align-center justify-center w-full max-w-2xl mx-auto">
        {/* Project Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-[#ff6b35] flex items-center justify-center text-white text-4xl font-bold">
            {projectInitial}
          </div>
        </div>

        {/* Summary Content */}
        <div className="space-y-8 mb-8">
          {results.map((result, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-2xl font-semibold text-white mb-4">{result.sectionTitle}</h3>
              
              {/* Parse and display materials in a structured way */}
              <div className="text-[#b0b0b0] whitespace-pre-wrap text-base leading-relaxed">
                {result.materials.split('\n').map((line, lineIndex) => {
                  // Format bullet points
                  if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                    return (
                      <div key={lineIndex} className="flex items-start mb-3">
                        <span className="text-[#ff6b35] mr-3 text-lg">•</span>
                        <span>{line.replace(/^[-•]\s*/, '')}</span>
                      </div>
                    );
                  }
                  // Format section headers
                  if (line.trim().endsWith(':') || /^[A-Z][^:]*$/.test(line.trim())) {
                    return (
                      <div key={lineIndex} className="font-semibold text-white mt-6 mb-3 text-lg">
                        {line}
                      </div>
                    );
                  }
                  return (
                    <div key={lineIndex} className="mb-2">{line}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-10">
          <button
            onClick={onBack}
            className="flex-1 py-4 px-8 rounded-lg bg-[#3a3a3a] border border-[#4a4a4a] text-white hover:bg-[#4a4a4a] transition-colors uppercase font-bold text-lg"
          >
            Decline Job
          </button>
          <button
            className="flex-1 py-4 px-8 rounded-lg bg-[#ff6b35] text-white hover:bg-[#ff8555] transition-colors uppercase font-bold text-lg"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
}
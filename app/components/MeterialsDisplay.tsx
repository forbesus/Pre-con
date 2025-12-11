// app/components/MaterialsDisplay.tsx
'use client';

interface MaterialsDisplayProps {
  results: Array<{
    sectionTitle: string;
    materials: string;
  }>;
}

export default function MaterialsDisplay({ results }: MaterialsDisplayProps) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Materials Summary</h2>
      {results.map((result, index) => (
        <div key={index} className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">{result.sectionTitle}</h3>
          <div className="whitespace-pre-wrap text-sm">
            {result.materials}
          </div>
        </div>
      ))}
    </div>
  );
}
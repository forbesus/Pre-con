// app/components/PDFUploader.tsx
'use client';

import { useState } from 'react';

interface PDFUploaderProps {
  onPDFProcessed: (data: {
    relevantPages: any[];
    sections: any[];
  }) => void;
  onProcessing: (isProcessing: boolean) => void;
}

export default function PDFUploader({ onPDFProcessed, onProcessing }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setFile(selectedFile);
    onProcessing(true);

    try {
      // Dynamically import the correct path for the processor, use relative path if running on client
      const { processPDF } = await import('../lib/pdfprocessor');
      const result = await processPDF(selectedFile);
      onPDFProcessed(result);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again.');
    } finally {
      onProcessing(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        id="pdf-upload"
      />
      <label
        htmlFor="pdf-upload"
        className="cursor-pointer block"
      >
        <div className="text-gray-600">
          {file ? file.name : 'Click to upload PDF'}
        </div>
      </label>
    </div>
  );
}
// app/components/PDFUploader.tsx
'use client';

import { useState, useRef } from 'react';

interface PDFUploaderProps {
  onPDFProcessed: (data: {
    relevantPages: any[];
    sections: any[];
  }) => void;
  onProcessing: (isProcessing: boolean) => void;
}

export default function PDFUploader({ onPDFProcessed, onProcessing }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setFile(selectedFile);
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    onProcessing(true);

    try {
      const { processPDF } = await import('../lib/pdfprocessor');
      const result = await processPDF(file);
      onPDFProcessed(result);
    } catch (error: any) {
      console.error('Error processing PDF:', error);
      alert(error.message || 'Error processing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
      onProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div >
      <h2 className="text-4xl font-semibold mb-6 text-center">The Pre-Con Intelligence Platform</h2>
      
      <div className="bg-[#1a1a1a] rounded-lg p-8 text-center mb-4">
        <p className="text-white mb-6">Upload your spec doc 👇</p>
        
        <div
          className={`border-2 border-dashed rounded-lg p-12 cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#ff6b35] bg-[#2a2a2a]'
              : 'border-[#3a3a3a] hover:border-[#4a4a4a]'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center">
            <svg 
              className="w-16 h-16 text-[#b0b0b0] mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <p className="text-[#b0b0b0] text-sm">Drag & drop or click</p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
        id="pdf-upload"
      />
      
      {file && (
        <button
          onClick={processFile}
          disabled={isProcessing}
          className="w-full py-3 px-6 rounded-lg bg-[#ff6b35] text-white hover:bg-[#ff8555] transition-colors uppercase font-semibold disabled:opacity-50"
        >
          {isProcessing ? 'Analyzing...' : 'Analyze Document'}
        </button>
      )}
      
      {!file && (
        <button
          onClick={handleClick}
          className="w-full py-3 px-6 rounded-lg bg-[#3a3a3a] text-white hover:bg-[#4a4a4a] transition-colors uppercase font-semibold"
        >
          Upload a file
        </button>
      )}
    </div>
  );
}
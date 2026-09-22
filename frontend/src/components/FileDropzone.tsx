import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  label?: string;
  sublabel?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    'application/pdf': ['.pdf'],
  },
  label = 'Drop your screenshot, photo, or document here',
  sublabel = 'Supports PNG, JPG, PDF up to 50MB',
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-amber-500 bg-amber-50/50'
          : 'border-stone-300 hover:border-amber-400 bg-white hover:bg-stone-50/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
          <UploadCloud className="w-7 h-7" />
        </div>
        <p className="text-base font-bold text-stone-800 mb-1">{label}</p>
        <p className="text-xs text-stone-500 mb-4">{sublabel}</p>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-100 text-stone-700 font-semibold text-xs hover:bg-stone-200 transition">
          Browse File
        </span>
      </div>
    </div>
  );
};

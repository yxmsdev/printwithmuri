'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  acceptedFormats?: string[];
  maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  acceptedFormats = ['.stl', '.obj', '.3mf'],
  maxSize = 50 * 1024 * 1024, // 50MB default
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && onFileSelect) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/stl': ['.stl'],
      'model/obj': ['.obj'],
      'model/3mf': ['.3mf'],
    },
    maxSize,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg
        p-12 text-center cursor-pointer
        transition-all duration-200
        ${
          isDragActive
            ? 'border-primary bg-pink-50'
            : 'border-gray-300 hover:border-primary'
        }
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center">
        <svg
          className="w-16 h-16 text-medium mb-4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>

        {isDragActive ? (
          <p className="text-lg font-medium text-primary">
            Drop your file here
          </p>
        ) : (
          <>
            <p className="text-lg font-medium text-dark mb-2">
              Drop Your 3D Model Here Or Browse
            </p>
            <p className="text-sm text-medium">
              Supports {acceptedFormats.join(', ')} files up to {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

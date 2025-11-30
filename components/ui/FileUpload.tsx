'use client';

import React, { useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { SlicerQuoteResponse } from '@/types';

interface FileUploadProps {
  onFileSelect?: (file: File, sliceResults: SlicerQuoteResponse) => void;
  maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  maxSize = 50 * 1024 * 1024, // 50MB default
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sliceResults, setSliceResults] = useState<SlicerQuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const uploadAndSliceFile = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setIsUploading(true);
      setUploadComplete(false);
      setUploadProgress(0);
      setError(null);

      // Development mode: Use mock data instead of actual slicing
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: Using mock slice data');

        // Simulate upload progress
        setUploadedBytes(0);
        setTotalBytes(file.size);

        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(i);
          setUploadedBytes((file.size * i) / 100);
          console.log(`📤 Mock upload progress: ${i}%`);
        }

        // Mock slice results
        const mockData: SlicerQuoteResponse = {
          success: true,
          quote: {
            quote_id: `mock-quote-${Date.now()}`,
            gcode_file: `mock-${file.name}.gcode`,
            estimatedWeight: 25.5,
            printTime: 2.5,
            machineCost: 5000,
            materialCost: 3825,
            setupFee: 500,
            itemTotal: 9325,
            currency: 'NGN',
            slicingDuration: 1000,
            layerCount: 200,
          }
        };

        console.log('✅ Mock slice complete:', mockData);
        setSliceResults(mockData);
        setUploadComplete(true);
        setIsUploading(false);
        return;
      }

      // Production mode: Real upload and slicing
      const formData = new FormData();
      formData.append('file', file);
      // Default settings for initial slice
      formData.append('quality', 'standard');
      formData.append('material', 'PLA');
      formData.append('infillDensity', '25');

      try {
        const data: SlicerQuoteResponse = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          // Upload progress tracking
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              setUploadedBytes(event.loaded);
              setTotalBytes(event.total);
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percentComplete);
              console.log(`📤 Upload progress: ${percentComplete}% (${(event.loaded / 1024 / 1024).toFixed(1)} MB / ${(event.total / 1024 / 1024).toFixed(1)} MB)`);
            }
          });

          // Upload complete, now slicing on server
          xhr.upload.addEventListener('load', () => {
            console.log('✅ Upload complete, server is slicing...');
          });

          // Response received
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const responseData = JSON.parse(xhr.responseText);
                console.log('✅ Server slice quote received:', responseData);
                resolve(responseData);
              } catch (error) {
                reject(new Error('Failed to parse response'));
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                console.error('❌ Slicing failed:', errorData);
                reject(new Error(errorData.error || 'Failed to slice model'));
              } catch {
                reject(new Error(`Request failed with status ${xhr.status}`));
              }
            }
          });

          // Handle errors
          xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
          });

          xhr.addEventListener('timeout', () => {
            reject(new Error('Upload timeout'));
          });

          // Set timeout (2 minutes)
          xhr.timeout = 120000;

          // Send request
          xhr.open('POST', '/api/slicer/slice');
          xhr.send(formData);
        });

        setSliceResults(data);
        setUploadComplete(true);
        setIsUploading(false);
      } catch (err) {
        console.error('Upload/slice error:', err);
        setError(err instanceof Error ? err.message : 'Upload failed');
        setIsUploading(false);
      }
    },
    []
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadAndSliceFile(acceptedFiles[0]);
      }
    },
    [uploadAndSliceFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/stl': ['.stl'],
      'model/obj': ['.obj'],
      'model/3mf': ['.3mf'],
      'model/fbx': ['.fbx'],
      'model/gltf+json': ['.gltf'],
    },
    maxSize,
    multiple: false,
  });

  const handleContinue = () => {
    if (selectedFile && sliceResults && onFileSelect) {
      onFileSelect(selectedFile, sliceResults);
    }
  };

  const handleChangeModel = () => {
    // Cancel ongoing upload if any
    if (xhrRef.current) {
      xhrRef.current.abort();
    }

    // Reset state
    setSelectedFile(null);
    setSliceResults(null);
    setIsUploading(false);
    setUploadComplete(false);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);
    setError(null);
  };

  return (
    <div className="bg-white p-8 w-[633px] shadow-lg flex flex-col gap-8">
      <h2 className="text-[20px] font-medium text-black tracking-[-0.4px] leading-none">
        Upload your 3d Model files
      </h2>

      {/* Upload Box - Always Visible */}
      <div className="flex flex-col gap-6">
        <div
          {...(!selectedFile ? getRootProps() : {})}
          className={`
            border border-dashed rounded-[2px] p-6
            transition-all duration-200
            ${!selectedFile
              ? `cursor-pointer ${isDragActive ? 'border-[#F4008A] bg-pink-50' : 'border-[#8D8D8D] hover:border-[#F4008A]'}`
              : 'border-[#8D8D8D]'
            }
          `}
        >
          {!selectedFile && <input {...getInputProps()} />}

          {/* Empty State - Drag/Drop UI */}
          {!selectedFile && (
            <div className="flex flex-col items-center gap-[6px] py-8">
              <div className="w-[59px] h-[62px] mb-1">
                <Image
                  src="/images/upload-icon.svg"
                  alt="Upload"
                  width={59}
                  height={62}
                />
              </div>

              {isDragActive ? (
                <p className="text-base font-semibold text-[#F4008A] leading-[1.4]">
                  Drop your file here
                </p>
              ) : (
                <>
                  <p className="text-base font-semibold text-[#626262] leading-[1.4]">
                    drag and drop or click to browse
                  </p>
                  <p className="text-base text-[#F4008A] leading-[1.4]">
                    STL, OBJ, FBX, GLTF, 3MF,
                  </p>
                  <p className="text-[12px] text-[#626262] leading-[1.4]">
                    Max 50mb limit
                  </p>
                </>
              )}
            </div>
          )}

          {/* Upload Progress - Shows inside the box */}
          {selectedFile && (
            <div className="flex items-start gap-3">
              {/* File Icon */}
              <div className="flex-shrink-0 w-[45px] h-[56px] bg-[#E6E6E6] rounded-[2px] flex flex-col items-center justify-center">
                {/* 3D File Icon SVG */}
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none" className="mb-1">
                  <rect x="2" y="3" width="16" height="18" rx="1" stroke="#7A7A7A" strokeWidth="1.5" fill="none"/>
                  <path d="M6 8 L14 8 M6 12 L14 12 M6 16 L10 16" stroke="#7A7A7A" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-[10px] font-medium text-[#7A7A7A] leading-none">
                  {selectedFile.name.split('.').pop()?.toUpperCase()}
                </p>
              </div>

              {/* Progress Info */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <p className="text-[16px] font-medium text-[#1F1F1F] tracking-[-0.32px] leading-none">
                    {selectedFile.name}
                  </p>
                  {!uploadComplete && isUploading && (
                    <button
                      onClick={handleChangeModel}
                      className="text-[#8D8D8D] hover:text-[#1F1F1F] transition-colors"
                      aria-label="Cancel upload"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                {isUploading && (
                  <>
                    <p className="text-[12px] font-medium text-[#B7B7B7] leading-none">
                      {(uploadedBytes / 1024).toFixed(0)}kb of {(totalBytes / 1024 / 1024).toFixed(0)}mb
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="relative h-[8px] bg-[#E6E6E6] rounded-[2px] overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-full rounded-[2px] transition-all duration-300"
                            style={{
                              width: `${uploadProgress}%`,
                              background: 'linear-gradient(to bottom, #34E5FF -2.79%, #0098C7 93.92%)'
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-[12px] font-medium text-[#3D3D3D] leading-none">
                        {uploadProgress}%
                      </p>
                    </div>
                  </>
                )}

                {error && (
                  <p className="text-[12px] text-red-600">{error}</p>
                )}

                {uploadComplete && (
                  <p className="text-[12px] text-green-600 font-medium">✓ Ready to continue</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Only show when file is selected */}
        {selectedFile && (
          <div className="flex items-center justify-between">
            <button
              onClick={handleChangeModel}
              className="text-[12px] font-medium text-[#1F1F1F] uppercase tracking-[0.24px] underline decoration-solid hover:text-[#F4008A] transition-colors"
            >
              Change model
            </button>

            <button
              onClick={handleContinue}
              disabled={!uploadComplete}
              className={`
                px-6 py-2 rounded-[2px] text-[14px] font-medium text-white uppercase tracking-[0.28px]
                transition-all duration-200
                ${uploadComplete
                  ? 'bg-gradient-to-b from-[#1F1F1F] to-[#3a3a3a] hover:opacity-90 cursor-pointer'
                  : 'bg-gradient-to-b from-[#464750] to-[#000000] cursor-not-allowed opacity-60'
                }
              `}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

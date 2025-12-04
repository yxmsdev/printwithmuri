'use client';

import React, { useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { SlicerQuoteResponse } from '@/types';

interface FileUploadProps {
  onFileSelect?: (file: File, sliceResults: SlicerQuoteResponse, fileId: string) => void;
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
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const uploadAndSliceFile = useCallback(
    async (file: File) => {
      setSelectedFile(file);
      setIsUploading(true);
      setUploadComplete(false);
      setUploadProgress(0);
      setError(null);



      // Production mode: Two-phase upload and slicing
      try {
        // Phase 1: Upload file to get a fileId
        console.log('📤 Phase 1: Uploading file...');
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const uploadResponse = await new Promise<{ fileId: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          // Upload progress tracking
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              setUploadedBytes(event.loaded);
              setTotalBytes(event.total);
              // Cap at 50% since slicing will be the second half
              const percentComplete = Math.round((event.loaded / event.total) * 50);
              setUploadProgress(percentComplete);
              console.log(`📤 Upload progress: ${percentComplete}% (${(event.loaded / 1024 / 1024).toFixed(1)} MB / ${(event.total / 1024 / 1024).toFixed(1)} MB)`);
            }
          });

          xhr.upload.addEventListener('load', () => {
            console.log('✅ File upload complete, processing...');
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const responseData = JSON.parse(xhr.responseText);
                console.log('✅ Upload response:', responseData);
                if (responseData.success && responseData.fileId) {
                  resolve(responseData);
                } else {
                  reject(new Error(responseData.error || 'Upload failed'));
                }
              } catch {
                reject(new Error('Failed to parse upload response'));
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(new Error(errorData.error || 'Upload failed'));
              } catch {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
          xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')));

          xhr.timeout = 60000; // 1 minute for upload
          xhr.open('POST', '/api/slicer/upload');
          xhr.send(uploadFormData);
        });

        // Phase 2: Slice with the fileId
        const extractedFileId = uploadResponse.fileId;
        console.log('🔪 Phase 2: Slicing with fileId:', extractedFileId);
        console.log('📦 Full upload response:', JSON.stringify(uploadResponse));

        if (!extractedFileId) {
          throw new Error('Upload succeeded but no fileId was returned');
        }

        setUploadProgress(50);

        const sliceFormData = new FormData();
        sliceFormData.append('fileId', extractedFileId);
        console.log('📤 Slice formData fileId:', sliceFormData.get('fileId'));
        sliceFormData.append('quality', 'standard');
        sliceFormData.append('material', 'PLA');
        sliceFormData.append('infillDensity', '25');
        sliceFormData.append('infillType', 'honeycomb');

        const data: SlicerQuoteResponse = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          // Simulate progress during slicing
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 5, 95));
          }, 1000);

          xhr.addEventListener('load', () => {
            clearInterval(progressInterval);
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const responseData = JSON.parse(xhr.responseText);
                console.log('✅ Slice quote received:', responseData);
                setUploadProgress(100);
                resolve(responseData);
              } catch {
                reject(new Error('Failed to parse slice response'));
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                console.error('❌ Slicing failed:', errorData);
                reject(new Error(errorData.error || 'Failed to slice model'));
              } catch {
                reject(new Error(`Slice failed with status ${xhr.status}`));
              }
            }
          });

          xhr.addEventListener('error', () => {
            clearInterval(progressInterval);
            reject(new Error('Network error during slicing'));
          });

          xhr.addEventListener('timeout', () => {
            clearInterval(progressInterval);
            reject(new Error('Slicing timeout'));
          });

          xhr.timeout = 120000; // 2 minutes for slicing
          xhr.open('POST', '/api/slicer/slice');
          xhr.send(sliceFormData);
        });

        setSliceResults(data);
        setCurrentFileId(extractedFileId); // Store fileId for passing to ConfiguratorSidebar
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
    console.log('🔘 Continue button clicked');
    console.log('📋 State check:', {
      hasSelectedFile: !!selectedFile,
      hasSliceResults: !!sliceResults,
      hasCurrentFileId: !!currentFileId,
      hasOnFileSelect: !!onFileSelect,
    });

    if (selectedFile && sliceResults && currentFileId && onFileSelect) {
      console.log('✅ All conditions met, calling onFileSelect');
      onFileSelect(selectedFile, sliceResults, currentFileId);
    } else {
      console.warn('⚠️ Continue button clicked but missing required data:', {
        selectedFile: !!selectedFile,
        sliceResults: !!sliceResults,
        currentFileId: currentFileId,
        onFileSelect: !!onFileSelect,
      });
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
    setCurrentFileId(null);
    setIsUploading(false);
    setUploadComplete(false);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);
    setError(null);
  };

  return (
    <div className="bg-white p-8 w-[633px] shadow-lg flex flex-col gap-8 rounded-[2px]">
      <h2 className="text-[20px] font-medium text-black tracking-[-0.4px] leading-none">
        Upload your 3d Model file
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
              <div className="flex-shrink-0 w-[45px] h-[56px] flex flex-col items-center justify-center">
                {(() => {
                  const extension = selectedFile.name.split('.').pop()?.toLowerCase();
                  const iconMap: Record<string, string> = {
                    'stl': '/images/stl.svg',
                    'obj': '/images/obj.svg',
                    'fbx': '/images/fbx.svg',
                    '3mf': '/images/mf.svg',
                    'gltf': '/images/3d.svg',
                  };
                  const iconSrc = iconMap[extension || ''] || '/images/3d.svg';

                  return (
                    <Image
                      src={iconSrc}
                      alt={`${extension?.toUpperCase()} file`}
                      width={45}
                      height={56}
                      className="object-contain"
                    />
                  );
                })()}
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
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
                  <p className="text-[12px] text-green-600 font-medium">Ready to continue</p>
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
              className="text-[12px] font-medium text-[#1F1F1F] uppercase tracking-[0.24px] underline decoration-solid hover:text-[#F4008A] transition-colors btn-bounce"
            >
              Change model
            </button>

            <button
              onClick={handleContinue}
              disabled={!uploadComplete}
              className={`
                px-6 py-2 rounded-[2px] text-[14px] font-medium text-white uppercase tracking-[0.28px]
                transition-all duration-200 btn-bounce
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

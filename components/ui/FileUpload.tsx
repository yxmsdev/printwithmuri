'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
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
      'model/fbx': ['.fbx'],
      'model/gltf+json': ['.gltf'],
    },
    maxSize,
    multiple: false,
  });

  return (
    <div className="bg-white p-8 w-[633px] shadow-lg flex flex-col gap-6">
      <h2 className="text-[20px] font-medium text-black tracking-[-0.4px]">
        Upload your 3d Model files
      </h2>

      <div
        {...getRootProps()}
        className={`
          border border-dashed rounded
          py-14 text-center cursor-pointer
          transition-all duration-200
          ${
            isDragActive
              ? 'border-[#F4008A] bg-pink-50'
              : 'border-[#8D8D8D] hover:border-[#F4008A]'
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-[6px] w-[302px] mx-auto">
          {/* Upload Icon */}
          <div className="w-[59px] h-[62px] mb-1">
            <Image
              src="/images/upload-icon.svg"
              alt="Upload"
              width={59}
              height={62}
            />
          </div>

          {isDragActive ? (
            <p className="text-base font-semibold text-[#F4008A]">
              Drop your file here
            </p>
          ) : (
            <>
              <p className="text-base font-semibold text-[#626262] leading-[1.4]">
                drag and drop or click to browse
              </p>
              <div className="text-base text-[#626262] leading-[1.4] text-center">
                <p className="text-[#F4008A]">STL, OBJ, FBX, GLTF, 3MF,</p>
                <p>Max file 50mb</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import FileUpload from "@/components/ui/FileUpload";
import ConfiguratorSidebar from "@/components/configurator/ConfiguratorSidebar";
import { ModelInfo } from '@/types';

const ModelViewer = dynamic(() => import("@/components/viewer/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-2"></div>
        <p className="text-gray-600">Loading 3D Viewer...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string } | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  const handleFileSelect = (file: File) => {
    // Clean up old URL if it exists
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
    }
    const url = URL.createObjectURL(file);
    setSelectedFile({ url, name: file.name });
  };

  const handleModelLoaded = (info: ModelInfo) => {
    setModelInfo(info);
  };

  const handleAddToBag = () => {
    // TODO: Implement add to bag functionality
    console.log('Add to bag clicked');
  };

  const handleSaveAsDraft = () => {
    // TODO: Implement save as draft functionality
    console.log('Save as draft clicked');
  };

  return (
    <div className="relative w-full h-[calc(100vh-56px)]">
      {!selectedFile ? (
        /* Upload State - Full screen viewer with centered upload card */
        <>
          <div className="absolute inset-0 z-0">
            <ModelViewer
              fileUrl=""
              fileName=""
              onModelLoaded={() => {}}
            />
          </div>
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          </div>
        </>
      ) : (
        /* Configurator State - Sidebar + Viewer layout */
        <div className="relative h-full">
          {/* Absolutely positioned Configurator Sidebar */}
          <div className="absolute left-0 top-4 z-10">
            <ConfiguratorSidebar
              fileName={selectedFile.name}
              modelInfo={modelInfo}
              onChangeFile={(file: File) => {
                // Clean up old URL
                if (selectedFile?.url) {
                  URL.revokeObjectURL(selectedFile.url);
                }
                const url = URL.createObjectURL(file);
                setSelectedFile({ url, name: file.name });
                setModelInfo(null); // Reset model info until new model loads
              }}
              onAddToBag={handleAddToBag}
              onSaveAsDraft={handleSaveAsDraft}
            />
          </div>

          {/* 3D Viewer */}
          <ModelViewer
            fileUrl={selectedFile.url}
            fileName={selectedFile.name}
            onModelLoaded={handleModelLoaded}
          />
        </div>
      )}
    </div>
  );
}

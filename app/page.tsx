'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import FileUpload from "@/components/ui/FileUpload";
import ConfiguratorSidebar, { ConfiguratorSidebarRef, ConfigState } from "@/components/configurator/ConfiguratorSidebar";
import { ModelInfo, SlicerQuoteResponse } from '@/types';
import { useDraftsStore, createDraftData } from '@/stores/useDraftsStore';
import { useLandingStore } from '@/stores/useLandingStore';

const ModelViewer = dynamic(() => import("@/components/viewer/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#EDEDED]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-2"></div>
        <p className="text-gray-600">Loading 3D Viewer...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sidebarRef = useRef<ConfiguratorSidebarRef>(null);

  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string; file: File } | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [initialConfig, setInitialConfig] = useState<Partial<ConfigState> | undefined>(undefined);
  const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);
  const [showDraftSaved, setShowDraftSaved] = useState(false);
  const [initialSliceResults, setInitialSliceResults] = useState<SlicerQuoteResponse | null>(null);
  const [initialFileId, setInitialFileId] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  const getDraft = useDraftsStore((state) => state.getDraft);
  const addDraft = useDraftsStore((state) => state.addDraft);
  const updateDraft = useDraftsStore((state) => state.updateDraft);
  const removeDraft = useDraftsStore((state) => state.removeDraft);
  const setIsLandingPage = useLandingStore((state) => state.setIsLandingPage);

  // Update landing page state based on current view
  useEffect(() => {
    const isLanding = !showUploader && !selectedFile;
    setIsLandingPage(isLanding);
  }, [showUploader, selectedFile, setIsLandingPage]);

  // Load draft from URL parameter OR handle navigation
  useEffect(() => {
    const draftId = searchParams.get('draft');
    const uploader = searchParams.get('uploader');
    const landing = searchParams.get('landing');

    // Handle landing request (from clicking Logo in header)
    if (landing) {
      console.log('🏠 Going to landing page');

      // Clean up old URL if it exists
      if (selectedFile?.url) {
        URL.revokeObjectURL(selectedFile.url);
      }

      // Reset all state to show landing page
      setSelectedFile(null);
      setModelInfo(null);
      setInitialConfig(undefined);
      setLoadedDraftId(null);
      setInitialSliceResults(null);
      setInitialFileId(null);
      setShowUploader(false);

      // Clear the URL parameter
      router.replace('/', { scroll: false });
      return;
    }

    // Handle uploader request (from clicking "3D" in header)
    if (uploader) {
      console.log('🔄 Opening uploader screen');

      // Clean up old URL if it exists
      if (selectedFile?.url) {
        URL.revokeObjectURL(selectedFile.url);
      }

      // Reset file state but show uploader
      setSelectedFile(null);
      setModelInfo(null);
      setInitialConfig(undefined);
      setLoadedDraftId(null);
      setInitialSliceResults(null);
      setInitialFileId(null);
      setShowUploader(true);

      // Clear the URL parameter
      router.replace('/', { scroll: false });
      return;
    }

    // Handle draft loading
    if (draftId) {
      const draft = getDraft(draftId);
      if (draft) {
        setLoadedDraftId(draftId);
        setInitialConfig(draft.config);
        setModelInfo(draft.modelInfo);
        setShowUploader(true);

        // Set file info (without actual file for now - just display name)
        setSelectedFile({
          url: '', // No actual URL - model won't load from draft
          name: draft.modelName,
          file: new File([], draft.modelName), // Dummy file for type satisfaction
        });

        // Clear the URL parameter
        router.replace('/', { scroll: false });
      }
    }
  }, [searchParams, getDraft, router, selectedFile]);

  const handleFileSelect = (file: File, sliceResults: SlicerQuoteResponse, fileId: string) => {
    // Clean up old URL if it exists
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
    }
    const url = URL.createObjectURL(file);
    setSelectedFile({ url, name: file.name, file });
    setInitialSliceResults(sliceResults);
    setInitialFileId(fileId);
    console.log('📁 File selected with fileId:', fileId);

    // Clear loaded draft since we have a new file
    setLoadedDraftId(null);
    setInitialConfig(undefined);
  };

  const handleModelLoaded = (info: ModelInfo) => {
    console.log('🎨 Model loaded! Info:', info);
    setModelInfo(info);
    // Server-side slicing will happen in ConfiguratorSidebar when user changes settings
  };

  const handleAddToBag = () => {
    // If this was a draft, remove it since it's now in the bag
    if (loadedDraftId) {
      removeDraft(loadedDraftId);
      setLoadedDraftId(null);
    }
  };

  const handleSaveAsDraft = () => {
    if (!selectedFile || !sidebarRef.current) return;

    const config = sidebarRef.current.getConfig();
    const draftData = createDraftData(selectedFile.name, modelInfo, config);

    if (loadedDraftId) {
      // Update existing draft
      updateDraft(loadedDraftId, {
        modelName: selectedFile.name,
        modelInfo,
        config,
      });
    } else {
      // Create new draft
      const newId = addDraft(draftData);
      setLoadedDraftId(newId);
    }

    // Show confirmation
    setShowDraftSaved(true);
    setTimeout(() => setShowDraftSaved(false), 2000);
  };

  // Check if we're on the landing page (for full-screen video)
  const isOnLandingPage = !showUploader && !selectedFile;

  return (
    <div className={`relative w-full ${isOnLandingPage ? 'h-screen -mt-[56px] bg-black' : 'h-[calc(100vh-56px)]'}`}>
      {/* Draft Saved Toast */}
      {showDraftSaved && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F1F1F] text-white px-6 py-3 rounded-[2px] shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-400">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[14px] font-medium">Draft saved!</span>
          </div>
        </div>
      )}

      {!showUploader && !selectedFile ? (
        /* Hero Landing Page - Full screen video */
        <>
          {/* Video Background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/videos/Video.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Hero Content */}
          <div className="absolute top-[56px] bottom-[67px] left-0 right-0 z-10 flex items-center justify-center pt-12">
            <div className="w-full max-w-[1440px] mx-auto px-[115px]">
              <div className="flex justify-between items-start">
                <span className="text-[36px] sm:text-[48px] font-medium text-white leading-[1.1] tracking-[-0.02em]">
                  See Your Ideas
                </span>
                <div className="text-center flex-1 px-8">
                  <p className="text-[15px] sm:text-[17px] text-white mb-3 leading-[1.3]">
                    From prototypes to custom parts,<br />upload your 3D files and print high-quality 3D parts.
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => setShowUploader(true)}
                    className="px-6 py-2 bg-white/20 text-white text-[14px] font-normal tracking-[0.28px] rounded-[2px] hover:bg-white/40 transition-all"
                  >
                    Get an Instant Quote
                  </button>
                </div>
                <span className="text-[36px] sm:text-[48px] font-medium text-white leading-[1.1] tracking-[-0.02em]">
                  Live in 3D!!!
                </span>
              </div>
            </div>
          </div>
        </>
      ) : !selectedFile ? (
        /* 3D Upload Screen - FileUpload modal */
        <>
          <div className="absolute inset-0 z-0">
            <ModelViewer
              fileUrl=""
              fileName=""
              onModelLoaded={() => { }}
            />
          </div>
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <FileUpload key={Date.now()} onFileSelect={handleFileSelect} />
            </div>
          </div>
        </>
      ) : (
        /* Configurator State - Sidebar + Viewer layout */
        <div className="relative h-full">
          {/* Absolutely positioned Configurator Sidebar */}
          <div className="absolute left-0 top-4 z-10">
            <ConfiguratorSidebar
              ref={sidebarRef}
              fileName={selectedFile.name}
              file={selectedFile.file}
              modelInfo={modelInfo}
              initialConfig={initialConfig}
              initialSliceResults={initialSliceResults}
              initialFileId={initialFileId}
              onChangeFile={(file: File) => {
                // Clean up old URL
                if (selectedFile?.url) {
                  URL.revokeObjectURL(selectedFile.url);
                }
                const url = URL.createObjectURL(file);
                setSelectedFile({ url, name: file.name, file });
                // Don't reset modelInfo or sliceResults - ConfiguratorSidebar already has new data
                setLoadedDraftId(null); // Clear draft since file changed
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

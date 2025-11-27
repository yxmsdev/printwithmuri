'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import ModelLoader from './ModelLoader';
import ViewerControls from './ViewerControls';
import AxisLabels from './AxisLabels';
import { ModelInfo } from '@/types';

// Custom axes helper with colors matching the UI labels (Z up = blue, Y depth = green)
function CustomAxesHelper({ size = 5 }: { size?: number }) {
  return (
    <group>
      {/* X axis - Red (pointing right) */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, size, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#E53935" linewidth={2} />
      </line>
      {/* Three.js Y axis (up) - Blue to represent Z in UI */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, size, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#1E88E5" linewidth={2} />
      </line>
      {/* Three.js Z axis (depth) - Green to represent Y in UI */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 0, size])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#43A047" linewidth={2} />
      </line>
    </group>
  );
}

interface ModelViewerProps {
  fileUrl: string;
  fileName: string;
  onModelLoaded?: (modelInfo: ModelInfo) => void;
}

export default function ModelViewer({
  fileUrl,
  fileName,
  onModelLoaded
}: ModelViewerProps) {
  const hasModel = Boolean(fileUrl && fileUrl !== '');

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#EDEDED]">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[20, 4, 25]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.3} />

        {/* Grid and Axes */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.8}
          cellColor="#d8d8d8"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#b8b8b8"
          fadeDistance={50}
          fadeStrength={1}
          infiniteGrid
        />

        {/* XYZ Axis Helper - with matching colors */}
        <CustomAxesHelper size={5} />

        {/* 3D Model */}
        <Suspense fallback={null}>
          <ModelLoader
            fileUrl={fileUrl}
            fileName={fileName}
            onModelLoaded={onModelLoaded}
          />
        </Suspense>

        {/* Camera Controls - Only enabled when model is loaded */}
        {hasModel && (
          <OrbitControls
            enableDamping
            dampingFactor={0.2}
            minDistance={5}
            maxDistance={50}
            makeDefault
          />
        )}
      </Canvas>

      {/* Viewer Controls Overlay */}
      <ViewerControls />

      {/* Axis Labels */}
      <AxisLabels />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { parseSTL, parseOBJ } from '@/lib/model-parser';
import { ModelInfo } from '@/types';

interface ModelLoaderProps {
  fileUrl: string;
  fileName: string;
  onModelLoaded?: (modelInfo: ModelInfo) => void;
}

export default function ModelLoader({
  fileUrl,
  fileName,
  onModelLoaded
}: ModelLoaderProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [modelHeight, setModelHeight] = useState<number>(0);
  const loadedUrlRef = useRef<string | null>(null); // Track which URL we've already loaded
  const { invalidate } = useThree();

  // Memoize the callback to prevent re-renders
  const handleModelLoaded = useCallback((modelInfo: ModelInfo) => {
    if (onModelLoaded) {
      onModelLoaded(modelInfo);
    }
  }, [onModelLoaded]);

  useEffect(() => {
    if (!fileUrl || fileUrl === '') return;
    
    // Prevent reloading the same file
    if (loadedUrlRef.current === fileUrl) return;

    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    async function loadModel() {
      try {
        if (fileExtension === 'stl') {
          // Load STL
          const response = await fetch(fileUrl);
          const buffer = await response.arrayBuffer();

          const loader = new STLLoader();
          const loadedGeometry = loader.parse(buffer);

          // Parse model info - only call once per URL
          const modelInfo = await parseSTL(buffer);
          handleModelLoaded(modelInfo);

          setGeometry(loadedGeometry);
          loadedUrlRef.current = fileUrl; // Mark as loaded
          invalidate(); // Trigger render for on-demand mode
        } else if (fileExtension === 'obj') {
          // Load OBJ
          const response = await fetch(fileUrl);
          const text = await response.text();

          const loader = new OBJLoader();
          const object = loader.parse(text);

          // Parse model info - only call once per URL
          const modelInfo = await parseOBJ(text);
          handleModelLoaded(modelInfo);

          // Extract geometry from object
          let combinedGeometry = new THREE.BufferGeometry();
          object.traverse((child) => {
            if (child instanceof THREE.Mesh && child.geometry) {
              // Merge geometries if there are multiple meshes
              const clonedGeometry = child.geometry.clone();
              clonedGeometry.applyMatrix4(child.matrixWorld);

              if (!combinedGeometry.attributes.position) {
                combinedGeometry = clonedGeometry;
              } else {
                // Simple merge by concatenating attributes
                const positions1 = combinedGeometry.attributes.position.array;
                const positions2 = clonedGeometry.attributes.position.array;
                const newPositions = new Float32Array(positions1.length + positions2.length);
                newPositions.set(positions1);
                newPositions.set(positions2, positions1.length);
                combinedGeometry.setAttribute(
                  'position',
                  new THREE.BufferAttribute(newPositions, 3)
                );
              }
            }
          });

          setGeometry(combinedGeometry);
          loadedUrlRef.current = fileUrl; // Mark as loaded
          invalidate(); // Trigger render for on-demand mode
        } else if (fileExtension === '3mf') {
          // 3MF support - placeholder for now
          // You may need to use three-3mf-loader or implement custom loader
          console.warn('3MF format support coming soon');
        }
      } catch (error) {
        console.error('Error loading model:', error);
      }
    }

    loadModel();
  }, [fileUrl, fileName, handleModelLoaded, invalidate]);

  // Center and auto-scale model when geometry loads
  useEffect(() => {
    if (!geometry || !meshRef.current) return;

    geometry.computeBoundingBox();
    geometry.computeVertexNormals();

    const boundingBox = geometry.boundingBox!;
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // Center the geometry
    geometry.translate(-center.x, -center.y, -center.z);

    // Calculate size and scale
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 8; // Target size in scene units

    const scale = targetSize / maxDim;
    meshRef.current.scale.setScalar(scale);

    // Store the scaled height (Z dimension becomes height after rotation)
    setModelHeight((size.z / 2) * scale);
    
    // Trigger re-render after model is positioned
    invalidate();

  }, [geometry, invalidate]);

  if (!geometry) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      castShadow
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, modelHeight, 0]}
    >
      <meshStandardMaterial
        color="#E91E8C"
        roughness={0.3}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { ModelInfo } from '@/types';

/**
 * Calculate geometry metrics from a Three.js BufferGeometry
 */
function calculateGeometryMetrics(geometry: THREE.BufferGeometry): ModelInfo {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;

  const dimensions = {
    length: box.max.x - box.min.x,
    width: box.max.y - box.min.y,
    height: box.max.z - box.min.z,
  };

  // Calculate volume using signed tetrahedron method
  const position = geometry.getAttribute('position');
  let volume = 0;
  let surfaceArea = 0;
  const triangleCount = position.count / 3;

  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();

  for (let i = 0; i < position.count; i += 3) {
    vA.fromBufferAttribute(position, i);
    vB.fromBufferAttribute(position, i + 1);
    vC.fromBufferAttribute(position, i + 2);

    // Signed volume of tetrahedron with origin
    const crossProduct = new THREE.Vector3().crossVectors(vB, vC);
    volume += vA.dot(crossProduct) / 6;

    // Triangle area
    const ab = new THREE.Vector3().subVectors(vB, vA);
    const ac = new THREE.Vector3().subVectors(vC, vA);
    const cross = new THREE.Vector3().crossVectors(ab, ac);
    surfaceArea += cross.length() / 2;
  }

  return {
    volume: Math.abs(volume),
    surfaceArea,
    dimensions,
    triangleCount,
    isManifold: volume > 0, // Negative volume indicates inverted normals
  };
}

/**
 * Parse an STL file and extract model information
 */
export async function parseSTL(buffer: ArrayBuffer): Promise<ModelInfo> {
  const loader = new STLLoader();
  const geometry = loader.parse(buffer);
  return calculateGeometryMetrics(geometry);
}

/**
 * Parse an OBJ file and extract model information
 */
export async function parseOBJ(text: string): Promise<ModelInfo> {
  const loader = new OBJLoader();
  const object = loader.parse(text);

  // Combine all meshes into one geometry
  let combinedGeometry = new THREE.BufferGeometry();
  let hasGeometry = false;

  object.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      hasGeometry = true;
      const clonedGeometry = child.geometry.clone();
      clonedGeometry.applyMatrix4(child.matrixWorld);

      if (!combinedGeometry.attributes.position) {
        combinedGeometry = clonedGeometry;
      } else {
        // Merge geometries
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

  if (!hasGeometry) {
    throw new Error('No valid geometry found in OBJ file');
  }

  return calculateGeometryMetrics(combinedGeometry);
}

/**
 * Estimate the weight of a printed model in grams
 */
export function estimateWeight(
  modelInfo: ModelInfo,
  material: 'PLA' | 'PETG' | 'ABS' | 'Resin',
  infillDensity: number // 5-100 percentage
): number {
  const MATERIAL_DENSITIES = {
    PLA: 1.24,
    PETG: 1.27,
    ABS: 1.04,
    Resin: 1.10,
  };

  // Typical shell is about 15% of total volume for standard prints
  const SHELL_PERCENTAGE = 0.15;

  const { volume } = modelInfo;
  const infillDecimal = infillDensity / 100;

  // Convert mm³ to cm³
  const volumeCm3 = volume / 1000;

  // Shell volume is a fixed percentage (walls + top/bottom layers)
  const shellVolumeCm3 = volumeCm3 * SHELL_PERCENTAGE;

  // Interior volume for infill
  const interiorVolumeCm3 = volumeCm3 * (1 - SHELL_PERCENTAGE);
  const infillVolumeCm3 = interiorVolumeCm3 * infillDecimal;

  // Total effective volume
  const effectiveVolumeCm3 = shellVolumeCm3 + infillVolumeCm3;

  // Weight = volume × density
  const density = MATERIAL_DENSITIES[material];
  const weight = effectiveVolumeCm3 * density;

  return Math.round(weight * 10) / 10; // Round to 1 decimal
}

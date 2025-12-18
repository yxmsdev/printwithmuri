'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface InfiniteImageGalleryProps {
  images: string[];
  delay?: number; // milliseconds between each step
}

const InfiniteImageGallery: React.FC<InfiniteImageGalleryProps> = ({
  images,
  delay = 3000, // 3 seconds between each shift
}) => {
  const [step, setStep] = useState(0);

  // Image dimensions
  const imageWidth = 330;
  const imageHeight = 412;

  // Arc parameters
  const arcRadius = 1600;
  const angleSpacing = 14; // degrees between each image
  const visibleRange = 40; // degrees from center that are visible

  // Step animation - move one image at a time with delay
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => prev + 1);
    }, delay);

    return () => clearInterval(interval);
  }, [delay]);

  // Calculate position on arc
  const calculatePosition = (angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = Math.sin(angleRad) * arcRadius;
    const y = arcRadius - Math.cos(angleRad) * arcRadius;
    return { x, y, rotation: angleDeg };
  };

  // Generate all images with their current positions
  const getVisibleImages = () => {
    const result = [];
    const totalImages = images.length;
    const angleOffset = (step * angleSpacing) % (totalImages * angleSpacing);

    for (let i = 0; i < totalImages; i++) {
      const baseAngle = i * angleSpacing;
      let currentAngle = baseAngle - angleOffset;

      // Wrap around for infinite loop
      const totalAngleSpan = totalImages * angleSpacing;
      while (currentAngle < -visibleRange - angleSpacing) {
        currentAngle += totalAngleSpan;
      }
      while (currentAngle > visibleRange + angleSpacing) {
        currentAngle -= totalAngleSpan;
      }

      // Only render if within visible range (plus buffer for transition)
      if (currentAngle >= -visibleRange - angleSpacing && currentAngle <= visibleRange + angleSpacing) {
        const pos = calculatePosition(currentAngle);
        result.push({
          src: images[i],
          index: i,
          angle: currentAngle,
          ...pos,
        });
      }
    }

    return result;
  };

  const visibleImages = getVisibleImages();

  // Container height
  const maxY = arcRadius - Math.cos((visibleRange * Math.PI) / 180) * arcRadius;
  const containerHeight = imageHeight + maxY + 40;

  return (
    <div
      className="relative w-full"
      style={{ height: containerHeight }}
    >
      <div
        className="absolute left-1/2"
        style={{ transform: 'translateX(-50%)', top: 0, height: '100%' }}
      >
        {visibleImages.map((item) => {
          const isCenter = Math.abs(item.angle) < angleSpacing / 2;
          const distanceFromCenter = Math.abs(item.angle) / visibleRange;

          return (
            <div
              key={`image-${item.index}`}
              className="absolute transition-all duration-1000 ease-in-out"
              style={{
                width: imageWidth,
                height: imageHeight,
                left: item.x - imageWidth / 2,
                top: item.y,
                transform: `rotate(${item.rotation}deg)`,
                transformOrigin: 'center bottom',
                zIndex: Math.round(10 - distanceFromCenter * 10),
              }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-[2px]">
                <Image
                  src={item.src}
                  alt={`Gallery image ${item.index + 1}`}
                  fill
                  className="object-cover"
                  sizes="330px"
                  priority={isCenter}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfiniteImageGallery;

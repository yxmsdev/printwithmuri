'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const tooltipWidth = 200;
      const tooltipHeight = tooltipRect.height;
      const gap = 8;

      // Position tooltip above the trigger
      const top = triggerRect.top - tooltipHeight - gap;

      // Calculate horizontal position
      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      let left = triggerCenter - tooltipWidth / 2;
      let arrowLeft = tooltipWidth / 2;

      // Adjust if tooltip would overflow left edge
      if (left < 10) {
        arrowLeft = triggerCenter - 10;
        left = 10;
      }

      // Adjust if tooltip would overflow right edge
      if (left + tooltipWidth > window.innerWidth - 10) {
        const overflow = (left + tooltipWidth) - (window.innerWidth - 10);
        left -= overflow;
        arrowLeft += overflow;
      }

      setTooltipStyle({
        top: `${Math.max(10, top)}px`,
        left: `${left}px`,
      });

      setArrowStyle({
        left: `${arrowLeft}px`,
      });
    }
  }, [isVisible]);

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center cursor-help focus:outline-none"
        aria-label="More information"
      >
        {children || (
          <Image
            src="/images/icons/info.svg"
            alt="Info"
            width={12}
            height={12}
            className="opacity-60 hover:opacity-100 transition-opacity"
          />
        )}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-3 py-2 text-[12px] leading-[1.4] text-white bg-[#1F1F1F] rounded-[2px] shadow-lg w-[200px] pointer-events-none"
          style={{
            ...tooltipStyle,
            animation: 'tooltipFadeIn 0.2s ease-out forwards'
          }}
        >
          {content}

          {/* Arrow */}
          <div
            className="absolute bottom-[-4px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#1F1F1F]"
            style={arrowStyle}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Tooltip;

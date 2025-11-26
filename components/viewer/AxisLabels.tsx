export default function AxisLabels() {
  return (
    <div className="absolute bottom-4 right-4 pointer-events-none">
      <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
        {/* Origin circle */}
        <circle cx="25" cy="60" r="3" fill="#888" />
        
        {/* X axis - Red (pointing right) */}
        <line x1="25" y1="60" x2="70" y2="60" stroke="#E53935" strokeWidth="2" strokeLinecap="round"/>
        <polygon points="70,60 63,57 63,63" fill="#E53935"/>
        {/* X Label */}
        <text x="78" y="64" fontSize="12" fontWeight="bold" fill="#E53935">X</text>
        
        {/* Z axis - Blue (pointing up) */}
        <line x1="25" y1="60" x2="25" y2="15" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round"/>
        <polygon points="25,15 22,22 28,22" fill="#1E88E5"/>
        {/* Z Label */}
        <text x="21" y="10" fontSize="12" fontWeight="bold" fill="#1E88E5">Z</text>
        
        {/* Y axis - Green (pointing down-left) */}
        <line x1="25" y1="60" x2="8" y2="77" stroke="#43A047" strokeWidth="2" strokeLinecap="round"/>
        <polygon points="8,77 15,74 12,71" fill="#43A047"/>
        {/* Y Label */}
        <text x="2" y="90" fontSize="12" fontWeight="bold" fill="#43A047">Y</text>
      </svg>
    </div>
  );
}

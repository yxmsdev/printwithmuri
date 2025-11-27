'use client';

export default function ViewerControls() {
  return (
    <div className="absolute bottom-6 right-[130px] z-10 text-[10px] text-[#8D8D8D] flex items-center">
      <ul className="space-y-0.5 text-right">
        <li><span className="font-medium">Rotate:</span> Left click + drag</li>
        <li><span className="font-medium">Pan:</span> Right click + drag</li>
        <li><span className="font-medium">Zoom:</span> Scroll wheel</li>
      </ul>
    </div>
  );
}

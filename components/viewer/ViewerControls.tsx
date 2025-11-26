'use client';

export default function ViewerControls() {
  return (
    <div className="absolute top-4 right-4 z-10 text-[10px] text-gray-500">
      <ul className="space-y-0.5 text-right">
        <li><span className="font-medium">Rotate:</span> Left click + drag</li>
        <li><span className="font-medium">Pan:</span> Right click + drag</li>
        <li><span className="font-medium">Zoom:</span> Scroll wheel</li>
      </ul>
    </div>
  );
}

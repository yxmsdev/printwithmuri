'use client';

interface UserTypeSelectorProps {
  value: 'business' | 'creator';
  onChange: (value: 'business' | 'creator') => void;
}

export default function UserTypeSelector({ value, onChange }: UserTypeSelectorProps) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label className="text-[10px] font-medium text-[#8D8D8D] tracking-[-0.2px] leading-[1.8]">
        Are you a
      </label>
      <div className="flex gap-[12px]">
        {/* Business Button */}
        <button
          type="button"
          onClick={() => onChange('business')}
          className={`
            flex-1 flex items-center justify-center gap-[4px]
            rounded-[2px] px-[8px] py-[8px]
            text-[14px] font-medium tracking-[-0.28px] leading-[1.8]
            transition-all border border-transparent hover:border-[#F4008A]
            ${value === 'business'
              ? 'bg-[#EFEFEF] text-[#1F1F1F]'
              : 'bg-[#EFEFEF] text-[#8D8D8D]'
            }
          `}
        >
          {/* Checkbox Icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            {value === 'business' ? (
              // Selected: Square outline with filled pink circle inside (larger)
              <>
                <rect x="1" y="1" width="14" height="14" rx="2" stroke="#F4008A" strokeWidth="1" fill="none"/>
                <circle cx="8" cy="8" r="3.5" fill="#F4008A" className="transition-all duration-200"/>
              </>
            ) : (
              // Unselected: Square outline with smaller filled grey circle inside
              <>
                <rect x="1" y="1" width="14" height="14" rx="2" stroke="#8D8D8D" strokeWidth="1" fill="none"/>
                <circle cx="8" cy="8" r="2" fill="#8D8D8D" className="transition-all duration-200"/>
              </>
            )}
          </svg>
          <span>Business</span>
        </button>

        {/* Creator Button */}
        <button
          type="button"
          onClick={() => onChange('creator')}
          className={`
            flex-1 flex items-center justify-center gap-[4px]
            rounded-[2px] px-[8px] py-[8px]
            text-[14px] font-medium tracking-[-0.28px] leading-[1.8]
            transition-all border border-transparent hover:border-[#F4008A]
            ${value === 'creator'
              ? 'bg-[#EFEFEF] text-[#1F1F1F]'
              : 'bg-[#EFEFEF] text-[#8D8D8D]'
            }
          `}
        >
          {/* Checkbox Icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            {value === 'creator' ? (
              // Selected: Square outline with filled pink circle inside (larger)
              <>
                <rect x="1" y="1" width="14" height="14" rx="2" stroke="#F4008A" strokeWidth="1" fill="none"/>
                <circle cx="8" cy="8" r="3.5" fill="#F4008A" className="transition-all duration-200"/>
              </>
            ) : (
              // Unselected: Square outline with smaller filled grey circle inside
              <>
                <rect x="1" y="1" width="14" height="14" rx="2" stroke="#8D8D8D" strokeWidth="1" fill="none"/>
                <circle cx="8" cy="8" r="2" fill="#8D8D8D" className="transition-all duration-200"/>
              </>
            )}
          </svg>
          <span>Creator</span>
        </button>
      </div>
    </div>
  );
}

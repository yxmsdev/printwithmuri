import Image from 'next/image';

export default function AccountIcon() {
  return (
    <div className="w-[24px] h-[24px] relative cursor-pointer">
      <Image
        src="/images/account-icon.svg"
        alt="Account"
        fill
        className="object-contain"
      />
    </div>
  );
}

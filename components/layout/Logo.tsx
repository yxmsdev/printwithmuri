import Image from 'next/image';

export default function Logo() {
  return (
    <div className="h-[32.781px] w-[81.078px] relative">
      <Image
        src="/images/logo.svg"
        alt="Muri Press Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
